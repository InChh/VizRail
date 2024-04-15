"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.activateEspIdf = exports.installEspIdf = void 0;
const path_1 = require("path");
const i18n_1 = require("../i18n");
const exec_cmd_1 = require("../util/exec-cmd");
const vcpkg_1 = require("../vcpkg");
async function installEspIdf(session, events, targetLocation) {
    // check for some file that espressif installs to see if it's installed.
    if (await targetLocation.exists('.espressif')) {
        return;
    }
    // create the .espressif folder for the espressif installation
    const dotEspidf = await targetLocation.createDirectory('.espressif');
    const pythonPath = await (0, vcpkg_1.vcpkgFetch)(session, 'python3_with_venv');
    if (!pythonPath) {
        throw new Error((0, i18n_1.i) `Could not activate esp-idf: python was not found.`);
    }
    const targetDirectory = targetLocation.fsPath;
    const extendedEnvironment = {
        ...process.env,
        IDF_PATH: targetDirectory,
        IDF_TOOLS_PATH: dotEspidf.fsPath
    };
    const idfTools = targetLocation.join('tools/idf_tools.py').fsPath;
    session.channels.debug(`Running idf installer ${idfTools}`);
    const installResult = await (0, exec_cmd_1.execute)(pythonPath, [
        idfTools,
        'install',
        '--targets=all'
    ], {
        env: extendedEnvironment,
        onStdOutData: (chunk) => {
            session.channels.debug('espidf: ' + chunk);
            const regex = /\s(100)%/;
            chunk.toString().split('\n').forEach((line) => {
                const match_array = line.match(regex);
                if (match_array !== null) {
                    events.unpackArchiveHeartbeat?.('Installing espidf');
                }
            });
        }
    });
    if (installResult.code) {
        return false;
    }
    const installPythonEnv = await (0, exec_cmd_1.execute)(pythonPath, [
        idfTools,
        'install-python-env'
    ], {
        env: extendedEnvironment
    });
    return installPythonEnv.code === 0;
}
exports.installEspIdf = installEspIdf;
async function activateEspIdf(session, activation, targetLocation) {
    const pythonPath = await (0, vcpkg_1.vcpkgFetch)(session, 'python3_with_venv');
    if (!pythonPath) {
        throw new Error((0, i18n_1.i) `Could not activate esp-idf: python was not found.`);
    }
    const targetDirectory = targetLocation.fsPath;
    const dotEspidf = targetLocation.join('.espressif');
    const extendedEnvironment = {
        ...process.env,
        IDF_PATH: targetDirectory,
        IDF_TOOLS_PATH: dotEspidf.fsPath
    };
    const activateIdf = await (0, exec_cmd_1.execute)(pythonPath, [
        `${targetLocation.fsPath}/tools/idf_tools.py`,
        'export',
        '--format',
        'key-value',
        '--prefer-system'
    ], {
        env: extendedEnvironment,
        onStdOutData: (chunk) => {
            chunk.toString().split('\n').forEach((line) => {
                const splitLine = line.split('=');
                if (splitLine[0]) {
                    if (splitLine[0] !== 'PATH') {
                        activation.addEnvironmentVariable(splitLine[0].trim(), [splitLine[1].trim()]);
                    }
                    else {
                        const pathValues = splitLine[1].split(path_1.delimiter);
                        for (const path of pathValues) {
                            if (path.trim() !== '%PATH%' && path.trim() !== '$PATH') {
                                // we actually want to use the artifacts we installed, not the ones that are being bundled.
                                // when espressif supports artifacts properly, we shouldn't need this filter.
                                if (!/\.espressif.tools/ig.exec(path)) {
                                    activation.addPath(splitLine[0].trim(), session.fileSystem.file(path));
                                }
                            }
                        }
                    }
                }
            });
        }
    });
    if (activateIdf.code) {
        throw new Error(`Failed to activate esp-idf - ${activateIdf.stderr}`);
    }
    activation.addEnvironmentVariable('IDF_PATH', targetDirectory);
    activation.addTool('IDF_TOOLS_PATH', dotEspidf.fsPath);
    return true;
}
exports.activateEspIdf = activateEspIdf;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXNwaWRmLmpzIiwic291cmNlUm9vdCI6Imh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9taWNyb3NvZnQvdmNwa2ctdG9vbC9tYWluL3ZjcGtnLWFydGlmYWN0cy8iLCJzb3VyY2VzIjpbImluc3RhbGxlcnMvZXNwaWRmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSx1Q0FBdUM7QUFDdkMsa0NBQWtDOzs7QUFFbEMsK0JBQWlDO0FBRWpDLGtDQUE0QjtBQUc1QiwrQ0FBMkM7QUFFM0Msb0NBQXNDO0FBRS9CLEtBQUssVUFBVSxhQUFhLENBQUMsT0FBZ0IsRUFBRSxNQUE2QixFQUFFLGNBQW1CO0lBQ3RHLHdFQUF3RTtJQUN4RSxJQUFJLE1BQU0sY0FBYyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBRTtRQUFFLE9BQU87S0FBRTtJQUUxRCw4REFBOEQ7SUFDOUQsTUFBTSxTQUFTLEdBQUcsTUFBTSxjQUFjLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBRXJFLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBQSxrQkFBVSxFQUFDLE9BQU8sRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0lBQ2xFLElBQUksQ0FBQyxVQUFVLEVBQUU7UUFDZixNQUFNLElBQUksS0FBSyxDQUFDLElBQUEsUUFBQyxFQUFBLG1EQUFtRCxDQUFDLENBQUM7S0FDdkU7SUFFRCxNQUFNLGVBQWUsR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDO0lBRTlDLE1BQU0sbUJBQW1CLEdBQXNCO1FBQzdDLEdBQUksT0FBTyxDQUFDLEdBQUc7UUFDZixRQUFRLEVBQUUsZUFBZTtRQUN6QixjQUFjLEVBQUUsU0FBUyxDQUFDLE1BQU07S0FDakMsQ0FBQztJQUVGLE1BQU0sUUFBUSxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDbEUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMseUJBQXlCLFFBQVEsRUFBRSxD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
// SIG // Begin signature block
// SIG // MIIoNwYJKoZIhvcNAQcCoIIoKDCCKCQCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // ghlvoWqJhZs3MsTIsVSZoRF4AGdX/sdlbxMbfzuGZ0Og
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
// SIG // ghoKMIIaBgIBATCBlTB+MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBTaWduaW5n
// SIG // IFBDQSAyMDExAhMzAAADri01UchTj1UdAAAAAAOuMA0G
// SIG // CWCGSAFlAwQCAQUAoIGuMBkGCSqGSIb3DQEJAzEMBgor
// SIG // BgEEAYI3AgEEMBwGCisGAQQBgjcCAQsxDjAMBgorBgEE
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCAthe5Q99yyQT+E
// SIG // EKTKCEMCEgMrc+IUcR7hmJMCcXHNgTBCBgorBgEEAYI3
// SIG // AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMAbwBmAHShGoAY
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tMA0GCSqGSIb3
// SIG // DQEBAQUABIIBAFhIBzGYldDuY3UkS7jv3wkte5XdFOkC
// SIG // H5IT5JMyymSw0v2Mfv1JPdrBuesqZscNbJXJjb2F0il5
// SIG // 9dTLf8TgMuffdZ4RQcshaGy0hgLFEi6pjS/INvI5re1h
// SIG // YKr6CdSyt4vEDhRSAQXD4tpykEhxhytzdZkL2WGsSmbw
// SIG // QFT57Dkl281wNaednW2IeGP6+stOtkOvuGsAMGFnWG3O
// SIG // sk3ffkxbjJHTFw5X0eFSnHaf+XzDj5F2J58v+UTJlGLc
// SIG // D8GmtHlpvTMYoR6lWinW5z9Lv/p4FCQ/pU29n/8vyIhp
// SIG // aBklxKjxLsb6IWdW1VcmJmKqY0DZukScQalbAG8CVjwV
// SIG // odChgheUMIIXkAYKKwYBBAGCNwMDATGCF4Awghd8Bgkq
// SIG // hkiG9w0BBwKgghdtMIIXaQIBAzEPMA0GCWCGSAFlAwQC
// SIG // AQUAMIIBUgYLKoZIhvcNAQkQAQSgggFBBIIBPTCCATkC
// SIG // AQEGCisGAQQBhFkKAwEwMTANBglghkgBZQMEAgEFAAQg
// SIG // dxFv9WVSV/7pXj2Sd/dtPZl6YfE8xdzHlTCV0fWx0qEC
// SIG // BmVWyVmIlhgTMjAyMzEyMTIxOTAzNDIuMzc5WjAEgAIB
// SIG // 9KCB0aSBzjCByzELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjElMCMG
// SIG // A1UECxMcTWljcm9zb2Z0IEFtZXJpY2EgT3BlcmF0aW9u
// SIG // czEnMCUGA1UECxMeblNoaWVsZCBUU1MgRVNOOkEwMDAt
// SIG // MDVFMC1EOTQ3MSUwIwYDVQQDExxNaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBTZXJ2aWNloIIR6jCCByAwggUIoAMCAQIC
// SIG // EzMAAAHQdwiq76MXxt0AAQAAAdAwDQYJKoZIhvcNAQEL
// SIG // BQAwfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMd
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAwHhcN
// SIG // MjMwNTI1MTkxMjE0WhcNMjQwMjAxMTkxMjE0WjCByzEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjElMCMGA1UECxMcTWljcm9z
// SIG // b2Z0IEFtZXJpY2EgT3BlcmF0aW9uczEnMCUGA1UECxMe
// SIG // blNoaWVsZCBUU1MgRVNOOkEwMDAtMDVFMC1EOTQ3MSUw
// SIG // IwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2
// SIG // aWNlMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKC
// SIG // AgEA3zJX59+X7zNFwFEpiOaohtFMT4tuR5EsgYM5N86W
// SIG // Dt9dXdThBBc9EKQCtt7NXSRa4weYA/kjMOc+hMMQuAq1
// SIG // 1PSmkOFjR6h64Vn7aYKNzJCXsfX65jvTJXVH41BuerCF
// SIG // umFRemI1/va09SQ3Qgx26OZ2YmrDIoBimsBm9h6g+/5I
// SIG // 0Ueu0b1Ye0OJ2rQFbuOmX+TC74kdMTeXDRttMcAcILbW
// SIG // mBJOV5VC2gR+Tp189nlqCMfkowzuwbeQbgAVmPEr5kUH
// SIG // wck9nKaRM047f37NMaeAdXAB1Q8JRsGbr/UX3N53XcYB
// SIG // aygPDFh2yRdPmllFGCAUfBctoLhVR6B3js3uyLG8r0a2
// SIG // sf//N4GKqPHOWf9f7u5Iy3E4IqYsmfFxEbCxBAieaMdQ
// SIG // QS2OgI5m4AMw3TZdi3no/qiG3Qa/0lLyhAvl8OMYxTDk
// SIG // 1FVilnprdpIcJ3VHwTUezc7tc/S9Fr+0wGP7/r+qTYQH
// SIG // qITzAhSXPmpOrjA/Eyks1hY8OWgA5Jg/ZhrgvOsr0ipC
// SIG // CODGss6FHbHk9J35PGNHz47XcNlp3o5esyx7mF8HA2rt
// SIG // jtQzLqInnTVY0xd+1BJmE/qMQvzhV1BjwxELfbc4G0fY
// SIG // PBy7VHxHljrDhA+cYG+a8Mn7yLLOx/3HRxXCIiHM80IG
// SIG // J7C8hBnqaGQ5CoUjEeXggeinL/0CAwEAAaOCAUkwggFF
// SIG // MB0GA1UdDgQWBBQz4QGFktKAPpTrSE34ybcpdJJ0UTAf
// SIG // BgNVHSMEGDAWgBSfpxVdAF5iXYP05dJlpxtTNRnpcjBf
// SIG // BgNVHR8EWDBWMFSgUqBQhk5odHRwOi8vd3d3Lm1pY3Jv
// SIG // c29mdC5jb20vcGtpb3BzL2NybC9NaWNyb3NvZnQlMjBU
// SIG // aW1lLVN0YW1wJTIwUENBJTIwMjAxMCgxKS5jcmwwbAYI
// SIG // KwYBBQUHAQEEYDBeMFwGCCsGAQUFBzAChlBodHRwOi8v
// SIG // d3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NlcnRzL01p
// SIG // Y3Jvc29mdCUyMFRpbWUtU3RhbXAlMjBQQ0ElMjAyMDEw
// SIG // KDEpLmNydDAMBgNVHRMBAf8EAjAAMBYGA1UdJQEB/wQM
// SIG // MAoGCCsGAQUFBwMIMA4GA1UdDwEB/wQEAwIHgDANBgkq
// SIG // hkiG9w0BAQsFAAOCAgEAl4fnJApGWgNOkjVvqsbUvYB0
// SIG // KeMexvoHYpJ4CiLRK/KLZFyK5lj2K2q0VgZWPdZahoop
// SIG // R8iJWd4jQVG2jRJmigBjGeWHEuyGVCj2qtY1NJrMpfvK
// SIG // INLfQv2duvmrcd77IR6xULkoMEx2Vac7+5PAmJwWKMXY
// SIG // SNbhoah+feZqi77TLMRDf9bKO1Pm91Oiwq8ubsMHM+fo
// SIG // /Do9BlF92/omYPgLNMUzek9EGvATXnPy8HMqmDRGjJFt
// SIG // lQCq5ob1h/Dgg03F4DjZ5wAUBwX1yv3ywGxxRktVzTra
// SIG // +tv4mhwRgJKwhpegYvD38LOn7PsPrBPa94V/VYNILETK
// SIG // B0bjGol7KxphrLmJy59wME4LjGrcPUfFObybVkpbtQhT
// SIG // uT9CxL0EIjGddrEErEAJDQ07Pa041TY4yFIKGelzzMZX
// SIG // DyA3I8cPG33m+MuMAMTNkUaFnMaZMfuiCH9i/m+4Cx7Q
// SIG // cVwlieWzFu1sFAti5bW7q1MAb9EoI6Q7WxKsP7g4FgXq
// SIG // wk/mbctzXPeu4hmkI8mEB+h/4fV3PLJptp+lY8kkcdrM
// SIG // J1t4a+kMet1P8WPRy+hTYaxohRA+2USq58L717zFUFCB
// SIG // JAexlBHjeoXmPIBy7dIy1d8sw4kAPEfKeWBoBgFbfTBM
// SIG // IACTWNYh7x//L84SUmRTZB/LL0c7Tv4t07yq42/GccIw
// SIG // ggdxMIIFWaADAgECAhMzAAAAFcXna54Cm0mZAAAAAAAV
// SIG // MA0GCSqGSIb3DQEBCwUAMIGIMQswCQYDVQQGEwJVUzET
// SIG // MBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVk
// SIG // bW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0
// SIG // aW9uMTIwMAYDVQQDEylNaWNyb3NvZnQgUm9vdCBDZXJ0
// SIG // aWZpY2F0ZSBBdXRob3JpdHkgMjAxMDAeFw0yMTA5MzAx
// SIG // ODIyMjVaFw0zMDA5MzAxODMyMjVaMHwxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFBDQSAyMDEwMIICIjANBgkqhkiG9w0BAQEF
// SIG // AAOCAg8AMIICCgKCAgEA5OGmTOe0ciELeaLL1yR5vQ7V
// SIG // gtP97pwHB9KpbE51yMo1V/YBf2xK4OK9uT4XYDP/XE/H
// SIG // ZveVU3Fa4n5KWv64NmeFRiMMtY0Tz3cywBAY6GB9alKD
// SIG // RLemjkZrBxTzxXb1hlDcwUTIcVxRMTegCjhuje3XD9gm
// SIG // U3w5YQJ6xKr9cmmvHaus9ja+NSZk2pg7uhp7M62AW36M
// SIG // EBydUv626GIl3GoPz130/o5Tz9bshVZN7928jaTjkY+y
// SIG // OSxRnOlwaQ3KNi1wjjHINSi947SHJMPgyY9+tVSP3PoF
// SIG // VZhtaDuaRr3tpK56KTesy+uDRedGbsoy1cCGMFxPLOJi
// SIG // ss254o2I5JasAUq7vnGpF1tnYN74kpEeHT39IM9zfUGa
// SIG // RnXNxF803RKJ1v2lIH1+/NmeRd+2ci/bfV+Autuqfjbs
// SIG // Nkz2K26oElHovwUDo9Fzpk03dJQcNIIP8BDyt0cY7afo
// SIG // mXw/TNuvXsLz1dhzPUNOwTM5TI4CvEJoLhDqhFFG4tG9
// SIG // ahhaYQFzymeiXtcodgLiMxhy16cg8ML6EgrXY28MyTZk
// SIG // i1ugpoMhXV8wdJGUlNi5UPkLiWHzNgY1GIRH29wb0f2y
// SIG // 1BzFa/ZcUlFdEtsluq9QBXpsxREdcu+N+VLEhReTwDwV
// SIG // 2xo3xwgVGD94q0W29R6HXtqPnhZyacaue7e3PmriLq0C
// SIG // AwEAAaOCAd0wggHZMBIGCSsGAQQBgjcVAQQFAgMBAAEw
// SIG // IwYJKwYBBAGCNxUCBBYEFCqnUv5kxJq+gpE8RjUpzxD/
// SIG // LwTuMB0GA1UdDgQWBBSfpxVdAF5iXYP05dJlpxtTNRnp
// SIG // cjBcBgNVHSAEVTBTMFEGDCsGAQQBgjdMg30BATBBMD8G
// SIG // CCsGAQUFBwIBFjNodHRwOi8vd3d3Lm1pY3Jvc29mdC5j
// SIG // b20vcGtpb3BzL0RvY3MvUmVwb3NpdG9yeS5odG0wEwYD
// SIG // VR0lBAwwCgYIKwYBBQUHAwgwGQYJKwYBBAGCNxQCBAwe
// SIG // CgBTAHUAYgBDAEEwCwYDVR0PBAQDAgGGMA8GA1UdEwEB
// SIG // /wQFMAMBAf8wHwYDVR0jBBgwFoAU1fZWy4/oolxiaNE9
// SIG // lJBb186aGMQwVgYDVR0fBE8wTTBLoEmgR4ZFaHR0cDov
// SIG // L2NybC5taWNyb3NvZnQuY29tL3BraS9jcmwvcHJvZHVj
// SIG // dHMvTWljUm9vQ2VyQXV0XzIwMTAtMDYtMjMuY3JsMFoG
// SIG // CCsGAQUFBwEBBE4wTDBKBggrBgEFBQcwAoY+aHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNS
// SIG // b29DZXJBdXRfMjAxMC0wNi0yMy5jcnQwDQYJKoZIhvcN
// SIG // AQELBQADggIBAJ1VffwqreEsH2cBMSRb4Z5yS/ypb+pc
// SIG // FLY+TkdkeLEGk5c9MTO1OdfCcTY/2mRsfNB1OW27DzHk
// SIG // wo/7bNGhlBgi7ulmZzpTTd2YurYeeNg2LpypglYAA7AF
// SIG // vonoaeC6Ce5732pvvinLbtg/SHUB2RjebYIM9W0jVOR4
// SIG // U3UkV7ndn/OOPcbzaN9l9qRWqveVtihVJ9AkvUCgvxm2
// SIG // EhIRXT0n4ECWOKz3+SmJw7wXsFSFQrP8DJ6LGYnn8Atq
// SIG // gcKBGUIZUnWKNsIdw2FzLixre24/LAl4FOmRsqlb30mj
// SIG // dAy87JGA0j3mSj5mO0+7hvoyGtmW9I/2kQH2zsZ0/fZM
// SIG // cm8Qq3UwxTSwethQ/gpY3UA8x1RtnWN0SCyxTkctwRQE
// SIG // cb9k+SS+c23Kjgm9swFXSVRk2XPXfx5bRAGOWhmRaw2f
// SIG // pCjcZxkoJLo4S5pu+yFUa2pFEUep8beuyOiJXk+d0tBM
// SIG // drVXVAmxaQFEfnyhYWxz/gq77EFmPWn9y8FBSX5+k77L
// SIG // +DvktxW/tM4+pTFRhLy/AsGConsXHRWJjXD+57XQKBqJ
// SIG // C4822rpM+Zv/Cuk0+CQ1ZyvgDbjmjJnW4SLq8CdCPSWU
// SIG // 5nR0W2rRnj7tfqAxM328y+l7vzhwRNGQ8cirOoo6CGJ/
// SIG // 2XBjU02N7oJtpQUQwXEGahC0HVUzWLOhcGbyoYIDTTCC
// SIG // AjUCAQEwgfmhgdGkgc4wgcsxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xJTAjBgNVBAsTHE1pY3Jvc29mdCBBbWVyaWNhIE9w
// SIG // ZXJhdGlvbnMxJzAlBgNVBAsTHm5TaGllbGQgVFNTIEVT
// SIG // TjpBMDAwLTA1RTAtRDk0NzElMCMGA1UEAxMcTWljcm9z
// SIG // b2Z0IFRpbWUtU3RhbXAgU2VydmljZaIjCgEBMAcGBSsO
// SIG // AwIaAxUAvLfIU/CilF/dZVORakT/Qn7vTImggYMwgYCk
// SIG // fjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDANBgkq
// SIG // hkiG9w0BAQsFAAIFAOki4xYwIhgPMjAyMzEyMTIxMzQ4
// SIG // MDZaGA8yMDIzMTIxMzEzNDgwNlowdDA6BgorBgEEAYRZ
// SIG // CgQBMSwwKjAKAgUA6SLjFgIBADAHAgEAAgIDnjAHAgEA
// SIG // AgIT+DAKAgUA6SQ0lgIBADA2BgorBgEEAYRZCgQCMSgw
// SIG // JjAMBgorBgEEAYRZCgMCoAowCAIBAAIDB6EgoQowCAIB
// SIG // AAIDAYagMA0GCSqGSIb3DQEBCwUAA4IBAQCMkrAgHiH0
// SIG // 8VjNcsXHhnUUnpmjrMLcwPHo1PHLKSa+n4bFFymWbLtk
// SIG // NeAeqz02HQoGCkZLU89pXaG1sraydw0c0ZePznhZBNjv
// SIG // kUQigcGhqNI+lPHzWogQuqFqbkslVknAqV7/20N0x1bE
// SIG // cyo7rnT3qb/YL7XOcnIOHghEto9IHsxMSc5NgvZbSudy
// SIG // z6dRnRk7dw8EMhPtk5IzjBc0amtk82RqHt93fZftQdRz
// SIG // 959HIF305endpIoS7K478wW/wfHhC8H8VX01/RiJ7/Tj
// SIG // cGjBOGDOjgO1Ni4M9bC80Sbmwq7ylTPTG0qNt9baTUwa
// SIG // At2AMMkGEaMbE+WkhdnGUrWQMYIEDTCCBAkCAQEwgZMw
// SIG // fDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWlj
// SIG // cm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMAAAHQ
// SIG // dwiq76MXxt0AAQAAAdAwDQYJYIZIAWUDBAIBBQCgggFK
// SIG // MBoGCSqGSIb3DQEJAzENBgsqhkiG9w0BCRABBDAvBgkq
// SIG // hkiG9w0BCQQxIgQgRKZ0H7mP8HltAaLZNGnVxbS0uO0w
// SIG // 9N0HuCvSSlZNJYkwgfoGCyqGSIb3DQEJEAIvMYHqMIHn
// SIG // MIHkMIG9BCAIlUAGX7TT/zHdRNmMPnwV2vcOn45k2eVg
// SIG // Hq600j8J1zCBmDCBgKR+MHwxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFBDQSAyMDEwAhMzAAAB0HcIqu+jF8bdAAEAAAHQMCIE
// SIG // INRA8s/izlQwtnAGx/MC+b4s15qHJAGiAepw5me6Wz5O
// SIG // MA0GCSqGSIb3DQEBCwUABIICADLYpRBTeRRnY6laSb8O
// SIG // Foq//1YqDiD9px8dIwqW7vAdjhQT85VRb/hon/UOTHu9
// SIG // +qj7/TXVnOQ6dVW3JORnRdjzAenJ/5SkX6hTHQXWKVZN
// SIG // eJh5tWBrndFtPROVjz/dn1vZUGqsxnV37nMnEEPz4mdY
// SIG // B/3CN3yvi7m3AJ5IEd9nHdZ7gIpb+F2xrL8IaJ81DZzN
// SIG // IVOfMZrDMkNHPfdjvLoJzlWW3JUfakVz/YUJ8rqGZsap
// SIG // 8GEpBvT5a2E1mCoRe+AOIwwMd5IySisOKg3tndkJ/VPq
// SIG // ub7qJyVPOukwAPyLSdMt8gNxZMCxG0nKLKlIFoCz9d5C
// SIG // /oKqnvSIBh+6GIXob84ouITwhr1pnRHGIrFUoPZ0K0hN
// SIG // TqQWmi96Q6exPhXsjsBQ2TR99J7OWXS8RfPOK5K31Am2
// SIG // JhF2qIMRWVGUI5as7lMl2e8jJkl5ccRhOQFq4FOA3Sps
// SIG // p9W7ZU9cR3qA7QwAPT/IN3zgyZVSjV9jdLCjuFu1CeWx
// SIG // AnaaLGsXeaWeBLlJd3AQuOo1u//FPIYB0UXkmNLlknDY
// SIG // lnTFt0lmDSk3BJWU00HNw8/q7gDy8dHc+h3vYPpJEKet
// SIG // 14+8S+UlK4UxH9+DXB7uMXuMiTg+vegQz0WWowJzbOqT
// SIG // U+9NxOiaEpZ3OmG+b2S87LJkVbPox4kXQbq7NSl4rF7D
// SIG // 8TzW
// SIG // End signature block
