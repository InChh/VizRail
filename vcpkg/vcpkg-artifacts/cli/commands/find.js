"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindCommand = void 0;
const chalk_1 = require("chalk");
const artifact_1 = require("../../artifacts/artifact");
const i18n_1 = require("../../i18n");
const main_1 = require("../../main");
const command_1 = require("../command");
const console_table_1 = require("../console-table");
const styling_1 = require("../styling");
const project_1 = require("../switches/project");
const version_1 = require("../switches/version");
class FindCommand extends command_1.Command {
    command = 'find';
    version = new version_1.Version(this);
    project = new project_1.Project(this);
    async run() {
        // load registries (from the current project too if available)
        const resolver = main_1.session.globalRegistryResolver.with(await (0, artifact_1.buildRegistryResolver)(main_1.session, (await this.project.manifest)?.metadata.registries));
        const table = new console_table_1.Table((0, i18n_1.i) `Artifact`, (0, i18n_1.i) `Version`, (0, i18n_1.i) `Summary`);
        let anyEntries = false;
        for (const each of this.inputs) {
            const hasColon = each.indexOf(':') > -1;
            // eslint-disable-next-line prefer-const
            for (let [display, artifactVersions] of await resolver.search({
                // use keyword search if no registry is specified
                keyword: hasColon ? undefined : each,
                // otherwise use the criteria as an id
                idOrShortName: hasColon ? each : undefined,
                version: this.version.value
            })) {
                if (!this.version.isRangeOfVersions) {
                    // if the user didn't specify a range, just show the latest version that was returned
                    artifactVersions.splice(1);
                }
                for (const result of artifactVersions) {
                    if (!result.metadata.dependencyOnly) {
                        anyEntries = true;
                        table.push(display, result.metadata.version, result.metadata.summary || '');
                    }
                }
            }
        }
        if (!anyEntries) {
            (0, styling_1.error)((0, i18n_1.i) `No artifacts found matching criteria: ${chalk_1.cyan.bold(this.inputs.join(', '))}`);
            return false;
        }
        (0, styling_1.log)(table.toString());
        (0, styling_1.log)();
        return true;
    }
}
exports.FindCommand = FindCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZC5qcyIsInNvdXJjZVJvb3QiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vbWljcm9zb2Z0L3ZjcGtnLXRvb2wvbWFpbi92Y3BrZy1hcnRpZmFjdHMvIiwic291cmNlcyI6WyJjbGkvY29tbWFuZHMvZmluZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsdUNBQXVDO0FBQ3ZDLGtDQUFrQzs7O0FBR2xDLGlDQUE2QjtBQUM3Qix1REFBaUU7QUFDakUscUNBQStCO0FBQy9CLHFDQUFxQztBQUNyQyx3Q0FBcUM7QUFDckMsb0RBQXlDO0FBQ3pDLHdDQUF3QztBQUN4QyxpREFBOEM7QUFDOUMsaURBQThDO0FBRTlDLE1BQWEsV0FBWSxTQUFRLGlCQUFPO0lBQzdCLE9BQU8sR0FBRyxNQUFNLENBQUM7SUFFMUIsT0FBTyxHQUFHLElBQUksaUJBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1QixPQUFPLEdBQUcsSUFBSSxpQkFBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRW5CLEtBQUssQ0FBQyxHQUFHO1FBQ2hCLDhEQUE4RDtRQUM5RCxNQUFNLFFBQVEsR0FBRyxjQUFPLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUNsRCxNQUFNLElBQUEsZ0NBQXFCLEVBQUMsY0FBTyxFQUFFLENBQUMsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQzVGLE1BQU0sS0FBSyxHQUFHLElBQUkscUJBQUssQ0FBQyxJQUFBLFFBQUMsRUFBQSxVQUFVLEVBQUUsSUFBQSxRQUFDLEVBQUEsU0FBUyxFQUFFLElBQUEsUUFBQyxFQUFBLFNBQVMsQ0FBQyxDQUFDO1FBRTdELElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQztRQUN2QixLQUFLLE1BQU0sSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDOUIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN4Qyx3Q0FBd0M7WUFDeEMsS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFLGdCQUFnQixDQUFDLElBQUksTUFBTSxRQUFRLENBQUMsTUFBTSxDQUFDO2dCQUM1RCxpREFBaUQ7Z0JBQ2pELE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSTtnQkFDcEMsc0NBQXNDO2dCQUN0QyxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVM7Z0JBQzFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUs7YUFDNUIsQ0FBQyxFQUFFO2dCQUNGLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFO29CQUNuQyxxRkFBcUY7b0JBQ3JGLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDNUI7Z0JBQ0QsS0FBSyxNQUFNLE1BQU0sSUFBSSxnQkFBZ0IsRUFBRTtvQkFDckMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFO3dCQUNuQyxVQUFVLEdBQUcsSUFBSSxDQUFDO3dCQUNsQixLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsQ0FBQztxQkFDN0U7aUJBQ0Y7YUFDRjtTQUNGO1FBRUQsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNmLElBQUEsZUFBSyxFQUFDLElBQUEsUUFBQyxFQUFBLHlDQUF5QyxZQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3JGLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFFRCxJQUFBLGFBQUcsRUFBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUN0QixJQUFBLGFBQUcsR0FBRSxDQUFDO1FBQ04sT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0NBQ0Y7QUE3Q0Qsa0NBNkNDIn0=
// SIG // Begin signature block
// SIG // MIIoKgYJKoZIhvcNAQcCoIIoGzCCKBcCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // GH71wQeVHBQ8U2H1ocW/JLUPvcsVHLfuGVCLR7vScdeg
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
// SIG // a/15n8G9bW1qyVJzEw16UM0xghoMMIIaCAIBATCBlTB+
// SIG // MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3Rv
// SIG // bjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWlj
// SIG // cm9zb2Z0IENvcnBvcmF0aW9uMSgwJgYDVQQDEx9NaWNy
// SIG // b3NvZnQgQ29kZSBTaWduaW5nIFBDQSAyMDExAhMzAAAD
// SIG // rzBADkyjTQVBAAAAAAOvMA0GCWCGSAFlAwQCAQUAoIGu
// SIG // MBkGCSqGSIb3DQEJAzEMBgorBgEEAYI3AgEEMBwGCisG
// SIG // AQQBgjcCAQsxDjAMBgorBgEEAYI3AgEVMC8GCSqGSIb3
// SIG // DQEJBDEiBCBVXHvZz8dumjfHWUa9WilUp9yk+QnBKiMW
// SIG // QHLyROCiFzBCBgorBgEEAYI3AgEMMTQwMqAUgBIATQBp
// SIG // AGMAcgBvAHMAbwBmAHShGoAYaHR0cDovL3d3dy5taWNy
// SIG // b3NvZnQuY29tMA0GCSqGSIb3DQEBAQUABIIBAD1/I/AL
// SIG // iWLhP48UcTcsJvIZB4GFshX95M7Wjj5jBx30E0Ys7m0n
// SIG // cdapi59HngaL/JpRX9o6/UvszUQYN/PZbb4wiyPrEgoY
// SIG // qs3ZxaeTDQfnNOq35G13m+6YXTGf5zizZJxkKZK2DmhG
// SIG // HGtbAuVvqw8TE8+hUAx14fxFhfkaXv7D24kIS00DYn1O
// SIG // CdFJ0t5s68iF0ht1ximKV18ZvkGRYnJyH9hDUuPMLy0f
// SIG // QG/ZIfTJDe5/ibQQGvS5oWls104r59eREhrCKLK7K8ZE
// SIG // 2rMgTL8vZmvflXYjeXM3pnnOsbokUbAXCicvigtKqK9Y
// SIG // 4vlFU7643JdaXkQSY/uRk8a3wmyhgheWMIIXkgYKKwYB
// SIG // BAGCNwMDATGCF4Iwghd+BgkqhkiG9w0BBwKgghdvMIIX
// SIG // awIBAzEPMA0GCWCGSAFlAwQCAQUAMIIBUQYLKoZIhvcN
// SIG // AQkQAQSgggFABIIBPDCCATgCAQEGCisGAQQBhFkKAwEw
// SIG // MTANBglghkgBZQMEAgEFAAQgEVNNmxBUZCYpP/nm42j5
// SIG // PBoY51DmQisKoV/3yAVe/mACBmVorf0qchgSMjAyMzEy
// SIG // MTIxOTAzMzguOTVaMASAAgH0oIHRpIHOMIHLMQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMSUwIwYDVQQLExxNaWNyb3NvZnQg
// SIG // QW1lcmljYSBPcGVyYXRpb25zMScwJQYDVQQLEx5uU2hp
// SIG // ZWxkIFRTUyBFU046N0YwMC0wNUUwLUQ5NDcxJTAjBgNV
// SIG // BAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2Wg
// SIG // ghHtMIIHIDCCBQigAwIBAgITMwAAAdWpAs/Fp8npWgAB
// SIG // AAAB1TANBgkqhkiG9w0BAQsFADB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMDAeFw0yMzA1MjUxOTEyMzBaFw0y
// SIG // NDAyMDExOTEyMzBaMIHLMQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSUwIwYDVQQLExxNaWNyb3NvZnQgQW1lcmljYSBPcGVy
// SIG // YXRpb25zMScwJQYDVQQLEx5uU2hpZWxkIFRTUyBFU046
// SIG // N0YwMC0wNUUwLUQ5NDcxJTAjBgNVBAMTHE1pY3Jvc29m
// SIG // dCBUaW1lLVN0YW1wIFNlcnZpY2UwggIiMA0GCSqGSIb3
// SIG // DQEBAQUAA4ICDwAwggIKAoICAQDFfak57Oph9vuxtloA
// SIG // BiLc6enT+yKH619b+OhGdkyhgNzkX80KUGI/jEqOVMV4
// SIG // Sqt/UPFFidx2t7v2SETj2tAzuVKtDfq2HBpu80vZ0vyQ
// SIG // DydVt4MDL4tJSKqgYofCxDIBrWzJJjgBolKdOJx1ut2T
// SIG // yOc+UOm7e92tVPHpjdg+Omf31TLUf/oouyAOJ/Inn2ih
// SIG // 3ASP0QYm+AFQjhYDNDu8uzMdwHF5QdwsscNa9PVSGedL
// SIG // dDLo9jL6DoPF4NYo06lvvEQuSJ9ImwZfBGLy/8hpE7RD
// SIG // 4ewvJKmM1+t6eQuEsTXjrGM2WjkW18SgUZ8n+VpL2uk6
// SIG // AhDkCa355I531p0Jkqpoon7dHuLUdZSQO40qmVIQ6qQC
// SIG // anvImTqmNgE/rPJ0rgr0hMPI/uR1T/iaL0mEq4bqak+3
// SIG // sa8I+FAYOI/PC7V+zEek+sdyWtaX+ndbGlv/RJb5mQaG
// SIG // n8NunbkfvHD1Qt5D0rmtMOekYMq7QjYqE3FEP/wAY4TD
// SIG // uJxstjsa2HXi2yUDEg4MJL6/JvsQXToOZ+IxR6KT5t5f
// SIG // B5FpZYBpVLMma3pm5z6VXvkXrYs33NXJqVWLwiswa7NU
// SIG // FV87Es2sou9Idw3yAZmHIYWgOQ+DIY1nY3aG5DODiwN1
// SIG // rJyEb+mbWDagrdVxcncr6UKKO49eoNTXEW+scUf6GwXG
// SIG // 0KEymQIDAQABo4IBSTCCAUUwHQYDVR0OBBYEFK/QXKNO
// SIG // 35bBMOz3R5giX7Ala2OaMB8GA1UdIwQYMBaAFJ+nFV0A
// SIG // XmJdg/Tl0mWnG1M1GelyMF8GA1UdHwRYMFYwVKBSoFCG
// SIG // Tmh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMv
// SIG // Y3JsL01pY3Jvc29mdCUyMFRpbWUtU3RhbXAlMjBQQ0El
// SIG // MjAyMDEwKDEpLmNybDBsBggrBgEFBQcBAQRgMF4wXAYI
// SIG // KwYBBQUHMAKGUGh0dHA6Ly93d3cubWljcm9zb2Z0LmNv
// SIG // bS9wa2lvcHMvY2VydHMvTWljcm9zb2Z0JTIwVGltZS1T
// SIG // dGFtcCUyMFBDQSUyMDIwMTAoMSkuY3J0MAwGA1UdEwEB
// SIG // /wQCMAAwFgYDVR0lAQH/BAwwCgYIKwYBBQUHAwgwDgYD
// SIG // VR0PAQH/BAQDAgeAMA0GCSqGSIb3DQEBCwUAA4ICAQBm
// SIG // RddqvQuyjRpx0HGxvOqffFrbgFAg0j82v0v7R+/8a70S
// SIG // 2V4t7yKYKSsQGI6pvt1A8JGmuZyjmIXmw23AkI5bZkxv
// SIG // Sgws8rrBtJw9vakEckcWFQb7JG6b618x0s9Q3DL0dRq4
// SIG // 6QZRnm7U6234lecvjstAow30dP0TnIacPWKpPc3QgB+W
// SIG // DnglN2fdT1ruQ6WIVBenmpjpG9ypRANKUx5NRcpdJAQW
// SIG // 2FqEHTS3Ntb+0tCqIkNHJ5aFsF6ehRovWZp0MYIz9bpJ
// SIG // Hix0VrjdLVMOpe7wv62t90E3UrE2KmVwpQ5wsMD6YUsc
// SIG // oCsSRQZrA5AbwTOCZJpeG2z3vDo/huvPK8TeTJ2Ltu/I
// SIG // tXgxIlIOQp/tbHAiN8Xptw/JmIZg9edQ/FiDaIIwG5YH
// SIG // sfm2u7TwOFyd6OqLw18Z5j/IvDPzlkwWJxk6RHJF5dS4
// SIG // s3fnyLw3DHBe5Dav6KYB4n8x/cEmD/R44/8gS5PfuG1s
// SIG // rjLdyyGtyh0KiRDSmjw+fa7i1VPoemidDWNZ7ksNadMa
// SIG // d4ZoDvgkqOV4A6a+N8HIc/P6g0irrezLWUgbKXSN8iH9
// SIG // RP+WJFx5fBHE4AFxrbAUQ2Zn5jDmHAI3wYcQDnnEYP51
// SIG // A75WFwPsvBrfrb1+6a1fuTEH1AYdOOMy8fX8xKo0E0Ys
// SIG // +7bxIvFPsUpSzfFjBolmhzCCB3EwggVZoAMCAQICEzMA
// SIG // AAAVxedrngKbSZkAAAAAABUwDQYJKoZIhvcNAQELBQAw
// SIG // gYgxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
// SIG // dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
// SIG // aWNyb3NvZnQgQ29ycG9yYXRpb24xMjAwBgNVBAMTKU1p
// SIG // Y3Jvc29mdCBSb290IENlcnRpZmljYXRlIEF1dGhvcml0
// SIG // eSAyMDEwMB4XDTIxMDkzMDE4MjIyNVoXDTMwMDkzMDE4
// SIG // MzIyNVowfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldh
// SIG // c2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNV
// SIG // BAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UE
// SIG // AxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAw
// SIG // ggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQDk
// SIG // 4aZM57RyIQt5osvXJHm9DtWC0/3unAcH0qlsTnXIyjVX
// SIG // 9gF/bErg4r25PhdgM/9cT8dm95VTcVrifkpa/rg2Z4VG
// SIG // Iwy1jRPPdzLAEBjoYH1qUoNEt6aORmsHFPPFdvWGUNzB
// SIG // RMhxXFExN6AKOG6N7dcP2CZTfDlhAnrEqv1yaa8dq6z2
// SIG // Nr41JmTamDu6GnszrYBbfowQHJ1S/rboYiXcag/PXfT+
// SIG // jlPP1uyFVk3v3byNpOORj7I5LFGc6XBpDco2LXCOMcg1
// SIG // KL3jtIckw+DJj361VI/c+gVVmG1oO5pGve2krnopN6zL
// SIG // 64NF50ZuyjLVwIYwXE8s4mKyzbnijYjklqwBSru+cakX
// SIG // W2dg3viSkR4dPf0gz3N9QZpGdc3EXzTdEonW/aUgfX78
// SIG // 2Z5F37ZyL9t9X4C626p+Nuw2TPYrbqgSUei/BQOj0XOm
// SIG // TTd0lBw0gg/wEPK3Rxjtp+iZfD9M269ewvPV2HM9Q07B
// SIG // MzlMjgK8QmguEOqEUUbi0b1qGFphAXPKZ6Je1yh2AuIz
// SIG // GHLXpyDwwvoSCtdjbwzJNmSLW6CmgyFdXzB0kZSU2LlQ
// SIG // +QuJYfM2BjUYhEfb3BvR/bLUHMVr9lxSUV0S2yW6r1AF
// SIG // emzFER1y7435UsSFF5PAPBXbGjfHCBUYP3irRbb1Hode
// SIG // 2o+eFnJpxq57t7c+auIurQIDAQABo4IB3TCCAdkwEgYJ
// SIG // KwYBBAGCNxUBBAUCAwEAATAjBgkrBgEEAYI3FQIEFgQU
// SIG // KqdS/mTEmr6CkTxGNSnPEP8vBO4wHQYDVR0OBBYEFJ+n
// SIG // FV0AXmJdg/Tl0mWnG1M1GelyMFwGA1UdIARVMFMwUQYM
// SIG // KwYBBAGCN0yDfQEBMEEwPwYIKwYBBQUHAgEWM2h0dHA6
// SIG // Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvRG9jcy9S
// SIG // ZXBvc2l0b3J5Lmh0bTATBgNVHSUEDDAKBggrBgEFBQcD
// SIG // CDAZBgkrBgEEAYI3FAIEDB4KAFMAdQBiAEMAQTALBgNV
// SIG // HQ8EBAMCAYYwDwYDVR0TAQH/BAUwAwEB/zAfBgNVHSME
// SIG // GDAWgBTV9lbLj+iiXGJo0T2UkFvXzpoYxDBWBgNVHR8E
// SIG // TzBNMEugSaBHhkVodHRwOi8vY3JsLm1pY3Jvc29mdC5j
// SIG // b20vcGtpL2NybC9wcm9kdWN0cy9NaWNSb29DZXJBdXRf
// SIG // MjAxMC0wNi0yMy5jcmwwWgYIKwYBBQUHAQEETjBMMEoG
// SIG // CCsGAQUFBzAChj5odHRwOi8vd3d3Lm1pY3Jvc29mdC5j
// SIG // b20vcGtpL2NlcnRzL01pY1Jvb0NlckF1dF8yMDEwLTA2
// SIG // LTIzLmNydDANBgkqhkiG9w0BAQsFAAOCAgEAnVV9/Cqt
// SIG // 4SwfZwExJFvhnnJL/Klv6lwUtj5OR2R4sQaTlz0xM7U5
// SIG // 18JxNj/aZGx80HU5bbsPMeTCj/ts0aGUGCLu6WZnOlNN
// SIG // 3Zi6th542DYunKmCVgADsAW+iehp4LoJ7nvfam++Kctu
// SIG // 2D9IdQHZGN5tggz1bSNU5HhTdSRXud2f8449xvNo32X2
// SIG // pFaq95W2KFUn0CS9QKC/GbYSEhFdPSfgQJY4rPf5KYnD
// SIG // vBewVIVCs/wMnosZiefwC2qBwoEZQhlSdYo2wh3DYXMu
// SIG // LGt7bj8sCXgU6ZGyqVvfSaN0DLzskYDSPeZKPmY7T7uG
// SIG // +jIa2Zb0j/aRAfbOxnT99kxybxCrdTDFNLB62FD+Cljd
// SIG // QDzHVG2dY3RILLFORy3BFARxv2T5JL5zbcqOCb2zAVdJ
// SIG // VGTZc9d/HltEAY5aGZFrDZ+kKNxnGSgkujhLmm77IVRr
// SIG // akURR6nxt67I6IleT53S0Ex2tVdUCbFpAUR+fKFhbHP+
// SIG // CrvsQWY9af3LwUFJfn6Tvsv4O+S3Fb+0zj6lMVGEvL8C
// SIG // wYKiexcdFYmNcP7ntdAoGokLjzbaukz5m/8K6TT4JDVn
// SIG // K+ANuOaMmdbhIurwJ0I9JZTmdHRbatGePu1+oDEzfbzL
// SIG // 6Xu/OHBE0ZDxyKs6ijoIYn/ZcGNTTY3ugm2lBRDBcQZq
// SIG // ELQdVTNYs6FwZvKhggNQMIICOAIBATCB+aGB0aSBzjCB
// SIG // yzELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjElMCMGA1UECxMcTWlj
// SIG // cm9zb2Z0IEFtZXJpY2EgT3BlcmF0aW9uczEnMCUGA1UE
// SIG // CxMeblNoaWVsZCBUU1MgRVNOOjdGMDAtMDVFMC1EOTQ3
// SIG // MSUwIwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBT
// SIG // ZXJ2aWNloiMKAQEwBwYFKw4DAhoDFQBOEi+S/ZVFe6w1
// SIG // Id31m6Kge26lNKCBgzCBgKR+MHwxCzAJBgNVBAYTAlVT
// SIG // MRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
// SIG // ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
// SIG // YXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0
// SIG // YW1wIFBDQSAyMDEwMA0GCSqGSIb3DQEBCwUAAgUA6SL9
// SIG // rDAiGA8yMDIzMTIxMjE1NDEzMloYDzIwMjMxMjEzMTU0
// SIG // MTMyWjB3MD0GCisGAQQBhFkKBAExLzAtMAoCBQDpIv2s
// SIG // AgEAMAoCAQACAgG4AgH/MAcCAQACAhPZMAoCBQDpJE8s
// SIG // AgEAMDYGCisGAQQBhFkKBAIxKDAmMAwGCisGAQQBhFkK
// SIG // AwKgCjAIAgEAAgMHoSChCjAIAgEAAgMBhqAwDQYJKoZI
// SIG // hvcNAQELBQADggEBAFrIVkPX9iyN5vpFT8163M5opHHc
// SIG // dQC5ah5iZ8WcsBrZ4+Vh0IK4ff3Xx3L1jneUYJw42+Xh
// SIG // Ij/VJbUpyvwm7w1cbMJ4AshkmQVVFLh6uvOFZV2vPi+a
// SIG // 0Vb0sdmFY7+NwxWd7P5HAge6l38L/WH/t2Qz01RzObg1
// SIG // 2acq/hOo7ZqhPg1dgpLJQFhbY9cZzHGRLNlaSqbZisVm
// SIG // 1rT8dRZ7y0URlX3ECdWFVftJa4YYKaN5OnzV3RQp6Tl+
// SIG // 0GvUOltqLogfzvPnJOqk4uukx/Sh5eVEQq8Fkj3mKB8l
// SIG // h50UyQcRB9glRS9Xrxc5yWJoPvWPRK2ZxurP8GVZgfcY
// SIG // N3EuFH4xggQNMIIECQIBATCBkzB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMAITMwAAAdWpAs/Fp8npWgABAAAB
// SIG // 1TANBglghkgBZQMEAgEFAKCCAUowGgYJKoZIhvcNAQkD
// SIG // MQ0GCyqGSIb3DQEJEAEEMC8GCSqGSIb3DQEJBDEiBCAq
// SIG // a6pstMuGMklebDsk1pc1BS0+HHPWE0PKq7Nf9X7+YzCB
// SIG // +gYLKoZIhvcNAQkQAi8xgeowgecwgeQwgb0EINm/I4YM
// SIG // 166JMM7EKIcYvlcbr2CHjKC0LUOmpZIbBsH/MIGYMIGA
// SIG // pH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMd
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMA
// SIG // AAHVqQLPxafJ6VoAAQAAAdUwIgQgWTFyQmlPdvVbYv7L
// SIG // 13zJAUBFPcfG1MZacjztZibEG5wwDQYJKoZIhvcNAQEL
// SIG // BQAEggIACOsUfQtDun2etf8O9hbXDD3UpMiq4EyVN9DS
// SIG // cHR6og4CPnmYIk68BBMksJ2SH/YkGUd8Cei5Nn1Fmwi8
// SIG // Y4BnSAgDlNPakOr2sTNDgCwlDMThRFdoF73VFhl4lG0v
// SIG // oNiPg4z4LcFeFp1m2oqs52wgPL0z9h24gM5S/LaNjPie
// SIG // nMmlDkbnA7SmoTx/TTaDQ4eAhrEb9QXdwdvaOrfg/c7E
// SIG // gide/D2DxfvoyR2dVXlI2Xuk5gdDdAbVrC9UXDDKhxPh
// SIG // VN/7ONjNjpfNLumkF3uon8OfZfrL1pWDt4b5aEiRYtcH
// SIG // YphtSAt0Tvnd99sZFyiyjbRHV9z98PfD45jLfIceCbq7
// SIG // IhKOAN4INwK/U57UUP4yEvsf9FaCspK7SzllElxlyrDK
// SIG // oWji1FPSOk8dy3lXrv1svtdwHcdJumseJ7Ilx+UKSWdT
// SIG // MyVVNBefRNbnUpFe+4XUP8oBlrel4LQwkZNWdHnNAEIr
// SIG // mO3gagxjT3z+wXBRJ71tERGCuGu1xzBQfUsqUJvA8FHt
// SIG // nUHY9mvFVirSn2uzC7JD+RCEoFSCFZwiuqKMfVZ6w4E+
// SIG // kOQomZVNExJbWpaWArkMnJ5wOY28CpPYkUWb0gd8xhDF
// SIG // X7t3oyzrLTcI2VjRGljm+6DWY79+3IgWt/HSXZzcOV+s
// SIG // mpLos90lRJyDRG7YO0jE6JKADVxu/os=
// SIG // End signature block
