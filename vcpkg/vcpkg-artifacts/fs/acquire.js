"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.acquireNugetFile = exports.resolveNugetUrl = exports.acquireArtifactFile = void 0;
const assert_1 = require("assert");
const i18n_1 = require("../i18n");
const exceptions_1 = require("../util/exceptions");
const vcpkg_1 = require("../vcpkg");
async function acquireArtifactFile(session, uris, outputFilename, events, options) {
    await session.downloads.createDirectory();
    session.channels.debug(`Acquire file '${outputFilename}' from [${uris.map(each => each.toString()).join(',')}]`);
    // is the file present on a local filesystem?
    for (const uri of uris) {
        if (uri.isLocal) {
            // we have a local file
            if (options?.algorithm && options?.value) {
                // we have a hash.
                // is it valid?
                if (await uri.hashValid(events, options)) {
                    session.channels.debug(`Local file matched hash: ${uri.fsPath}`);
                    return uri;
                }
            }
            else if (await uri.exists()) {
                // we don't have a hash, but the file is local, and it exists.
                // we have to return it
                session.channels.debug(`Using local file (no hash, unable to verify): ${uri.fsPath}`);
                return uri;
            }
            // do we have a filename
        }
    }
    // we don't have a local file
    // https is all that we know at the moment.
    const webUris = uris.where(each => each.isHttps);
    if (webUris.length === 0) {
        // wait, no web uris?
        throw new exceptions_1.RemoteFileUnavailable(uris);
    }
    return https(session, webUris, outputFilename, events, options);
}
exports.acquireArtifactFile = acquireArtifactFile;
/** */
async function https(session, uris, outputFilename, events, options) {
    session.channels.debug(`Attempting to download file '${outputFilename}' from [${uris.map(each => each.toString()).join(',')}]`);
    const hashAlgorithm = options?.algorithm;
    const outputFile = session.downloads.join(outputFilename);
    if (options?.force) {
        session.channels.debug(`Acquire '${outputFilename}': force specified, forcing download`);
        // is force specified; delete the current file
        await outputFile.delete();
    }
    else if (hashAlgorithm) {
        // does it match a hash that we have?
        if (await outputFile.hashValid(events, options)) {
            session.channels.debug(`Acquire '${outputFilename}': local file hash matches metdata`);
            // yes it does. let's just return done.
            return outputFile;
        }
        // invalid hash, deleting file
        session.channels.debug(`Acquire '${outputFilename}': local file hash mismatch, redownloading`);
        await outputFile.delete();
    }
    else if (await outputFile.exists()) {
        session.channels.debug(`Acquire '${outputFilename}': skipped due to existing file, no hash known`);
        session.channels.warning((0, i18n_1.i) `Assuming '${outputFilename}' is correct; supply a hash in the artifact metadata to suppress this message.`);
        return outputFile;
    }
    session.channels.debug(`Acquire '${outputFilename}': checking remote connections`);
    events.downloadStart?.(uris, outputFile.fsPath);
    let sha512 = undefined;
    if (hashAlgorithm == 'sha512') {
        sha512 = options?.value;
    }
    await (0, vcpkg_1.vcpkgDownload)(session, outputFile.fsPath, sha512, uris, events);
    events.downloadComplete?.();
    // we've downloaded the file, let's see if it matches the hash we have.
    if (hashAlgorithm == 'sha512') {
        // vcpkg took care of it already
        session.channels.debug(`Acquire '${outputFilename}': vcpkg checked SHA512`);
    }
    else if (hashAlgorithm) {
        session.channels.debug(`Acquire '${outputFilename}': checking downloaded file hash`);
        // does it match the hash that we have?
        if (!await outputFile.hashValid(events, options)) {
            await outputFile.delete();
            throw new Error((0, i18n_1.i) `Downloaded file '${outputFile.fsPath}' did not have the correct hash (${options.algorithm}: ${options.value}) `);
        }
        session.channels.debug(`Acquire '${outputFilename}': downloaded file hash matches specified hash`);
    }
    session.channels.debug(`Acquire '${outputFilename}': downloading file successful`);
    return outputFile;
}
async function resolveNugetUrl(session, pkg) {
    const [, name, version] = pkg.match(/^(.*)\/(.*)$/) ?? [];
    assert_1.strict.ok(version, (0, i18n_1.i) `package reference '${pkg}' is not a valid nuget package reference ({name}/{version})`);
    // let's resolve the redirect first, since nuget servers don't like us getting HEAD data on the targets via a redirect.
    // even if this wasn't the case, this is lower cost now rather than later.
    return session.fileSystem.parseUri(`https://www.nuget.org/api/v2/package/${name}/${version}`);
}
exports.resolveNugetUrl = resolveNugetUrl;
async function acquireNugetFile(session, pkg, outputFilename, events, options) {
    return https(session, [await resolveNugetUrl(session, pkg)], outputFilename, events, options);
}
exports.acquireNugetFile = acquireNugetFile;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNxdWlyZS5qcyIsInNvdXJjZVJvb3QiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vbWljcm9zb2Z0L3ZjcGtnLXRvb2wvbWFpbi92Y3BrZy1hcnRpZmFjdHMvIiwic291cmNlcyI6WyJmcy9hY3F1aXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSx1Q0FBdUM7QUFDdkMsa0NBQWtDOzs7QUFFbEMsbUNBQWdDO0FBQ2hDLGtDQUE0QjtBQUc1QixtREFBMkQ7QUFHM0Qsb0NBQXlDO0FBT2xDLEtBQUssVUFBVSxtQkFBbUIsQ0FBQyxPQUFnQixFQUFFLElBQWdCLEVBQUUsY0FBc0IsRUFBRSxNQUErQixFQUFFLE9BQXdCO0lBQzdKLE1BQU0sT0FBTyxDQUFDLFNBQVMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUMxQyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsY0FBYyxXQUFXLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRWpILDZDQUE2QztJQUM3QyxLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRTtRQUN0QixJQUFJLEdBQUcsQ0FBQyxPQUFPLEVBQUU7WUFDZix1QkFBdUI7WUFFdkIsSUFBSSxPQUFPLEVBQUUsU0FBUyxJQUFJLE9BQU8sRUFBRSxLQUFLLEVBQUU7Z0JBQ3hDLGtCQUFrQjtnQkFDbEIsZUFBZTtnQkFDZixJQUFJLE1BQU0sR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLEVBQUU7b0JBQ3hDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLDRCQUE0QixHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztvQkFDakUsT0FBTyxHQUFHLENBQUM7aUJBQ1o7YUFDRjtpQkFBTSxJQUFJLE1BQU0sR0FBRyxDQUFD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
// SIG // Begin signature block
// SIG // MIInywYJKoZIhvcNAQcCoIInvDCCJ7gCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // 7G5VgON4qV6D2XpxPnsUwJnXH+md8365zbmM3O8ubX6g
// SIG // gg2FMIIGAzCCA+ugAwIBAgITMwAAA64tNVHIU49VHQAA
// SIG // AAADrjANBgkqhkiG9w0BAQsFADB+MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBT
// SIG // aWduaW5nIFBDQSAyMDExMB4XDTIzMTExNjE5MDg1OVoX
// SIG // DTI0MTExNDE5MDg1OVowdDELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEeMBwGA1UEAxMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA
// SIG // 9CD8pjY3wxCoPmMhOkow7ycCltfqYnqk4wGNApzh2dTY
// SIG // +YqxozWTzJUOB38VxsgFQmXBFhOMdrGYGpvO9kdbNPkw
// SIG // HpTrW6hZqFuLLiRwGKEx4ZM5zVSqbHJuX2fPfUJ0Xmb+
// SIG // VrVsGw/BwBV2zz0rVtiSgqj3GeeGOsG7llfWyrSjyJqm
// SIG // 5DHE3o04BAI/NuhkHOv04euiqJGvHFCL8+fXvyD9OAxq
// SIG // 4fcJKtoyBb0PBA3oMNQeCsiUyLO+voZqVTOUsAWY0bN5
// SIG // YjkK4nq5DVaNdVrrowd5AX9gmz6D/TJTssns6pDCG00Y
// SIG // +Dh3ipWpnVmkhYcByyUSEKX3PLC8DkiAQQIDAQABo4IB
// SIG // gjCCAX4wHwYDVR0lBBgwFgYKKwYBBAGCN0wIAQYIKwYB
// SIG // BQUHAwMwHQYDVR0OBBYEFIcf73Spl4cHOFoll27H9COd
// SIG // 4fE/MFQGA1UdEQRNMEukSTBHMS0wKwYDVQQLEyRNaWNy
// SIG // b3NvZnQgSXJlbGFuZCBPcGVyYXRpb25zIExpbWl0ZWQx
// SIG // FjAUBgNVBAUTDTIzMDAxMis1MDE4MzYwHwYDVR0jBBgw
// SIG // FoAUSG5k5VAF04KqFzc3IrVtqMp1ApUwVAYDVR0fBE0w
// SIG // SzBJoEegRYZDaHR0cDovL3d3dy5taWNyb3NvZnQuY29t
// SIG // L3BraW9wcy9jcmwvTWljQ29kU2lnUENBMjAxMV8yMDEx
// SIG // LTA3LTA4LmNybDBhBggrBgEFBQcBAQRVMFMwUQYIKwYB
// SIG // BQUHMAKGRWh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9w
// SIG // a2lvcHMvY2VydHMvTWljQ29kU2lnUENBMjAxMV8yMDEx
// SIG // LTA3LTA4LmNydDAMBgNVHRMBAf8EAjAAMA0GCSqGSIb3
// SIG // DQEBCwUAA4ICAQBqyWA1Eu7PKNMjaaxl0V7gJ0XBysUo
// SIG // xZluMHJXFE2LEGZIZ2zMLYVjOnAGG/4dluRjSrZZo/8v
// SIG // wk4Xt8v6NBB9ofo8H1P/XidHytWTv9lg9MYu++6lPmu5
// SIG // fCozD3cI2NLZPW2BBhGX2D0R8tQBj0FbmZRuIucpiQ7D
// SIG // K3CHKlfKcc7MP8pPzuMv55Tox8+KFQD1NG6+bfbYA/BN
// SIG // PBkg4tyOh+exbaHfcNuodDJUIjq9dF6oa+Yjy0u0pUMI
// SIG // /B1t+8m6rJo0KSoZlrpesYl0jRhpt+hmqx8uENXoGJcY
// SIG // ZVJ5N2Skq90LViKNRhi9N4U+e8c4y9uXyomUF/6viCPJ
// SIG // 7huTNEJo75ehIJba+IWd3txUEc0R3y6DT6txC6cW1nR/
// SIG // LTbo9I/8fQq538G5IvJ+e5iSiOSVVkVk0i5m03Awy5E2
// SIG // ZSS4PVdQSCcFxmN4tpEfYuR7AAy/GJVtIDFlUpSgdXok
// SIG // pSui5hYtK1R9enXXvo+U/xGkLRc+qp4De3dZbzu7pOq7
// SIG // V/jCyhuCw0bEIAU4urCGIip7TI6GBRzD7yPzjFIqeZY7
// SIG // S4rVW5BRn2oEqpm8Su6yTIQvMIk8x2pwYNUa2339Z4gW
// SIG // 5xW21eFA5mLpo7NRSKRQms5OgAA18aCgqOU7Ds0h6q/Y
// SIG // B4BmEAtoTMl/TBiyKaMGAlEcdy+5FIhmzojMGjCCB3ow
// SIG // ggVioAMCAQICCmEOkNIAAAAAAAMwDQYJKoZIhvcNAQEL
// SIG // BQAwgYgxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNo
// SIG // aW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQK
// SIG // ExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xMjAwBgNVBAMT
// SIG // KU1pY3Jvc29mdCBSb290IENlcnRpZmljYXRlIEF1dGhv
// SIG // cml0eSAyMDExMB4XDTExMDcwODIwNTkwOVoXDTI2MDcw
// SIG // ODIxMDkwOVowfjELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEoMCYG
// SIG // A1UEAxMfTWljcm9zb2Z0IENvZGUgU2lnbmluZyBQQ0Eg
// SIG // MjAxMTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoC
// SIG // ggIBAKvw+nIQHC6t2G6qghBNNLrytlghn0IbKmvpWlCq
// SIG // uAY4GgRJun/DDB7dN2vGEtgL8DjCmQawyDnVARQxQtOJ
// SIG // DXlkh36UYCRsr55JnOloXtLfm1OyCizDr9mpK656Ca/X
// SIG // llnKYBoF6WZ26DJSJhIv56sIUM+zRLdd2MQuA3WraPPL
// SIG // bfM6XKEW9Ea64DhkrG5kNXimoGMPLdNAk/jj3gcN1Vx5
// SIG // pUkp5w2+oBN3vpQ97/vjK1oQH01WKKJ6cuASOrdJXtjt
// SIG // 7UORg9l7snuGG9k+sYxd6IlPhBryoS9Z5JA7La4zWMW3
// SIG // Pv4y07MDPbGyr5I4ftKdgCz1TlaRITUlwzluZH9TupwP
// SIG // rRkjhMv0ugOGjfdf8NBSv4yUh7zAIXQlXxgotswnKDgl
// SIG // mDlKNs98sZKuHCOnqWbsYR9q4ShJnV+I4iVd0yFLPlLE
// SIG // tVc/JAPw0XpbL9Uj43BdD1FGd7P4AOG8rAKCX9vAFbO9
// SIG // G9RVS+c5oQ/pI0m8GLhEfEXkwcNyeuBy5yTfv0aZxe/C
// SIG // HFfbg43sTUkwp6uO3+xbn6/83bBm4sGXgXvt1u1L50kp
// SIG // pxMopqd9Z4DmimJ4X7IvhNdXnFy/dygo8e1twyiPLI9A
// SIG // N0/B4YVEicQJTMXUpUMvdJX3bvh4IFgsE11glZo+TzOE
// SIG // 2rCIF96eTvSWsLxGoGyY0uDWiIwLAgMBAAGjggHtMIIB
// SIG // 6TAQBgkrBgEEAYI3FQEEAwIBADAdBgNVHQ4EFgQUSG5k
// SIG // 5VAF04KqFzc3IrVtqMp1ApUwGQYJKwYBBAGCNxQCBAwe
// SIG // CgBTAHUAYgBDAEEwCwYDVR0PBAQDAgGGMA8GA1UdEwEB
// SIG // /wQFMAMBAf8wHwYDVR0jBBgwFoAUci06AjGQQ7kUBU7h
// SIG // 6qfHMdEjiTQwWgYDVR0fBFMwUTBPoE2gS4ZJaHR0cDov
// SIG // L2NybC5taWNyb3NvZnQuY29tL3BraS9jcmwvcHJvZHVj
// SIG // dHMvTWljUm9vQ2VyQXV0MjAxMV8yMDExXzAzXzIyLmNy
// SIG // bDBeBggrBgEFBQcBAQRSMFAwTgYIKwYBBQUHMAKGQmh0
// SIG // dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2kvY2VydHMv
// SIG // TWljUm9vQ2VyQXV0MjAxMV8yMDExXzAzXzIyLmNydDCB
// SIG // nwYDVR0gBIGXMIGUMIGRBgkrBgEEAYI3LgMwgYMwPwYI
// SIG // KwYBBQUHAgEWM2h0dHA6Ly93d3cubWljcm9zb2Z0LmNv
// SIG // bS9wa2lvcHMvZG9jcy9wcmltYXJ5Y3BzLmh0bTBABggr
// SIG // BgEFBQcCAjA0HjIgHQBMAGUAZwBhAGwAXwBwAG8AbABp
// SIG // AGMAeQBfAHMAdABhAHQAZQBtAGUAbgB0AC4gHTANBgkq
// SIG // hkiG9w0BAQsFAAOCAgEAZ/KGpZjgVHkaLtPYdGcimwuW
// SIG // EeFjkplCln3SeQyQwWVfLiw++MNy0W2D/r4/6ArKO79H
// SIG // qaPzadtjvyI1pZddZYSQfYtGUFXYDJJ80hpLHPM8QotS
// SIG // 0LD9a+M+By4pm+Y9G6XUtR13lDni6WTJRD14eiPzE32m
// SIG // kHSDjfTLJgJGKsKKELukqQUMm+1o+mgulaAqPyprWElj
// SIG // HwlpblqYluSD9MCP80Yr3vw70L01724lruWvJ+3Q3fMO
// SIG // r5kol5hNDj0L8giJ1h/DMhji8MUtzluetEk5CsYKwsat
// SIG // ruWy2dsViFFFWDgycScaf7H0J/jeLDogaZiyWYlobm+n
// SIG // t3TDQAUGpgEqKD6CPxNNZgvAs0314Y9/HG8VfUWnduVA
// SIG // KmWjw11SYobDHWM2l4bf2vP48hahmifhzaWX0O5dY0Hj
// SIG // Wwechz4GdwbRBrF1HxS+YWG18NzGGwS+30HHDiju3mUv
// SIG // 7Jf2oVyW2ADWoUa9WfOXpQlLSBCZgB/QACnFsZulP0V3
// SIG // HjXG0qKin3p6IvpIlR+r+0cjgPWe+L9rt0uX4ut1eBrs
// SIG // 6jeZeRhL/9azI2h15q/6/IvrC4DqaTuv/DDtBEyO3991
// SIG // bWORPdGdVk5Pv4BXIqF4ETIheu9BCrE/+6jMpF3BoYib
// SIG // V3FWTkhFwELJm3ZbCoBIa/15n8G9bW1qyVJzEw16UM0x
// SIG // ghmeMIIZmgIBATCBlTB+MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBTaWduaW5n
// SIG // IFBDQSAyMDExAhMzAAADri01UchTj1UdAAAAAAOuMA0G
// SIG // CWCGSAFlAwQCAQUAoIGuMBkGCSqGSIb3DQEJAzEMBgor
// SIG // BgEEAYI3AgEEMBwGCisGAQQBgjcCAQsxDjAMBgorBgEE
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCByvOqbaEa33+sT
// SIG // eM/vIkfW4zUUqGquOix6rltVoWvw6DBCBgorBgEEAYI3
// SIG // AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMAbwBmAHShGoAY
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tMA0GCSqGSIb3
// SIG // DQEBAQUABIIBADCMq/qctyC/6zs8v3ZmENGTn2bnrzDK
// SIG // UiiMWipWBhKuR0O8lMUqx2cpwOWt7pEQZDg/xvGZeCyh
// SIG // daIjygOhkbz5+VH2rCwxWlN7Mb1MVuY1jCtZD342zlIW
// SIG // pARMP2vPnRLvlWeKbUK2Da08Hb/wN+WKKATGa2Ou6fnq
// SIG // c3YHaVRWcoPFIA804QR0XSajy/00p4OUwCEVn50El743
// SIG // hPmkxKWyvjNXNrksIR80CRh+pp90jiJ8cesoqyEAKE2Z
// SIG // lQI+V51d2sQcRTKCpp6PsNZo9ilECc94kk18V8wbPvB1
// SIG // ByIfYeH6AajNwiK+AtlH5bjZXcvcVcfOMrDFqB21Lm6L
// SIG // eSqhghcoMIIXJAYKKwYBBAGCNwMDATGCFxQwghcQBgkq
// SIG // hkiG9w0BBwKgghcBMIIW/QIBAzEPMA0GCWCGSAFlAwQC
// SIG // AQUAMIIBWAYLKoZIhvcNAQkQAQSgggFHBIIBQzCCAT8C
// SIG // AQEGCisGAQQBhFkKAwEwMTANBglghkgBZQMEAgEFAAQg
// SIG // 2I0IidYVd9ctlqzpHNV/yX/aXV83bMeCeRV1tqh1cokC
// SIG // BmVbWzjaWxgSMjAyMzEyMTIxOTAzMzYuOTFaMASAAgH0
// SIG // oIHYpIHVMIHSMQswCQYDVQQGEwJVUzETMBEGA1UECBMK
// SIG // V2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwG
// SIG // A1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMS0wKwYD
// SIG // VQQLEyRNaWNyb3NvZnQgSXJlbGFuZCBPcGVyYXRpb25z
// SIG // IExpbWl0ZWQxJjAkBgNVBAsTHVRoYWxlcyBUU1MgRVNO
// SIG // Ojg2REYtNEJCQy05MzM1MSUwIwYDVQQDExxNaWNyb3Nv
// SIG // ZnQgVGltZS1TdGFtcCBTZXJ2aWNloIIReDCCBycwggUP
// SIG // oAMCAQICEzMAAAHdXVcdldStqhsAAQAAAd0wDQYJKoZI
// SIG // hvcNAQELBQAwfDELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQG
// SIG // A1UEAxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIw
// SIG // MTAwHhcNMjMxMDEyMTkwNzA5WhcNMjUwMTEwMTkwNzA5
// SIG // WjCB0jELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMk
// SIG // TWljcm9zb2Z0IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1p
// SIG // dGVkMSYwJAYDVQQLEx1UaGFsZXMgVFNTIEVTTjo4NkRG
// SIG // LTRCQkMtOTMzNTElMCMGA1UEAxMcTWljcm9zb2Z0IFRp
// SIG // bWUtU3RhbXAgU2VydmljZTCCAiIwDQYJKoZIhvcNAQEB
// SIG // BQADggIPADCCAgoCggIBAKhOA5RE6i53nHURH4lnfKLp
// SIG // +9JvipuTtctairCxMUSrPSy5CWK2DtriQP+T52HXbN2g
// SIG // 7AktQ1pQZbTDGFzK6d03vYYNrCPuJK+PRsP2FPVDjBXy
// SIG // 5mrLRFzIHHLaiAaobE5vFJuoxZ0ZWdKMCs8acjhHUmfa
// SIG // Y+79/CR7uN+B4+xjJqwvdpU/mp0mAq3earyH+AKmv6lk
// SIG // rQN8zgrcbCgHwsqvvqT6lEFqYpi7uKn7MAYbSeLe0pMd
// SIG // atV5EW6NVnXMYOTRKuGPfyfBKdShualLo88kG7qa2mbA
// SIG // 5l77+X06JAesMkoyYr4/9CgDFjHUpcHSODujlFBKMi16
// SIG // 8zRdLerdpW0bBX9EDux2zBMMaEK8NyxawCEuAq7++7kt
// SIG // FAbl3hUKtuzYC1FUZuUl2Bq6U17S4CKsqR3itLT9qNcb
// SIG // 2pAJ4jrIDdll5Tgoqef5gpv+YcvBM834bXFNwytd3ujD
// SIG // D24P9Dd8xfVJvumjsBQQkK5T/qy3HrQJ8ud1nHSvtFVi
// SIG // 5Sa/ubGuYEpS8gF6GDWN5/KbveFkdsoTVIPo8pkWhjPs
// SIG // 0Q7nA5+uBxQB4zljEjKz5WW7BA4wpmFm24fhBmRjV4Nb
// SIG // p+n78cgAjvDSfTlA6DYBcv2kx1JH2dIhaRnSeOXePT6h
// SIG // MF0Il598LMu0rw35ViUWcAQkUNUTxRnqGFxz5w+ZusMD
// SIG // AgMBAAGjggFJMIIBRTAdBgNVHQ4EFgQUbqL1toyPUdpF
// SIG // yyHSDKWj0I4lw/EwHwYDVR0jBBgwFoAUn6cVXQBeYl2D
// SIG // 9OXSZacbUzUZ6XIwXwYDVR0fBFgwVjBUoFKgUIZOaHR0
// SIG // cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9jcmwv
// SIG // TWljcm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUyMDIw
// SIG // MTAoMSkuY3JsMGwGCCsGAQUFBwEBBGAwXjBcBggrBgEF
// SIG // BQcwAoZQaHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3Br
// SIG // aW9wcy9jZXJ0cy9NaWNyb3NvZnQlMjBUaW1lLVN0YW1w
// SIG // JTIwUENBJTIwMjAxMCgxKS5jcnQwDAYDVR0TAQH/BAIw
// SIG // ADAWBgNVHSUBAf8EDDAKBggrBgEFBQcDCDAOBgNVHQ8B
// SIG // Af8EBAMCB4AwDQYJKoZIhvcNAQELBQADggIBAC5U2bIN
// SIG // LgXIHWbMcqVuf9jkUT/K8zyLBvu5h8JrqYR2z/eaO2yo
// SIG // 1Ooc9Shyvxbe9GZDu7kkUzxSyJ1IZksZZw6FDq6yZNT3
// SIG // PEjAEnREpRBL8S+mbXg+O4VLS0LSmb8XIZiLsaqZ0fDE
// SIG // cv3HeA+/y/qKnCQWkXghpaEMwGMQzRkhGwcGdXr1zGpQ
// SIG // 7HTxvfu57xFxZX1MkKnWFENJ6urd+4teUgXj0ngIOx//
// SIG // l3XMK3Ht8T2+zvGJNAF+5/5qBk7nr079zICbFXvxtidN
// SIG // N5eoXdW+9rAIkS+UGD19AZdBrtt6dZ+OdAquBiDkYQ5k
// SIG // VfUMKS31yHQOGgmFxuCOzTpWHalrqpdIllsy8KNsj5U9
// SIG // sONiWAd9PNlyEHHbQZDmi9/BNlOYyTt0YehLbDovmZUN
// SIG // azk79Od/A917mqCdTqrExwBGUPbMP+/vdYUqaJspupBn
// SIG // UtjOf/76DAhVy8e/e6zR98PkplmliO2brL3Q3rD6+ZCV
// SIG // drGM9Rm6hUDBBkvYh+YjmGdcQ5HB6WT9Rec8+qDHmbhL
// SIG // hX4Zdaard5/OXeLbgx2f7L4QQQj3KgqjqDOWInVhNE1g
// SIG // YtTWLHe4882d/k7Lui0K1g8EZrKD7maOrsJLKPKlegce
// SIG // J9FCqY1sDUKUhRa0EHUW+ZkKLlohKrS7FwjdrINWkPBg
// SIG // bQznCjdE2m47QjTbMIIHcTCCBVmgAwIBAgITMwAAABXF
// SIG // 52ueAptJmQAAAAAAFTANBgkqhkiG9w0BAQsFADCBiDEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjEyMDAGA1UEAxMpTWljcm9z
// SIG // b2Z0IFJvb3QgQ2VydGlmaWNhdGUgQXV0aG9yaXR5IDIw
// SIG // MTAwHhcNMjEwOTMwMTgyMjI1WhcNMzAwOTMwMTgzMjI1
// SIG // WjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDCCAiIw
// SIG // DQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAOThpkzn
// SIG // tHIhC3miy9ckeb0O1YLT/e6cBwfSqWxOdcjKNVf2AX9s
// SIG // SuDivbk+F2Az/1xPx2b3lVNxWuJ+Slr+uDZnhUYjDLWN
// SIG // E893MsAQGOhgfWpSg0S3po5GawcU88V29YZQ3MFEyHFc
// SIG // UTE3oAo4bo3t1w/YJlN8OWECesSq/XJprx2rrPY2vjUm
// SIG // ZNqYO7oaezOtgFt+jBAcnVL+tuhiJdxqD89d9P6OU8/W
// SIG // 7IVWTe/dvI2k45GPsjksUZzpcGkNyjYtcI4xyDUoveO0
// SIG // hyTD4MmPfrVUj9z6BVWYbWg7mka97aSueik3rMvrg0Xn
// SIG // Rm7KMtXAhjBcTyziYrLNueKNiOSWrAFKu75xqRdbZ2De
// SIG // +JKRHh09/SDPc31BmkZ1zcRfNN0Sidb9pSB9fvzZnkXf
// SIG // tnIv231fgLrbqn427DZM9ituqBJR6L8FA6PRc6ZNN3SU
// SIG // HDSCD/AQ8rdHGO2n6Jl8P0zbr17C89XYcz1DTsEzOUyO
// SIG // ArxCaC4Q6oRRRuLRvWoYWmEBc8pnol7XKHYC4jMYcten
// SIG // IPDC+hIK12NvDMk2ZItboKaDIV1fMHSRlJTYuVD5C4lh
// SIG // 8zYGNRiER9vcG9H9stQcxWv2XFJRXRLbJbqvUAV6bMUR
// SIG // HXLvjflSxIUXk8A8FdsaN8cIFRg/eKtFtvUeh17aj54W
// SIG // cmnGrnu3tz5q4i6tAgMBAAGjggHdMIIB2TASBgkrBgEE
// SIG // AYI3FQEEBQIDAQABMCMGCSsGAQQBgjcVAgQWBBQqp1L+
// SIG // ZMSavoKRPEY1Kc8Q/y8E7jAdBgNVHQ4EFgQUn6cVXQBe
// SIG // Yl2D9OXSZacbUzUZ6XIwXAYDVR0gBFUwUzBRBgwrBgEE
// SIG // AYI3TIN9AQEwQTA/BggrBgEFBQcCARYzaHR0cDovL3d3
// SIG // dy5taWNyb3NvZnQuY29tL3BraW9wcy9Eb2NzL1JlcG9z
// SIG // aXRvcnkuaHRtMBMGA1UdJQQMMAoGCCsGAQUFBwMIMBkG
// SIG // CSsGAQQBgjcUAgQMHgoAUwB1AGIAQwBBMAsGA1UdDwQE
// SIG // AwIBhjAPBgNVHRMBAf8EBTADAQH/MB8GA1UdIwQYMBaA
// SIG // FNX2VsuP6KJcYmjRPZSQW9fOmhjEMFYGA1UdHwRPME0w
// SIG // S6BJoEeGRWh0dHA6Ly9jcmwubWljcm9zb2Z0LmNvbS9w
// SIG // a2kvY3JsL3Byb2R1Y3RzL01pY1Jvb0NlckF1dF8yMDEw
// SIG // LTA2LTIzLmNybDBaBggrBgEFBQcBAQROMEwwSgYIKwYB
// SIG // BQUHMAKGPmh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9w
// SIG // a2kvY2VydHMvTWljUm9vQ2VyQXV0XzIwMTAtMDYtMjMu
// SIG // Y3J0MA0GCSqGSIb3DQEBCwUAA4ICAQCdVX38Kq3hLB9n
// SIG // ATEkW+Geckv8qW/qXBS2Pk5HZHixBpOXPTEztTnXwnE2
// SIG // P9pkbHzQdTltuw8x5MKP+2zRoZQYIu7pZmc6U03dmLq2
// SIG // HnjYNi6cqYJWAAOwBb6J6Gngugnue99qb74py27YP0h1
// SIG // AdkY3m2CDPVtI1TkeFN1JFe53Z/zjj3G82jfZfakVqr3
// SIG // lbYoVSfQJL1AoL8ZthISEV09J+BAljis9/kpicO8F7BU
// SIG // hUKz/AyeixmJ5/ALaoHCgRlCGVJ1ijbCHcNhcy4sa3tu
// SIG // PywJeBTpkbKpW99Jo3QMvOyRgNI95ko+ZjtPu4b6MhrZ
// SIG // lvSP9pEB9s7GdP32THJvEKt1MMU0sHrYUP4KWN1APMdU
// SIG // bZ1jdEgssU5HLcEUBHG/ZPkkvnNtyo4JvbMBV0lUZNlz
// SIG // 138eW0QBjloZkWsNn6Qo3GcZKCS6OEuabvshVGtqRRFH
// SIG // qfG3rsjoiV5PndLQTHa1V1QJsWkBRH58oWFsc/4Ku+xB
// SIG // Zj1p/cvBQUl+fpO+y/g75LcVv7TOPqUxUYS8vwLBgqJ7
// SIG // Fx0ViY1w/ue10CgaiQuPNtq6TPmb/wrpNPgkNWcr4A24
// SIG // 5oyZ1uEi6vAnQj0llOZ0dFtq0Z4+7X6gMTN9vMvpe784
// SIG // cETRkPHIqzqKOghif9lwY1NNje6CbaUFEMFxBmoQtB1V
// SIG // M1izoXBm8qGCAtQwggI9AgEBMIIBAKGB2KSB1TCB0jEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMkTWljcm9z
// SIG // b2Z0IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1pdGVkMSYw
// SIG // JAYDVQQLEx1UaGFsZXMgVFNTIEVTTjo4NkRGLTRCQkMt
// SIG // OTMzNTElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgU2VydmljZaIjCgEBMAcGBSsOAwIaAxUANiNHGWXb
// SIG // NaDPxnyiDbEOciSjFhCggYMwgYCkfjB8MQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBQQ0EgMjAxMDANBgkqhkiG9w0BAQUFAAIF
// SIG // AOki2YowIhgPMjAyMzEyMTIyMTA3MjJaGA8yMDIzMTIx
// SIG // MzIxMDcyMlowdDA6BgorBgEEAYRZCgQBMSwwKjAKAgUA
// SIG // 6SLZigIBADAHAgEAAgIA+zAHAgEAAgIRYjAKAgUA6SQr
// SIG // CgIBADA2BgorBgEEAYRZCgQCMSgwJjAMBgorBgEEAYRZ
// SIG // CgMCoAowCAIBAAIDB6EgoQowCAIBAAIDAYagMA0GCSqG
// SIG // SIb3DQEBBQUAA4GBANMx3G6dievsLK5WtUY11fmcg+0g
// SIG // WyzDxKYDPEbIxUk7EnNdujZXfVkCil/7KJ+fJtwf91e6
// SIG // 8bJmuGDw2y+lejc/5D5pKuQn45bc5gBrjZ71LJXulurC
// SIG // wMspfwoKoLcRSWR0kGg2eMBqMwvdI1rlCBv7qUcaC39B
// SIG // TKHHFGXJJwldMYIEDTCCBAkCAQEwgZMwfDELMAkGA1UE
// SIG // BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNV
// SIG // BAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
// SIG // b3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRp
// SIG // bWUtU3RhbXAgUENBIDIwMTACEzMAAAHdXVcdldStqhsA
// SIG // AQAAAd0wDQYJYIZIAWUDBAIBBQCgggFKMBoGCSqGSIb3
// SIG // DQEJAzENBgsqhkiG9w0BCRABBDAvBgkqhkiG9w0BCQQx
// SIG // IgQgvZ3yyff+oRD8Ko2pnbZN7Oi7ZPDo891tXaCbcNKy
// SIG // fFcwgfoGCyqGSIb3DQEJEAIvMYHqMIHnMIHkMIG9BCBh
// SIG // /w4tmmWsT3iZnHtH0Vk37UCN02lRxY+RiON6wDFjZjCB
// SIG // mDCBgKR+MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpX
// SIG // YXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYD
// SIG // VQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNV
// SIG // BAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEw
// SIG // AhMzAAAB3V1XHZXUraobAAEAAAHdMCIEIO9BvosyAsp/
// SIG // mYKlWnEAZsvCxTlhKIMHk/CBn5AzjbkLMA0GCSqGSIb3
// SIG // DQEBCwUABIICAGFmMWnv5VE2NVQQbcp/nYPRvLMjL09p
// SIG // bVaJRwrkTcfwLzSm5x57Nb46GULGONshKpBSGigyQR6c
// SIG // hUroCaWwcRb6943F59ESMUdJmYBogv/NeKMCIIYKMW8D
// SIG // AcIVddvB9Opr/oy7ZBWuPbC3Xwgd+SSuUPx8qnOq+Xvr
// SIG // xUkEEzdElFMyisxoeVH1uogcCGAmop/cAQC11OXshhiK
// SIG // cVknpeuqnyrLk/ml+EN8d7bpc0Yjm3SK3mOqcwNX2Ih0
// SIG // /evGyIeBrriAGIhm+ezptWcMfZ7e78REUpsCx1R7vije
// SIG // bBjlumQn2lgKUSauYnV6YsDc9GxigLZdut9ZDd8PFJb0
// SIG // 7dgE7+Aq8af0x6oD0ha1prV8ykoElTMjri5I//NH8f0r
// SIG // 3rfHWoVQGepsxhfRMR9HrQ0FP4Jo4slSjsRYA9Z2gN4D
// SIG // fRBaDhhWc4kZX4zI7tPIisn1Jle1ZWPCtx4OoCMmLkeG
// SIG // ri+XJJvzrzOoQbt4TAsiV2jvwtOKml2Xqmj9N9Txjs3M
// SIG // 5Cqur7LrYaLCvBVWmxL3IeOLVbGch5l2idMv+2+XCkcd
// SIG // O5GMK/kdqfLa5TzkQ+7UL8ilCZ1Nwd60gFBIjHUDWBFg
// SIG // RuNKgxp/WRcIvxuvcQhjP6w30edYA/aoV/hiajrnL/eR
// SIG // 8++Tqtley6SywfYRCVzuK9y/tQG0Mi8g0X06
// SIG // End signature block
