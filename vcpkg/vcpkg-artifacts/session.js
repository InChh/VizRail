"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = void 0;
const assert_1 = require("assert");
const crypto_1 = require("crypto");
const metadata_file_1 = require("./amf/metadata-file");
const artifact_1 = require("./artifacts/artifact");
const constants_1 = require("./constants");
const http_filesystem_1 = require("./fs/http-filesystem");
const local_filesystem_1 = require("./fs/local-filesystem");
const unified_filesystem_1 = require("./fs/unified-filesystem");
const vsix_local_filesystem_1 = require("./fs/vsix-local-filesystem");
const i18n_1 = require("./i18n");
const git_1 = require("./installers/git");
const nuget_1 = require("./installers/nuget");
const untar_1 = require("./installers/untar");
const unzip_1 = require("./installers/unzip");
const registries_1 = require("./registries/registries");
const channels_1 = require("./util/channels");
function hexsha(content) {
    return (0, crypto_1.createHash)('sha256').update(content, 'ascii').digest('hex');
}
function formatArtifactEntry(entry) {
    // we hash all the things to remove PII
    return `${hexsha(entry.registryUri)}:${hexsha(entry.id)}:${hexsha(entry.version)}`;
}
/**
 * The Session class is used to hold a reference to the
 * message channels,
 * the filesystems,
 * and any other 'global' data that should be kept.
 *
 */
class Session {
    context;
    settings;
    /** @internal */
    stopwatch = new channels_1.Stopwatch();
    fileSystem;
    channels;
    homeFolder;
    nextPreviousEnvironment;
    installFolder;
    registryFolder;
    telemetryFile;
    get vcpkgCommand() { return this.settings.vcpkgCommand; }
    globalConfig;
    downloads;
    currentDirectory;
    configuration;
    /** register installer functions here */
    installers = new Map([
        ['nuget', nuget_1.installNuGet],
        ['unzip', unzip_1.installUnZip],
        ['untar', untar_1.installUnTar],
        ['git', git_1.installGit]
    ]);
    registryDatabase = new registries_1.RegistryDatabase();
    globalRegistryResolver = new registries_1.RegistryResolver(this.registryDatabase);
    processVcpkgArg(argSetting, defaultName) {
        return argSetting ? this.fileSystem.file(argSetting) : this.homeFolder.join(defaultName);
    }
    constructor(currentDirectory, context, settings) {
        this.context = context;
        this.settings = settings;
        this.fileSystem = new unified_filesystem_1.UnifiedFileSystem(this).
            register('file', new local_filesystem_1.LocalFileSystem(this)).
            register('vsix', new vsix_local_filesystem_1.VsixLocalFilesystem(this)).
            register('https', new http_filesystem_1.HttpsFileSystem(this));
        this.channels = new channels_1.Channels(this);
        if (settings.telemetryFile) {
            this.telemetryFile = this.fileSystem.file(settings.telemetryFile);
        }
        this.homeFolder = this.fileSystem.file(settings.homeFolder);
        this.downloads = this.processVcpkgArg(settings.vcpkgDownloads, 'downloads');
        this.globalConfig = this.processVcpkgArg(settings.globalConfig, constants_1.configurationName);
        this.registryFolder = this.processVcpkgArg(settings.vcpkgRegistriesCache, 'registries').join('artifact');
        this.installFolder = this.processVcpkgArg(settings.vcpkgArtifactsRoot, 'artifacts');
        this.nextPreviousEnvironment = this.processVcpkgArg(settings.nextPreviousEnvironment, `previous-environment-${Date.now().toFixed()}.json`);
        this.currentDirectory = this.fileSystem.file(currentDirectory);
    }
    parseLocation(location) {
        // Drive letter, absolute Unix path, or drive-relative windows path, treat as a file
        if (/^[A-Za-z]:/.exec(location) || location.startsWith('/') || location.startsWith('\\')) {
            return this.fileSystem.file(location);
        }
        // Otherwise, it's a URI
        return this.fileSystem.parseUri(location);
    }
    async saveConfig() {
        await this.configuration?.save(this.globalConfig);
    }
    async init() {
        // load global configuration
        if (!await this.fileSystem.isDirectory(this.homeFolder)) {
            // let's create the folder
            try {
                await this.fileSystem.createDirectory(this.homeFolder);
            }
            catch (error) {
                // if this throws, let it
                this.channels.debug(error?.message);
            }
            // check if it got made, because at an absolute minimum, we need a folder, so failing this is catastrophic.
            assert_1.strict.ok(await this.fileSystem.isDirectory(this.homeFolder), (0, i18n_1.i) `Fatal: The root folder '${this.homeFolder.fsPath}' cannot be created`);
        }
        if (!await this.fileSystem.isFile(this.globalConfig)) {
            try {
                await this.globalConfig.writeUTF8(constants_1.defaultConfig);
            }
            catch {
                // if this throws, let it
            }
            // check if it got made, because at an absolute minimum, we need the config file, so failing this is catastrophic.
            assert_1.strict.ok(await this.fileSystem.isFile(this.globalConfig), (0, i18n_1.i) `Fatal: The global configuration file '${this.globalConfig.fsPath}' cannot be created`);
        }
        // got past the checks, let's load the configuration.
        this.configuration = await metadata_file_1.MetadataFile.parseMetadata(this.globalConfig.fsPath, this.globalConfig, this);
        this.channels.debug(`Loaded global configuration file '${this.globalConfig.fsPath}'`);
        // load the registries
        for (const [name, regDef] of this.configuration.registries) {
            const loc = regDef.location.get(0);
            if (loc) {
                const uri = this.parseLocation(loc);
                const reg = await this.registryDatabase.loadRegistry(this, uri);
                this.globalRegistryResolver.add(uri, name);
                if (reg) {
                    this.channels.debug(`Loaded global manifest ${name} => ${uri.formatted}`);
                }
            }
        }
        return this;
    }
    async findProjectProfile(startLocation = this.currentDirectory) {
        let location = startLocation;
        const path = location.join(constants_1.configurationName);
        if (await this.fileSystem.isFile(path)) {
            return path;
        }
        location = location.join('..');
        return (location.toString() === startLocation.toString()) ? undefined : this.findProjectProfile(location);
    }
    async getInstalledArtifacts() {
        const result = new Array();
        if (!await this.installFolder.exists()) {
            return result;
        }
        for (const [folder, stat] of await this.installFolder.readDirectory(undefined, { recursive: true })) {
            try {
                const artifactJsonPath = folder.join('artifact.json');
                const metadata = await metadata_file_1.MetadataFile.parseMetadata(artifactJsonPath.fsPath, artifactJsonPath, this);
                result.push({
                    folder,
                    id: metadata.id,
                    artifact: await new artifact_1.InstalledArtifact(this, metadata)
                });
            }
            catch {
                // not a valid install.
            }
        }
        return result;
    }
    /** returns an installer function (or undefined) for a given installerkind */
    artifactInstaller(installInfo) {
        return this.installers.get(installInfo.installerKind);
    }
    async openManifest(filename, uri) {
        return await metadata_file_1.MetadataFile.parseConfiguration(filename, await uri.readUTF8(), this);
    }
    #acquiredArtifacts = [];
    #activatedArtifacts = [];
    trackAcquire(registryUri, id, version) {
        this.#acquiredArtifacts.push({ registryUri: registryUri, id: id, version: version });
    }
    trackActivate(registryUri, id, version) {
        this.#activatedArtifacts.push({ registryUri: registryUri, id: id, version: version });
    }
    writeTelemetry() {
        const acquiredArtifacts = this.#acquiredArtifacts.map(formatArtifactEntry).join(',');
        const activatedArtifacts = this.#activatedArtifacts.map(formatArtifactEntry).join(',');
        const telemetryFile = this.telemetryFile;
        if (telemetryFile) {
            return telemetryFile.writeUTF8(JSON.stringify({
                'acquired_artifacts': acquiredArtifacts,
                'activated_artifacts': activatedArtifacts
            }));
        }
        return Promise.resolve(undefined);
    }
}
exports.Session = Session;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Vzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vbWljcm9zb2Z0L3ZjcGtnLXRvb2wvbWFpbi92Y3BrZy1hcnRpZmFjdHMvIiwic291cmNlcyI6WyJzZXNzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSx1Q0FBdUM7QUFDdkMsa0NBQWtDOzs7QUFFbEMsbUNBQWdDO0FBQ2hDLG1DQUFvQztBQUNwQyx1REFBbUQ7QUFDbkQsbURBQW1FO0FBQ25FLDJDQUErRDtBQUUvRCwwREFBdUQ7QUFDdkQsNERBQXdEO0FBQ3hELGdFQUE0RDtBQUM1RCxzRUFBaUU7QUFDakUsaUNBQTJCO0FBQzNCLDBDQUE4QztBQUM5Qyw4Q0FBa0Q7QUFDbEQsOENBQWtEO0FBQ2xELDhDQUFrRDtBQUdsRCx3REFBNkU7QUFDN0UsOENBQXNEO0FBNkN0RCxTQUFTLE1BQU0sQ0FBQyxPQUFlO0lBQzdCLE9BQU8sSUFBQSxtQkFBVSxFQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3JFLENBQUM7QUFFRCxTQUFTLG1CQUFtQixDQUFDLEtBQW9CO0lBQy9DLHVDQUF1QztJQUN2QyxPQUFPLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztBQUNyRixDQUFDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsTUFBYSxPQUFPO0lBZ0NvQztJQUFrQztJQS9CeEYsZ0JBQWdCO0lBQ1AsU0FBUyxHQUFHLElBQUksb0JBQVMsRUFBRSxDQUFDO0lBQzVCLFVBQVUsQ0FBYTtJQUN2QixRQUFRLENBQVc7SUFDbkIsVUFBVSxDQUFNO0lBQ2hCLHVCQUF1QixDQUFNO0lBQzdCLGFBQWEsQ0FB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
// SIG // Begin signature block
// SIG // MIInwAYJKoZIhvcNAQcCoIInsTCCJ60CAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // IxySJjyHbWOACJvbBUwgPibx1wpFSZ16sPk73VUyJ3eg
// SIG // gg12MIIF9DCCA9ygAwIBAgITMwAAA68wQA5Mo00FQQAA
// SIG // AAADrzANBgkqhkiG9w0BAQsFADB+MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBT
// SIG // aWduaW5nIFBDQSAyMDExMB4XDTIzMTExNjE5MDkwMFoX
// SIG // DTI0MTExNDE5MDkwMFowdDELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEeMBwGA1UEAxMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA
// SIG // zkvLNa2un9GBrYNDoRGkGv7d0PqtTBB4ViYakFbjuWpm
// SIG // F0KcvDAzzaCWJPhVgIXjz+S8cHEoHuWnp/n+UOljT3eh
// SIG // A8Rs6Lb1aTYub3tB/e0txewv2sQ3yscjYdtTBtFvEm9L
// SIG // 8Yv76K3Cxzi/Yvrdg+sr7w8y5RHn1Am0Ff8xggY1xpWC
// SIG // XFI+kQM18njQDcUqSlwBnexYfqHBhzz6YXA/S0EziYBu
// SIG // 2O2mM7R6gSyYkEOHgIGTVOGnOvvC5xBgC4KNcnQuQSRL
// SIG // iUI2CmzU8vefR6ykruyzt1rNMPI8OqWHQtSDKXU5JNqb
// SIG // k4GNjwzcwbSzOHrxuxWHq91l/vLdVDGDUwIDAQABo4IB
// SIG // czCCAW8wHwYDVR0lBBgwFgYKKwYBBAGCN0wIAQYIKwYB
// SIG // BQUHAwMwHQYDVR0OBBYEFEcccTTyBDxkjvJKs/m4AgEF
// SIG // hl7BMEUGA1UdEQQ+MDykOjA4MR4wHAYDVQQLExVNaWNy
// SIG // b3NvZnQgQ29ycG9yYXRpb24xFjAUBgNVBAUTDTIzMDAx
// SIG // Mis1MDE4MjYwHwYDVR0jBBgwFoAUSG5k5VAF04KqFzc3
// SIG // IrVtqMp1ApUwVAYDVR0fBE0wSzBJoEegRYZDaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9jcmwvTWlj
// SIG // Q29kU2lnUENBMjAxMV8yMDExLTA3LTA4LmNybDBhBggr
// SIG // BgEFBQcBAQRVMFMwUQYIKwYBBQUHMAKGRWh0dHA6Ly93
// SIG // d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY2VydHMvTWlj
// SIG // Q29kU2lnUENBMjAxMV8yMDExLTA3LTA4LmNydDAMBgNV
// SIG // HRMBAf8EAjAAMA0GCSqGSIb3DQEBCwUAA4ICAQCEsRbf
// SIG // 80dn60xTweOWHZoWaQdpzSaDqIvqpYHE5ZzuEMJWDdcP
// SIG // 72MGw8v6BSaJQ+a+hTCXdERnIBDPKvU4ENjgu4EBJocH
// SIG // lSe8riiZUAR+z+z4OUYqoFd3EqJyfjjOJBR2z94Dy4ss
// SIG // 7LEkHUbj2NZiFqBoPYu2OGQvEk+1oaUsnNKZ7Nl7FHtV
// SIG // 7CI2lHBru83e4IPe3glIi0XVZJT5qV6Gx/QhAFmpEVBj
// SIG // SAmDdgII4UUwuI9yiX6jJFNOEek6MoeP06LMJtbqA3Bq
// SIG // +ZWmJ033F97uVpyaiS4bj3vFI/ZBgDnMqNDtZjcA2vi4
// SIG // RRMweggd9vsHyTLpn6+nXoLy03vMeebq0C3k44pgUIEu
// SIG // PQUlJIRTe6IrN3GcjaZ6zHGuQGWgu6SyO9r7qkrEpS2p
// SIG // RjnGZjx2RmCamdAWnDdu+DmfNEPAddYjaJJ7PTnd+PGz
// SIG // G+WeH4ocWgVnm5fJFhItjj70CJjgHqt57e1FiQcyWCwB
// SIG // hKX2rGgN2UICHBF3Q/rsKOspjMw2OlGphTn2KmFl5J7c
// SIG // Qxru54A9roClLnHGCiSUYos/iwFHI/dAVXEh0S0KKfTf
// SIG // M6AC6/9bCbsD61QLcRzRIElvgCgaiMWFjOBL99pemoEl
// SIG // AHsyzG6uX93fMfas09N9YzA0/rFAKAsNDOcFbQlEHKiD
// SIG // T7mI20tVoCcmSIhJATCCB3owggVioAMCAQICCmEOkNIA
// SIG // AAAAAAMwDQYJKoZIhvcNAQELBQAwgYgxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xMjAwBgNVBAMTKU1pY3Jvc29mdCBSb290
// SIG // IENlcnRpZmljYXRlIEF1dGhvcml0eSAyMDExMB4XDTEx
// SIG // MDcwODIwNTkwOVoXDTI2MDcwODIxMDkwOVowfjELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEoMCYGA1UEAxMfTWljcm9zb2Z0
// SIG // IENvZGUgU2lnbmluZyBQQ0EgMjAxMTCCAiIwDQYJKoZI
// SIG // hvcNAQEBBQADggIPADCCAgoCggIBAKvw+nIQHC6t2G6q
// SIG // ghBNNLrytlghn0IbKmvpWlCquAY4GgRJun/DDB7dN2vG
// SIG // EtgL8DjCmQawyDnVARQxQtOJDXlkh36UYCRsr55JnOlo
// SIG // XtLfm1OyCizDr9mpK656Ca/XllnKYBoF6WZ26DJSJhIv
// SIG // 56sIUM+zRLdd2MQuA3WraPPLbfM6XKEW9Ea64DhkrG5k
// SIG // NXimoGMPLdNAk/jj3gcN1Vx5pUkp5w2+oBN3vpQ97/vj
// SIG // K1oQH01WKKJ6cuASOrdJXtjt7UORg9l7snuGG9k+sYxd
// SIG // 6IlPhBryoS9Z5JA7La4zWMW3Pv4y07MDPbGyr5I4ftKd
// SIG // gCz1TlaRITUlwzluZH9TupwPrRkjhMv0ugOGjfdf8NBS
// SIG // v4yUh7zAIXQlXxgotswnKDglmDlKNs98sZKuHCOnqWbs
// SIG // YR9q4ShJnV+I4iVd0yFLPlLEtVc/JAPw0XpbL9Uj43Bd
// SIG // D1FGd7P4AOG8rAKCX9vAFbO9G9RVS+c5oQ/pI0m8GLhE
// SIG // fEXkwcNyeuBy5yTfv0aZxe/CHFfbg43sTUkwp6uO3+xb
// SIG // n6/83bBm4sGXgXvt1u1L50kppxMopqd9Z4DmimJ4X7Iv
// SIG // hNdXnFy/dygo8e1twyiPLI9AN0/B4YVEicQJTMXUpUMv
// SIG // dJX3bvh4IFgsE11glZo+TzOE2rCIF96eTvSWsLxGoGyY
// SIG // 0uDWiIwLAgMBAAGjggHtMIIB6TAQBgkrBgEEAYI3FQEE
// SIG // AwIBADAdBgNVHQ4EFgQUSG5k5VAF04KqFzc3IrVtqMp1
// SIG // ApUwGQYJKwYBBAGCNxQCBAweCgBTAHUAYgBDAEEwCwYD
// SIG // VR0PBAQDAgGGMA8GA1UdEwEB/wQFMAMBAf8wHwYDVR0j
// SIG // BBgwFoAUci06AjGQQ7kUBU7h6qfHMdEjiTQwWgYDVR0f
// SIG // BFMwUTBPoE2gS4ZJaHR0cDovL2NybC5taWNyb3NvZnQu
// SIG // Y29tL3BraS9jcmwvcHJvZHVjdHMvTWljUm9vQ2VyQXV0
// SIG // MjAxMV8yMDExXzAzXzIyLmNybDBeBggrBgEFBQcBAQRS
// SIG // MFAwTgYIKwYBBQUHMAKGQmh0dHA6Ly93d3cubWljcm9z
// SIG // b2Z0LmNvbS9wa2kvY2VydHMvTWljUm9vQ2VyQXV0MjAx
// SIG // MV8yMDExXzAzXzIyLmNydDCBnwYDVR0gBIGXMIGUMIGR
// SIG // BgkrBgEEAYI3LgMwgYMwPwYIKwYBBQUHAgEWM2h0dHA6
// SIG // Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvZG9jcy9w
// SIG // cmltYXJ5Y3BzLmh0bTBABggrBgEFBQcCAjA0HjIgHQBM
// SIG // AGUAZwBhAGwAXwBwAG8AbABpAGMAeQBfAHMAdABhAHQA
// SIG // ZQBtAGUAbgB0AC4gHTANBgkqhkiG9w0BAQsFAAOCAgEA
// SIG // Z/KGpZjgVHkaLtPYdGcimwuWEeFjkplCln3SeQyQwWVf
// SIG // Liw++MNy0W2D/r4/6ArKO79HqaPzadtjvyI1pZddZYSQ
// SIG // fYtGUFXYDJJ80hpLHPM8QotS0LD9a+M+By4pm+Y9G6XU
// SIG // tR13lDni6WTJRD14eiPzE32mkHSDjfTLJgJGKsKKELuk
// SIG // qQUMm+1o+mgulaAqPyprWEljHwlpblqYluSD9MCP80Yr
// SIG // 3vw70L01724lruWvJ+3Q3fMOr5kol5hNDj0L8giJ1h/D
// SIG // Mhji8MUtzluetEk5CsYKwsatruWy2dsViFFFWDgycSca
// SIG // f7H0J/jeLDogaZiyWYlobm+nt3TDQAUGpgEqKD6CPxNN
// SIG // ZgvAs0314Y9/HG8VfUWnduVAKmWjw11SYobDHWM2l4bf
// SIG // 2vP48hahmifhzaWX0O5dY0HjWwechz4GdwbRBrF1HxS+
// SIG // YWG18NzGGwS+30HHDiju3mUv7Jf2oVyW2ADWoUa9WfOX
// SIG // pQlLSBCZgB/QACnFsZulP0V3HjXG0qKin3p6IvpIlR+r
// SIG // +0cjgPWe+L9rt0uX4ut1eBrs6jeZeRhL/9azI2h15q/6
// SIG // /IvrC4DqaTuv/DDtBEyO3991bWORPdGdVk5Pv4BXIqF4
// SIG // ETIheu9BCrE/+6jMpF3BoYibV3FWTkhFwELJm3ZbCoBI
// SIG // a/15n8G9bW1qyVJzEw16UM0xghmiMIIZngIBATCBlTB+
// SIG // MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3Rv
// SIG // bjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWlj
// SIG // cm9zb2Z0IENvcnBvcmF0aW9uMSgwJgYDVQQDEx9NaWNy
// SIG // b3NvZnQgQ29kZSBTaWduaW5nIFBDQSAyMDExAhMzAAAD
// SIG // rzBADkyjTQVBAAAAAAOvMA0GCWCGSAFlAwQCAQUAoIGu
// SIG // MBkGCSqGSIb3DQEJAzEMBgorBgEEAYI3AgEEMBwGCisG
// SIG // AQQBgjcCAQsxDjAMBgorBgEEAYI3AgEVMC8GCSqGSIb3
// SIG // DQEJBDEiBCAvrcOFAb7+KSxxj/ebjxdkSvpeMWMTLYez
// SIG // 61AjTrdWYzBCBgorBgEEAYI3AgEMMTQwMqAUgBIATQBp
// SIG // AGMAcgBvAHMAbwBmAHShGoAYaHR0cDovL3d3dy5taWNy
// SIG // b3NvZnQuY29tMA0GCSqGSIb3DQEBAQUABIIBAAgw71MQ
// SIG // MYBLCuDvD9ZG2bqS+k+ShyBoDJFAoWc9ojTNSWKCIG5N
// SIG // lRgmoKbU1l4q3U9puvDlV5eSFNdlnlUzz5yLXe4Ku/tI
// SIG // 6xDQSZZRQBlCQ8DxeGsQT/Xj8eHC3+Nr5hOXZhlVncV0
// SIG // 0REMkXdd07uij9JoSGzltHHFrVRGSP/qfnuUGpCSQ+Cq
// SIG // 73IFBDCObHCMunxkQpAfT7qZmhahhfAh4VeQwb0DY1z7
// SIG // mCVlDA0pD3msT4rQZWMCRWvlBgqmbTBhLFjS0fgfqUn4
// SIG // z0MS7QkbZhhfH8p1q4JrFYl3zMfyChseqRohaJknuaJJ
// SIG // +UlxwtJnf7lRIo+TiyHyfD3avs2hghcsMIIXKAYKKwYB
// SIG // BAGCNwMDATGCFxgwghcUBgkqhkiG9w0BBwKgghcFMIIX
// SIG // AQIBAzEPMA0GCWCGSAFlAwQCAQUAMIIBWQYLKoZIhvcN
// SIG // AQkQAQSgggFIBIIBRDCCAUACAQEGCisGAQQBhFkKAwEw
// SIG // MTANBglghkgBZQMEAgEFAAQgEcYicyL1jEZz80ux83FW
// SIG // IwHYwub3VxqtHqP8LB5HXW8CBmVnSKF2xxgTMjAyMzEy
// SIG // MTIxOTAzMzguOTEyWjAEgAIB9KCB2KSB1TCB0jELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMkTWljcm9zb2Z0
// SIG // IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1pdGVkMSYwJAYD
// SIG // VQQLEx1UaGFsZXMgVFNTIEVTTjpGQzQxLTRCRDQtRDIy
// SIG // MDElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAg
// SIG // U2VydmljZaCCEXswggcnMIIFD6ADAgECAhMzAAAB4pmZ
// SIG // lfHc4yDrAAEAAAHiMA0GCSqGSIb3DQEBCwUAMHwxCzAJ
// SIG // BgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAw
// SIG // DgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3Nv
// SIG // ZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29m
// SIG // dCBUaW1lLVN0YW1wIFBDQSAyMDEwMB4XDTIzMTAxMjE5
// SIG // MDcyNVoXDTI1MDExMDE5MDcyNVowgdIxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xLTArBgNVBAsTJE1pY3Jvc29mdCBJcmVs
// SIG // YW5kIE9wZXJhdGlvbnMgTGltaXRlZDEmMCQGA1UECxMd
// SIG // VGhhbGVzIFRTUyBFU046RkM0MS00QkQ0LUQyMjAxJTAj
// SIG // BgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZp
// SIG // Y2UwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoIC
// SIG // AQC1Y7WYVfpBZm/HCkKYNps4rA5USPe/Bm9mphr2wJgn
// SIG // dOCVRnk3v0BszPCm0KzA6Jewwu40tNyZHKz7FovVqVcL
// SIG // CHJEUPAJF9YnQRvR4cgrKQGr37r8+eZIZe26z0Mex/fV
// SIG // CW7BN8DJqZiWrD1qYBdOc2Zb6VkA1Cw3CGMpeZVyOB1W
// SIG // eTejEsVjvM8Fq+K/cZDJlF7OyAsQya+Wt/UknjwCUSMs
// SIG // 52iHNFs2ejBXE0cyyzcjwROCq1b9SxXfehTcQM8J3rUn
// SIG // j4PPBJkXs69k9x0xRJZ3iV8kGHemEO3giHO8pZVqGNNw
// SIG // hIPYIaK6falCnAVHxXEuFxJX9xkhEZ5cybCu7P2Rj1OH
// SIG // Wh09o1hqGIWtkAjppIIzpgRQqkBRcBZrD62Y+HkLM2Ma
// SIG // uHOB6j51LuIU+Gqqb1Gd6iDl23clONqTS/d3J9Kz005X
// SIG // jlLDkG4L5UXbYRQgXqcX2+p27Kd33GWjwX027V1WvJy0
// SIG // LjAgasn7Hm7qp28I/pR0H6iqYr6cneyglgAqI+/F1MGK
// SIG // stR8mJ0rU5nuE/byurtjvyk4X0TniR4koOOMphY/t+CH
// SIG // BRIT6IGirzTbE1ZuEG6qYQspJ68AcqqKwQix+m5ZUbST
// SIG // CcJruxkXU0LCMdhzCqqYRLaUptc97nwEnT64D4bECERZ
// SIG // B2RrooS9SY4+C7twmwJoWtJTqwIDAQABo4IBSTCCAUUw
// SIG // HQYDVR0OBBYEFESEDhHavu0HbJabSYgkTaV4CdoFMB8G
// SIG // A1UdIwQYMBaAFJ+nFV0AXmJdg/Tl0mWnG1M1GelyMF8G
// SIG // A1UdHwRYMFYwVKBSoFCGTmh0dHA6Ly93d3cubWljcm9z
// SIG // b2Z0LmNvbS9wa2lvcHMvY3JsL01pY3Jvc29mdCUyMFRp
// SIG // bWUtU3RhbXAlMjBQQ0ElMjAyMDEwKDEpLmNybDBsBggr
// SIG // BgEFBQcBAQRgMF4wXAYIKwYBBQUHMAKGUGh0dHA6Ly93
// SIG // d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY2VydHMvTWlj
// SIG // cm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUyMDIwMTAo
// SIG // MSkuY3J0MAwGA1UdEwEB/wQCMAAwFgYDVR0lAQH/BAww
// SIG // CgYIKwYBBQUHAwgwDgYDVR0PAQH/BAQDAgeAMA0GCSqG
// SIG // SIb3DQEBCwUAA4ICAQDkVEQxq1UU257pX7INnE7Msoe2
// SIG // F74VVOzWTJCEwEGLBRD1YL0r4gspa+Wqd5Gu+mM9Lf+p
// SIG // cbnMyOsO7V6vJ+FsVFIHI+cAIZzaK4Zw/JY2Km3JN+34
// SIG // IGCt/sBMC4T9Txgubb1ytMWKJlNZ1PpVzsvWUZ0oSPx2
// SIG // XRa8NrK4LbG1qMPTjLgA0uZYO6JK12tnWgjhp8bmg9SD
// SIG // vuuRO6r9jtFtLBo+wFnTozXaXsT67KS9ihHDjHiVZpJP
// SIG // ztIGp4Rc8xwJ1o7TVp3lNdVkOgcb/DqTdX2PcM0KIsnI
// SIG // LzjiTPd6HeeRBnl8XxfG6Hy1ZVBN8yIpKEnnfvLOtTQz
// SIG // /sfUTMmtpsCv2LNcXbw5WUx53SCrLH5rt77v2vgRX9ri
// SIG // KMnFU7wUKb/3a0SQ+vHqONNZpAkRZJsv/gZkJUa8dq2q
// SIG // agLuZNDXr/olHQVCpl/4jmime+b7kIO4QogQOcSJuWSF
// SIG // w0pV+O8MBWq9/wYE8J7TKva2ukEQHkv6P7mFpJr6rxPA
// SIG // Kt/EJioE4gZ1kkv7lT3GhxMgK58hYeRvqnghpi+ODHxJ
// SIG // xRIcXN7Gj5l4XujIUoAiBiVGQwO99+p0A/H5+Muud+C3
// SIG // pfi7k+ReWxbdJi8Hfh+RsRszm2Zpv3N6RFrR79boO3Uv
// SIG // w363HdbJ9hOIJOFtS9Y3UQWyvccJDJsGPgh2XjErwTCC
// SIG // B3EwggVZoAMCAQICEzMAAAAVxedrngKbSZkAAAAAABUw
// SIG // DQYJKoZIhvcNAQELBQAwgYgxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xMjAwBgNVBAMTKU1pY3Jvc29mdCBSb290IENlcnRp
// SIG // ZmljYXRlIEF1dGhvcml0eSAyMDEwMB4XDTIxMDkzMDE4
// SIG // MjIyNVoXDTMwMDkzMDE4MzIyNVowfDELMAkGA1UEBhMC
// SIG // VVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcT
// SIG // B1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jw
// SIG // b3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgUENBIDIwMTAwggIiMA0GCSqGSIb3DQEBAQUA
// SIG // A4ICDwAwggIKAoICAQDk4aZM57RyIQt5osvXJHm9DtWC
// SIG // 0/3unAcH0qlsTnXIyjVX9gF/bErg4r25PhdgM/9cT8dm
// SIG // 95VTcVrifkpa/rg2Z4VGIwy1jRPPdzLAEBjoYH1qUoNE
// SIG // t6aORmsHFPPFdvWGUNzBRMhxXFExN6AKOG6N7dcP2CZT
// SIG // fDlhAnrEqv1yaa8dq6z2Nr41JmTamDu6GnszrYBbfowQ
// SIG // HJ1S/rboYiXcag/PXfT+jlPP1uyFVk3v3byNpOORj7I5
// SIG // LFGc6XBpDco2LXCOMcg1KL3jtIckw+DJj361VI/c+gVV
// SIG // mG1oO5pGve2krnopN6zL64NF50ZuyjLVwIYwXE8s4mKy
// SIG // zbnijYjklqwBSru+cakXW2dg3viSkR4dPf0gz3N9QZpG
// SIG // dc3EXzTdEonW/aUgfX782Z5F37ZyL9t9X4C626p+Nuw2
// SIG // TPYrbqgSUei/BQOj0XOmTTd0lBw0gg/wEPK3Rxjtp+iZ
// SIG // fD9M269ewvPV2HM9Q07BMzlMjgK8QmguEOqEUUbi0b1q
// SIG // GFphAXPKZ6Je1yh2AuIzGHLXpyDwwvoSCtdjbwzJNmSL
// SIG // W6CmgyFdXzB0kZSU2LlQ+QuJYfM2BjUYhEfb3BvR/bLU
// SIG // HMVr9lxSUV0S2yW6r1AFemzFER1y7435UsSFF5PAPBXb
// SIG // GjfHCBUYP3irRbb1Hode2o+eFnJpxq57t7c+auIurQID
// SIG // AQABo4IB3TCCAdkwEgYJKwYBBAGCNxUBBAUCAwEAATAj
// SIG // BgkrBgEEAYI3FQIEFgQUKqdS/mTEmr6CkTxGNSnPEP8v
// SIG // BO4wHQYDVR0OBBYEFJ+nFV0AXmJdg/Tl0mWnG1M1Gely
// SIG // MFwGA1UdIARVMFMwUQYMKwYBBAGCN0yDfQEBMEEwPwYI
// SIG // KwYBBQUHAgEWM2h0dHA6Ly93d3cubWljcm9zb2Z0LmNv
// SIG // bS9wa2lvcHMvRG9jcy9SZXBvc2l0b3J5Lmh0bTATBgNV
// SIG // HSUEDDAKBggrBgEFBQcDCDAZBgkrBgEEAYI3FAIEDB4K
// SIG // AFMAdQBiAEMAQTALBgNVHQ8EBAMCAYYwDwYDVR0TAQH/
// SIG // BAUwAwEB/zAfBgNVHSMEGDAWgBTV9lbLj+iiXGJo0T2U
// SIG // kFvXzpoYxDBWBgNVHR8ETzBNMEugSaBHhkVodHRwOi8v
// SIG // Y3JsLm1pY3Jvc29mdC5jb20vcGtpL2NybC9wcm9kdWN0
// SIG // cy9NaWNSb29DZXJBdXRfMjAxMC0wNi0yMy5jcmwwWgYI
// SIG // KwYBBQUHAQEETjBMMEoGCCsGAQUFBzAChj5odHRwOi8v
// SIG // d3d3Lm1pY3Jvc29mdC5jb20vcGtpL2NlcnRzL01pY1Jv
// SIG // b0NlckF1dF8yMDEwLTA2LTIzLmNydDANBgkqhkiG9w0B
// SIG // AQsFAAOCAgEAnVV9/Cqt4SwfZwExJFvhnnJL/Klv6lwU
// SIG // tj5OR2R4sQaTlz0xM7U518JxNj/aZGx80HU5bbsPMeTC
// SIG // j/ts0aGUGCLu6WZnOlNN3Zi6th542DYunKmCVgADsAW+
// SIG // iehp4LoJ7nvfam++Kctu2D9IdQHZGN5tggz1bSNU5HhT
// SIG // dSRXud2f8449xvNo32X2pFaq95W2KFUn0CS9QKC/GbYS
// SIG // EhFdPSfgQJY4rPf5KYnDvBewVIVCs/wMnosZiefwC2qB
// SIG // woEZQhlSdYo2wh3DYXMuLGt7bj8sCXgU6ZGyqVvfSaN0
// SIG // DLzskYDSPeZKPmY7T7uG+jIa2Zb0j/aRAfbOxnT99kxy
// SIG // bxCrdTDFNLB62FD+CljdQDzHVG2dY3RILLFORy3BFARx
// SIG // v2T5JL5zbcqOCb2zAVdJVGTZc9d/HltEAY5aGZFrDZ+k
// SIG // KNxnGSgkujhLmm77IVRrakURR6nxt67I6IleT53S0Ex2
// SIG // tVdUCbFpAUR+fKFhbHP+CrvsQWY9af3LwUFJfn6Tvsv4
// SIG // O+S3Fb+0zj6lMVGEvL8CwYKiexcdFYmNcP7ntdAoGokL
// SIG // jzbaukz5m/8K6TT4JDVnK+ANuOaMmdbhIurwJ0I9JZTm
// SIG // dHRbatGePu1+oDEzfbzL6Xu/OHBE0ZDxyKs6ijoIYn/Z
// SIG // cGNTTY3ugm2lBRDBcQZqELQdVTNYs6FwZvKhggLXMIIC
// SIG // QAIBATCCAQChgdikgdUwgdIxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xLTArBgNVBAsTJE1pY3Jvc29mdCBJcmVsYW5kIE9w
// SIG // ZXJhdGlvbnMgTGltaXRlZDEmMCQGA1UECxMdVGhhbGVz
// SIG // IFRTUyBFU046RkM0MS00QkQ0LUQyMjAxJTAjBgNVBAMT
// SIG // HE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2WiIwoB
// SIG // ATAHBgUrDgMCGgMVABabmWn6dG56SXSIX4gdXfKU6IZv
// SIG // oIGDMIGApH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQG
// SIG // A1UEAxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIw
// SIG // MTAwDQYJKoZIhvcNAQEFBQACBQDpIumJMCIYDzIwMjMx
// SIG // MjEyMjIxNTM3WhgPMjAyMzEyMTMyMjE1MzdaMHcwPQYK
// SIG // KwYBBAGEWQoEATEvMC0wCgIFAOki6YkCAQAwCgIBAAIC
// SIG // AQUCAf8wBwIBAAICEiQwCgIFAOkkOwkCAQAwNgYKKwYB
// SIG // BAGEWQoEAjEoMCYwDAYKKwYBBAGEWQoDAqAKMAgCAQAC
// SIG // AwehIKEKMAgCAQACAwGGoDANBgkqhkiG9w0BAQUFAAOB
// SIG // gQBp0lLgI5h+Np8AlQxHt1ZTJg1IfnmHB41cuB05wNbF
// SIG // kY428KKKS38UkKzqZ1dPaWBe86+mX93G/bYJlneGs/YT
// SIG // 65BekzF93Da7lDcdajBjxIItU0+srBHknWmxYIdZGWuA
// SIG // I1k31FJxxws/iQkgpqDwl/+IXFnPilNzYz8nvX28STGC
// SIG // BA0wggQJAgEBMIGTMHwxCzAJBgNVBAYTAlVTMRMwEQYD
// SIG // VQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25k
// SIG // MR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24x
// SIG // JjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBD
// SIG // QSAyMDEwAhMzAAAB4pmZlfHc4yDrAAEAAAHiMA0GCWCG
// SIG // SAFlAwQCAQUAoIIBSjAaBgkqhkiG9w0BCQMxDQYLKoZI
// SIG // hvcNAQkQAQQwLwYJKoZIhvcNAQkEMSIEIM/RdrVBX3so
// SIG // 225IN8ETy/je9RrT1sjeUX8yZKA5YRETMIH6BgsqhkiG
// SIG // 9w0BCRACLzGB6jCB5zCB5DCBvQQgK4kqShD9JrjGwVBE
// SIG // zg6C+HeS1OiP247nCGZDiQiPf/8wgZgwgYCkfjB8MQsw
// SIG // CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQ
// SIG // MA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3Nv
// SIG // ZnQgVGltZS1TdGFtcCBQQ0EgMjAxMAITMwAAAeKZmZXx
// SIG // 3OMg6wABAAAB4jAiBCCKAC5FRHDSqlp4IJTEWtypAcC2
// SIG // PvdqwL6Tc8PxfzDquzANBgkqhkiG9w0BAQsFAASCAgCa
// SIG // XHkRqjnlXp88Ap0pYJSzOGxxGvYFOi8j64dUuWEwWGD7
// SIG // 6fU6xIKi0bCYdTtFUpe2AKabml8SpctKiyZdRRPu8TSC
// SIG // /RsYggjcJCelmLIWsZNbIcDkEwPwO6yeGrA7KUYTWL1c
// SIG // t7ybCrNK3hDX8ASbOYC8IF5wx0DehdfDD3DlsCpd9+Fd
// SIG // R+f/gqFa5hcY659WFJHNUrWTwuN3WTl0X+SN7fzHqFd8
// SIG // ExVXGuhUcNBiHeHkgbRSYGI064v/jNbeN1yfFL5pWXBm
// SIG // vac2UH7bRrgA337coNQAYg23PuHARiwezoIMhL7EyzOQ
// SIG // cIivJINrOeeN9EwMT5XLM3DatQQ1a91V0qWs1BkeYDYJ
// SIG // JZ4FfxLD92/II0GdGMWvLlNTW/BSFk1wTsqQg+pFUVG8
// SIG // tACUOMxvmJWXPILwWhLVjPtccF59n6NPTkusP/wVusBF
// SIG // UDHz7p1SDqPjPJJd1dgnjLDm8i1ePgLG8hKCdKkVYISu
// SIG // VAZsMtQyc7rpquILCEyRYM653XBWZhIZv8yZGAdG6EPD
// SIG // gZmlJ0KPyNSEgtEn5iVv/omEyMMm5L9dQ7MVh/K1Zf2E
// SIG // rw+l2DngJXpkyyuHXBJyYS+YJIgSrd7wYH8U8muWISf6
// SIG // TEuil/tUUAT+d4EmM3jibZo5GagSf7ybm2Sx1f8xIjn1
// SIG // 5ze99FfdE9KSc5bGUgQnCA==
// SIG // End signature block
