"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntitySequence = void 0;
const yaml_1 = require("yaml");
const yaml_types_1 = require("./yaml-types");
/**
 * EntitySequence is expressed as either a single entity or a sequence of entities.
 */
class EntitySequence extends yaml_types_1.Yaml {
    factory;
    constructor(factory, node, parent, key) {
        super(node, parent, key);
        this.factory = factory;
    }
    static create() {
        return new yaml_types_1.YAMLDictionary();
    }
    get length() {
        if (this.node) {
            if ((0, yaml_1.isSeq)(this.node)) {
                return this.node.items.length;
            }
            if ((0, yaml_1.isMap)(this.node)) {
                return 1;
            }
        }
        return 0;
    }
    add(value) {
        if (value === undefined || value === null) {
            throw new Error('Cannot add undefined or null to a sequence');
        }
        if (value.empty) {
            throw new Error('Cannot add an empty entity to a sequence');
        }
        if (!this.node) {
            // if we don't have a node at the moment, we need to create one.
            this.assert(true, value.node);
            return;
        }
        if ((0, yaml_1.isMap)(this.node)) {
            // this is currently a single item.
            // we need to convert it to a sequence
            const n = this.node;
            const seq = new yaml_types_1.YAMLSequence();
            seq.add(n);
            this.node = seq;
            // fall thru to the sequnce add
        }
        if ((0, yaml_1.isSeq)(this.node)) {
            this.node.add(value.node);
            return;
        }
    }
    get(index) {
        if ((0, yaml_1.isSeq)(this.node)) {
            return this.node.items[index];
        }
        if ((0, yaml_1.isScalar)(this.node) && index === 0) {
            return this.node.value;
        }
        return undefined;
    }
    *[Symbol.iterator]() {
        if ((0, yaml_1.isScalar)(this.node)) {
            return yield new this.factory(this.node);
        }
        yield* EntitySequence.generator(this);
    }
    clear() {
        if ((0, yaml_1.isSeq)(this.node)) {
            // just make sure the collection is emptied first
            this.node.items.length = 0;
        }
        this.dispose(true);
    }
    static *generator(sequence) {
        if ((0, yaml_1.isSeq)(sequence.node)) {
            for (const item of sequence.node.items) {
                yield new sequence.factory(item);
            }
        }
    }
}
exports.EntitySequence = EntitySequence;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW50aXR5U2VxdWVuY2UuanMiLCJzb3VyY2VSb290IjoiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL21pY3Jvc29mdC92Y3BrZy10b29sL21haW4vdmNwa2ctYXJ0aWZhY3RzLyIsInNvdXJjZXMiOlsieWFtbC9FbnRpdHlTZXF1ZW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsdUNBQXVDO0FBQ3ZDLGtDQUFrQzs7O0FBRWxDLCtCQUE4QztBQUM5Qyw2Q0FBaUY7QUFFakY7O0dBRUc7QUFFSCxNQUE4QixjQUFzRCxTQUFRLGlCQUFtQztJQUM3RjtJQUFoQyxZQUFnQyxPQUFnRCxFQUFFLElBQXFCLEVBQUUsTUFBYSxFQUFFLEdBQVk7UUFDbEksS0FBSyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFESyxZQUFPLEdBQVAsT0FBTyxDQUF5QztJQUVoRixDQUFDO0lBRUQsTUFBTSxDQUFVLE1BQU07UUFDcEIsT0FBTyxJQUFJLDJCQUFjLEVBQUUsQ0FBQztJQUM5QixDQUFDO0lBQ0QsSUFBSSxNQUFNO1FBQ1IsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ2IsSUFBSSxJQUFBLFlBQUssRUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3BCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO2FBQy9CO1lBQ0QsSUFBSSxJQUFBLFlBQUssRUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3BCLE9BQU8sQ0FBQyxDQUFDO2FBQ1Y7U0FDRjtRQUNELE9BQU8sQ0FBQyxDQUFDO0lBQ1gsQ0FBQztJQUVELEdBQUcsQ0FBQyxLQUFlO1FBQ2pCLElBQUksS0FBSyxLQUFLLFNBQVMsSUFBSSxLQUFLLEtBQUssSUFBSSxFQUFFO1lBQ3pDLE1BQU0sSUFBSSxLQUFLLENBQUMsNENBQTRDLENBQUMsQ0FBQztTQUMvRDtRQUVELElBQUksS0FBSyxDQUFDLEtB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
// SIG // Begin signature block
// SIG // MIIoKwYJKoZIhvcNAQcCoIIoHDCCKBgCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // XKlj4V4XZWlI7zWtbN3ITW+12+mYjtlMDI8r1mZXQVag
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
// SIG // a/15n8G9bW1qyVJzEw16UM0xghoNMIIaCQIBATCBlTB+
// SIG // MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3Rv
// SIG // bjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWlj
// SIG // cm9zb2Z0IENvcnBvcmF0aW9uMSgwJgYDVQQDEx9NaWNy
// SIG // b3NvZnQgQ29kZSBTaWduaW5nIFBDQSAyMDExAhMzAAAD
// SIG // rzBADkyjTQVBAAAAAAOvMA0GCWCGSAFlAwQCAQUAoIGu
// SIG // MBkGCSqGSIb3DQEJAzEMBgorBgEEAYI3AgEEMBwGCisG
// SIG // AQQBgjcCAQsxDjAMBgorBgEEAYI3AgEVMC8GCSqGSIb3
// SIG // DQEJBDEiBCBnUeoPxXB49yFthhWJBt0Rk+8LyBoCW/1m
// SIG // CjTnyaAJFzBCBgorBgEEAYI3AgEMMTQwMqAUgBIATQBp
// SIG // AGMAcgBvAHMAbwBmAHShGoAYaHR0cDovL3d3dy5taWNy
// SIG // b3NvZnQuY29tMA0GCSqGSIb3DQEBAQUABIIBAAiCvs4v
// SIG // smdE1GXkwhpdelOmHJeTRU+Z9wyftKJnzYR1Lmp+H6j3
// SIG // zDSeo+ICKNaVpPXHv63QKtQVXxsSB0GDIVQ7yfV30Rci
// SIG // 1squPTS1jFGUtbrTqOGzOrhWXbt4VfggVL0+6duOpb9N
// SIG // nfZNM/9gnVnnezlXqRFANkfFtnVPvSV7tNk2Lu2wPZP5
// SIG // pAcgbSChQZvl6USuvj9ADmUbw4oaeh0mq4Ng1pScBt7o
// SIG // 3oslFBsDEL0mpFvDZ1arJ7kOFLUBgQPRE0cmhrAEKfdW
// SIG // OCMozzzfBsApcZyBtBmBFXPq0XofxfNKIl7qPVdYV0iQ
// SIG // AykDppGk7aV2Ic/7ovp0BN4Fp8yhgheXMIIXkwYKKwYB
// SIG // BAGCNwMDATGCF4Mwghd/BgkqhkiG9w0BBwKgghdwMIIX
// SIG // bAIBAzEPMA0GCWCGSAFlAwQCAQUAMIIBUgYLKoZIhvcN
// SIG // AQkQAQSgggFBBIIBPTCCATkCAQEGCisGAQQBhFkKAwEw
// SIG // MTANBglghkgBZQMEAgEFAAQgdTR5TjZ+UGfOA2ePCa72
// SIG // beK6JOploy2xBigMECV4W78CBmVWylYhyxgTMjAyMzEy
// SIG // MTIxOTAzMzguODM3WjAEgAIB9KCB0aSBzjCByzELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjElMCMGA1UECxMcTWljcm9zb2Z0
// SIG // IEFtZXJpY2EgT3BlcmF0aW9uczEnMCUGA1UECxMeblNo
// SIG // aWVsZCBUU1MgRVNOOjg5MDAtMDVFMC1EOTQ3MSUwIwYD
// SIG // VQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2aWNl
// SIG // oIIR7TCCByAwggUIoAMCAQICEzMAAAHTHTKaFztAMHMA
// SIG // AQAAAdMwDQYJKoZIhvcNAQELBQAwfDELMAkGA1UEBhMC
// SIG // VVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcT
// SIG // B1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jw
// SIG // b3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgUENBIDIwMTAwHhcNMjMwNTI1MTkxMjI0WhcN
// SIG // MjQwMjAxMTkxMjI0WjCByzELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjElMCMGA1UECxMcTWljcm9zb2Z0IEFtZXJpY2EgT3Bl
// SIG // cmF0aW9uczEnMCUGA1UECxMeblNoaWVsZCBUU1MgRVNO
// SIG // Ojg5MDAtMDVFMC1EOTQ3MSUwIwYDVQQDExxNaWNyb3Nv
// SIG // ZnQgVGltZS1TdGFtcCBTZXJ2aWNlMIICIjANBgkqhkiG
// SIG // 9w0BAQEFAAOCAg8AMIICCgKCAgEAtI6rkzeINcW4VwnP
// SIG // DFfnTrvFKnNym22lrYub3bAFjNQ+H1UovuDVoBrT/wVU
// SIG // WK1Y9qFZ5zMtHms4nUDieLlLHATGzx2jMWjaYG0RvRRE
// SIG // ERZ3AFKbVpyPlT5edzw+jDy9Ms/HBwtmQ98HheMPrjAw
// SIG // Bpy9+gZJtLKzjV75zPXjb5xuXY6KRKoh6HVkmrkcnuLn
// SIG // 7QUdrE8Bh1ZsSrtBkuHzvOzYGyeFRsyAkcmV8Pfkb71z
// SIG // Bv44TNdR/AFisyqZ9KDBptTEjHjby1Fm99R0mXpMfzQR
// SIG // LV75naO+TldN9DR4CF4ocWBHkoFCMX2yOTpoDKv1QwkK
// SIG // dq/38v+TVWtyowkKDapphDOqKwCdlyo2IRCc6KeJ1gnC
// SIG // fe9FOq16QTyuFxjSgRYYS2u+EzP8rExSKxFziRtX1Ll3
// SIG // 3HVm9BMdBQHk06+oJpgqq3iTXozR33xv1RHheyzb1Krm
// SIG // BUZ3YglIYMutuK1uqbXJ0E4kXxNEC/4CxeNZANr2TGM3
// SIG // HNehImF0EAWhd1wLTHbodXaV6kzz0BDtzLOf+QfyrY4U
// SIG // rKTHD1L0b29+SFjfqvi/sxMIqYZpwhhU7sjjKnOUBNK7
// SIG // hjdzMdFb+sf4XDpml8ax0BqTSiOT5+/WJPPQHJalNplx
// SIG // 89WR1qfigXNw+lT+y99iZcMYScd2rGtPOcb9Fzw+fDEV
// SIG // tVmhr2kCAwEAAaOCAUkwggFFMB0GA1UdDgQWBBTSxyCG
// SIG // uBQA+PeM9+Yb8wpptONeYjAfBgNVHSMEGDAWgBSfpxVd
// SIG // AF5iXYP05dJlpxtTNRnpcjBfBgNVHR8EWDBWMFSgUqBQ
// SIG // hk5odHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3Bz
// SIG // L2NybC9NaWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIwUENB
// SIG // JTIwMjAxMCgxKS5jcmwwbAYIKwYBBQUHAQEEYDBeMFwG
// SIG // CCsGAQUFBzAChlBodHRwOi8vd3d3Lm1pY3Jvc29mdC5j
// SIG // b20vcGtpb3BzL2NlcnRzL01pY3Jvc29mdCUyMFRpbWUt
// SIG // U3RhbXAlMjBQQ0ElMjAyMDEwKDEpLmNydDAMBgNVHRMB
// SIG // Af8EAjAAMBYGA1UdJQEB/wQMMAoGCCsGAQUFBwMIMA4G
// SIG // A1UdDwEB/wQEAwIHgDANBgkqhkiG9w0BAQsFAAOCAgEA
// SIG // QGJYWKFEPuGmkOeDBTXxOhMvL+K1r/i7Q0UozDNl/YOL
// SIG // mpwPXFO1YrXaSD1f8xOr+ABIXv1Z4NlAEeao9kld7M/n
// SIG // w6jelS1lGbCkdEEdiWFypxT0VY9ens2cj+83eR/CLL7H
// SIG // BHKJ3l/mkRxdMRhjOLQy60vOL4+kZtG4KFi11pzE2eZD
// SIG // +KMJxpptC7JiJ7rtBiqw2Z5Hk1Zn5PIE08vHdctz9iGH
// SIG // NlCOIiWFwrkmigrhXjtMKsrHKb4RkEp6NVwBSt6Gsm7g
// SIG // 9ZkqEMU/au+/iwBhkG4kqBpYE40EGsmLEGj3BtUOEDcD
// SIG // jRqpAEgmU28yZZ5pB4JFpSki07pTmopViGOIUtRGfsPr
// SIG // F9ASfS3DNeNoedTpVyzKDy6cxwG+sdtoqWgCeSn97shW
// SIG // jilsOIZ7tM1rPjyj3dfdp3XitqIFn2hXX5xL5Fgwx9na
// SIG // C/mQOUAXfF54LP5ndwa55ZdgZGf4ImRP3ysqJa4kd2kw
// SIG // FgsRQlyiJfwpbtm254/an1WC6QFUBHD2gn0wH+zmQZV5
// SIG // pbhE76tWP0jYcQujCdUCwp5F0iP/4l2KZkSk+/N0CkYJ
// SIG // qP+M7Y97i/We8W2xsSEoPj9B00V9ecuE0XgWztkRTcgo
// SIG // /PIDjkZPrME9ZGil1HxgeM44OV7pcUm8t7izcUHmxOkx
// SIG // N3ACtPn52OVKR2hHZcOHu4owggdxMIIFWaADAgECAhMz
// SIG // AAAAFcXna54Cm0mZAAAAAAAVMA0GCSqGSIb3DQEBCwUA
// SIG // MIGIMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMTIwMAYDVQQDEylN
// SIG // aWNyb3NvZnQgUm9vdCBDZXJ0aWZpY2F0ZSBBdXRob3Jp
// SIG // dHkgMjAxMDAeFw0yMTA5MzAxODIyMjVaFw0zMDA5MzAx
// SIG // ODMyMjVaMHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpX
// SIG // YXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYD
// SIG // VQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNV
// SIG // BAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEw
// SIG // MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA
// SIG // 5OGmTOe0ciELeaLL1yR5vQ7VgtP97pwHB9KpbE51yMo1
// SIG // V/YBf2xK4OK9uT4XYDP/XE/HZveVU3Fa4n5KWv64NmeF
// SIG // RiMMtY0Tz3cywBAY6GB9alKDRLemjkZrBxTzxXb1hlDc
// SIG // wUTIcVxRMTegCjhuje3XD9gmU3w5YQJ6xKr9cmmvHaus
// SIG // 9ja+NSZk2pg7uhp7M62AW36MEBydUv626GIl3GoPz130
// SIG // /o5Tz9bshVZN7928jaTjkY+yOSxRnOlwaQ3KNi1wjjHI
// SIG // NSi947SHJMPgyY9+tVSP3PoFVZhtaDuaRr3tpK56KTes
// SIG // y+uDRedGbsoy1cCGMFxPLOJiss254o2I5JasAUq7vnGp
// SIG // F1tnYN74kpEeHT39IM9zfUGaRnXNxF803RKJ1v2lIH1+
// SIG // /NmeRd+2ci/bfV+AutuqfjbsNkz2K26oElHovwUDo9Fz
// SIG // pk03dJQcNIIP8BDyt0cY7afomXw/TNuvXsLz1dhzPUNO
// SIG // wTM5TI4CvEJoLhDqhFFG4tG9ahhaYQFzymeiXtcodgLi
// SIG // Mxhy16cg8ML6EgrXY28MyTZki1ugpoMhXV8wdJGUlNi5
// SIG // UPkLiWHzNgY1GIRH29wb0f2y1BzFa/ZcUlFdEtsluq9Q
// SIG // BXpsxREdcu+N+VLEhReTwDwV2xo3xwgVGD94q0W29R6H
// SIG // XtqPnhZyacaue7e3PmriLq0CAwEAAaOCAd0wggHZMBIG
// SIG // CSsGAQQBgjcVAQQFAgMBAAEwIwYJKwYBBAGCNxUCBBYE
// SIG // FCqnUv5kxJq+gpE8RjUpzxD/LwTuMB0GA1UdDgQWBBSf
// SIG // pxVdAF5iXYP05dJlpxtTNRnpcjBcBgNVHSAEVTBTMFEG
// SIG // DCsGAQQBgjdMg30BATBBMD8GCCsGAQUFBwIBFjNodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL0RvY3Mv
// SIG // UmVwb3NpdG9yeS5odG0wEwYDVR0lBAwwCgYIKwYBBQUH
// SIG // AwgwGQYJKwYBBAGCNxQCBAweCgBTAHUAYgBDAEEwCwYD
// SIG // VR0PBAQDAgGGMA8GA1UdEwEB/wQFMAMBAf8wHwYDVR0j
// SIG // BBgwFoAU1fZWy4/oolxiaNE9lJBb186aGMQwVgYDVR0f
// SIG // BE8wTTBLoEmgR4ZFaHR0cDovL2NybC5taWNyb3NvZnQu
// SIG // Y29tL3BraS9jcmwvcHJvZHVjdHMvTWljUm9vQ2VyQXV0
// SIG // XzIwMTAtMDYtMjMuY3JsMFoGCCsGAQUFBwEBBE4wTDBK
// SIG // BggrBgEFBQcwAoY+aHR0cDovL3d3dy5taWNyb3NvZnQu
// SIG // Y29tL3BraS9jZXJ0cy9NaWNSb29DZXJBdXRfMjAxMC0w
// SIG // Ni0yMy5jcnQwDQYJKoZIhvcNAQELBQADggIBAJ1Vffwq
// SIG // reEsH2cBMSRb4Z5yS/ypb+pcFLY+TkdkeLEGk5c9MTO1
// SIG // OdfCcTY/2mRsfNB1OW27DzHkwo/7bNGhlBgi7ulmZzpT
// SIG // Td2YurYeeNg2LpypglYAA7AFvonoaeC6Ce5732pvvinL
// SIG // btg/SHUB2RjebYIM9W0jVOR4U3UkV7ndn/OOPcbzaN9l
// SIG // 9qRWqveVtihVJ9AkvUCgvxm2EhIRXT0n4ECWOKz3+SmJ
// SIG // w7wXsFSFQrP8DJ6LGYnn8AtqgcKBGUIZUnWKNsIdw2Fz
// SIG // Lixre24/LAl4FOmRsqlb30mjdAy87JGA0j3mSj5mO0+7
// SIG // hvoyGtmW9I/2kQH2zsZ0/fZMcm8Qq3UwxTSwethQ/gpY
// SIG // 3UA8x1RtnWN0SCyxTkctwRQEcb9k+SS+c23Kjgm9swFX
// SIG // SVRk2XPXfx5bRAGOWhmRaw2fpCjcZxkoJLo4S5pu+yFU
// SIG // a2pFEUep8beuyOiJXk+d0tBMdrVXVAmxaQFEfnyhYWxz
// SIG // /gq77EFmPWn9y8FBSX5+k77L+DvktxW/tM4+pTFRhLy/
// SIG // AsGConsXHRWJjXD+57XQKBqJC4822rpM+Zv/Cuk0+CQ1
// SIG // ZyvgDbjmjJnW4SLq8CdCPSWU5nR0W2rRnj7tfqAxM328
// SIG // y+l7vzhwRNGQ8cirOoo6CGJ/2XBjU02N7oJtpQUQwXEG
// SIG // ahC0HVUzWLOhcGbyoYIDUDCCAjgCAQEwgfmhgdGkgc4w
// SIG // gcsxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
// SIG // dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
// SIG // aWNyb3NvZnQgQ29ycG9yYXRpb24xJTAjBgNVBAsTHE1p
// SIG // Y3Jvc29mdCBBbWVyaWNhIE9wZXJhdGlvbnMxJzAlBgNV
// SIG // BAsTHm5TaGllbGQgVFNTIEVTTjo4OTAwLTA1RTAtRDk0
// SIG // NzElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAg
// SIG // U2VydmljZaIjCgEBMAcGBSsOAwIaAxUAUsdt3DHDQdSE
// SIG // MLPy2JEV2uyOSbCggYMwgYCkfjB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMDANBgkqhkiG9w0BAQsFAAIFAOki
// SIG // 5kIwIhgPMjAyMzEyMTIxNDAxMzhaGA8yMDIzMTIxMzE0
// SIG // MDEzOFowdzA9BgorBgEEAYRZCgQBMS8wLTAKAgUA6SLm
// SIG // QgIBADAKAgEAAgITNgIB/zAHAgEAAgISjzAKAgUA6SQ3
// SIG // wgIBADA2BgorBgEEAYRZCgQCMSgwJjAMBgorBgEEAYRZ
// SIG // CgMCoAowCAIBAAIDB6EgoQowCAIBAAIDAYagMA0GCSqG
// SIG // SIb3DQEBCwUAA4IBAQBwMeoVA5DLZDWvr+rCuo0xCLVS
// SIG // H4IvOAlwK1VL9GNbL2N1p2xDUdMf1gdk5bRp6vl+MR+q
// SIG // RdFr27ZCpRJrUUUNjmO5ESqxHPcOZ4/zvFPCt9Vt0DV9
// SIG // 7dHs4qUwTlwBeqMxptSMBwgDat6D5EAP4ViPBl6JGlIH
// SIG // x4HelBqgHNc9OugcGQI7S7kSXuc9uLEB+oTtViMrjBXR
// SIG // JvszO3bEoEzptSy6pS2nmlmppL07AupeU/zesuijZaiI
// SIG // 06aZbhcrJc4zGOzxpweAD/Kv4TMAodzV4sFMsJQ/t5h1
// SIG // 1zBgWRK7oJeYcyve+ksz7MNJd/Fg6ykY15EisnAzvrJ7
// SIG // d7KdSka3MYIEDTCCBAkCAQEwgZMwfDELMAkGA1UEBhMC
// SIG // VVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcT
// SIG // B1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jw
// SIG // b3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgUENBIDIwMTACEzMAAAHTHTKaFztAMHMAAQAA
// SIG // AdMwDQYJYIZIAWUDBAIBBQCgggFKMBoGCSqGSIb3DQEJ
// SIG // AzENBgsqhkiG9w0BCRABBDAvBgkqhkiG9w0BCQQxIgQg
// SIG // T9gcxK/woDJ5OIDj97M7h4J318rozdBn7BKgCr1gj/0w
// SIG // gfoGCyqGSIb3DQEJEAIvMYHqMIHnMIHkMIG9BCCSZvTq
// SIG // xODuT1gNSmhWs7a/bj/eq0IBJ/rYBrWN8Tqq9TCBmDCB
// SIG // gKR+MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNo
// SIG // aW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQK
// SIG // ExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMT
// SIG // HU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwAhMz
// SIG // AAAB0x0ymhc7QDBzAAEAAAHTMCIEIKV7dCdG7Zhl78E0
// SIG // pDWDcYCbPW2LbwdBsLbzJQ9OiWANMA0GCSqGSIb3DQEB
// SIG // CwUABIICACHX9YsB7I+NYzEwyOOB3GaNX2UbjdUkvp0w
// SIG // u4EslX+AQjI+t4/xMuTdMgulpzgjzBvEp7lcUMU6Y1kA
// SIG // 9pWGYDDs9D+tsLZfup/emkdZKBTAvkLmAVnSENp6bZ6a
// SIG // DlnXx3QoRf68nX0ad7JDRUCd9xi6dobV2R65aXG63Uo4
// SIG // duLXFUVoUsB3wyEjtHdHerbfjTPqw+lD5LD7YBiZ2ZGx
// SIG // GbKrPitYBuVUABhG+JwsJP2FgKMohXUsIdXuZTNxCvy1
// SIG // kvKdBA9tbzH1OMAE20+2oGmASSp7DqWb0vDMhZshX9AJ
// SIG // PQQ4q46EaAjMUMR9oYMLy1ny8By1a7ip4+UWAWDj0mEF
// SIG // x+k+2wG8B9eqwx25hK/TwPDLdlgUmDCp0AK1dmwKFEyh
// SIG // 3SzVv3sb2dvkRFkxehXoSVdHiZfoSiJF9j1QEG4LLAPQ
// SIG // H7mXNnsnEiP4+nLHfa3H7qsPMUYbtE9rNdql/uDxQJb/
// SIG // SZPzeZzHeR+EJR3VtuLIS2O+npAttl9VFv/SDZ5mELWm
// SIG // e2p6Xcyye+ZSv5+zWN0QpDGMrJdbnD7VsGbGrCZxPZv0
// SIG // q4a+Nc7Yu+wncZq25bt1bCoolSu7M4KzZ9DkhhdZPoPA
// SIG // v+tfKytvb6L0XFyD7iXoFsa5+zgyso/fbaCBKCjhHtW/
// SIG // UvlHRqJBDWChs/7uX9zu2ZQSs16iJhxt
// SIG // End signature block