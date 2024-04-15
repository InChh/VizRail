"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.takeWhitespace = exports.parseQuery = void 0;
const i18n_1 = require("../i18n");
const scanner_1 = require("./scanner");
function parseQuery(text) {
    const cursor = new scanner_1.Scanner(text);
    return QueryList.parse(cursor);
}
exports.parseQuery = parseQuery;
function takeWhitespace(cursor) {
    while (!cursor.eof && isWhiteSpace(cursor)) {
        cursor.take();
    }
}
exports.takeWhitespace = takeWhitespace;
function isWhiteSpace(cursor) {
    return cursor.kind === scanner_1.Kind.Whitespace;
}
class QueryList {
    queries = new Array();
    get isValid() {
        return !this.error;
    }
    error;
    constructor() {
        //
    }
    get length() {
        return this.queries.length;
    }
    static parse(cursor) {
        const result = new QueryList();
        try {
            cursor.scan(); // start the scanner
            for (const statement of QueryList.parseQuery(cursor)) {
                result.queries.push(statement);
            }
        }
        catch (error) {
            result.error = error;
        }
        return result;
    }
    static *parseQuery(cursor) {
        takeWhitespace(cursor);
        if (cursor.eof) {
            return;
        }
        yield Query.parse(cursor);
        takeWhitespace(cursor);
        if (cursor.eof) {
            return;
        }
        switch (cursor.kind) {
            case scanner_1.Kind.Comma:
                cursor.take();
                return yield* QueryList.parseQuery(cursor);
            case scanner_1.Kind.EndOfFile:
                return;
        }
        throw new scanner_1.MediaQueryError((0, i18n_1.i) `Expected comma, found ${JSON.stringify(cursor.text)}`, cursor.position.line, cursor.position.column);
    }
    get features() {
        const result = new Set();
        for (const query of this.queries) {
            for (const expression of query.expressions) {
                if (expression.feature) {
                    result.add(expression.feature);
                }
            }
        }
        return result;
    }
    match(properties) {
        if (this.isValid) {
            queries: for (const query of this.queries) {
                for (const { feature, constant, not } of query.expressions) {
                    // get the value from the context
                    const contextValue = stringValue(properties[feature]);
                    if (not) {
                        // negative/not present query
                        if (contextValue) {
                            // we have a value
                            if (constant && contextValue !== constant) {
                                continue; // the values are NOT a match.
                            }
                            if (!constant && contextValue === 'false') {
                                continue;
                            }
                        }
                        else {
                            // no value
                            if (!constant || contextValue === 'false') {
                                continue;
                            }
                        }
                    }
                    else {
                        // positive/present query
                        if (contextValue) {
                            if (contextValue === constant || contextValue !== 'false' && !constant) {
                                continue;
                            }
                        }
                        else {
                            if (constant === 'false') {
                                continue;
                            }
                        }
                    }
                    continue queries; // no match
                }
                // we matched a whole query, we're good
                return true;
            }
        }
        // no query matched.
        return false;
    }
}
function stringValue(value) {
    switch (typeof value) {
        case 'string':
        case 'number':
        case 'boolean':
            return value.toString();
        case 'object':
            return value === null ? 'true' : Array.isArray(value) ? stringValue(value[0]) || 'true' : 'true';
    }
    return undefined;
}
class Query {
    expressions;
    constructor(expressions) {
        this.expressions = expressions;
    }
    static parse(cursor) {
        const result = new Array();
        takeWhitespace(cursor);
        // eslint-disable-next-line no-constant-condition
        while (true) {
            result.push(Expression.parse(cursor));
            takeWhitespace(cursor);
            if (cursor.kind === scanner_1.Kind.AndKeyword) {
                cursor.take(); // consume and
                continue;
            }
            // the next token is not an 'and', so we bail now.
            return new Query(result);
        }
    }
}
class Expression {
    featureToken;
    constantToken;
    not;
    constructor(featureToken, constantToken, not) {
        this.featureToken = featureToken;
        this.constantToken = constantToken;
        this.not = not;
    }
    get feature() {
        return this.featureToken.text;
    }
    get constant() {
        return this.constantToken?.stringValue || this.constantToken?.text || undefined;
    }
    /** @internal */
    static parse(cursor, isNotted = false, inParen = false) {
        takeWhitespace(cursor);
        switch (cursor.kind) {
            case scanner_1.Kind.Identifier: {
                // start of an expression
                const feature = cursor.take();
                takeWhitespace(cursor);
                if (cursor.kind === scanner_1.Kind.Colon) {
                    cursor.take(); // consume colon;
                    // we have a constant for the
                    takeWhitespace(cursor);
                    switch (cursor.kind) {
                        case scanner_1.Kind.NumericLiteral:
                        case scanner_1.Kind.BooleanLiteral:
                        case scanner_1.Kind.Identifier:
                        case scanner_1.Kind.StringLiteral: {
                            // we have a good const value.
                            const constant = cursor.take();
                            return new Expression(feature, constant, isNotted);
                        }
                    }
                    throw new scanner_1.MediaQueryError((0, i18n_1.i) `Expected one of {Number, Boolean, Identifier, String}, found token ${JSON.stringify(cursor.text)}`, cursor.position.line, cursor.position.column);
                }
                return new Expression(feature, undefined, isNotted);
            }
            case scanner_1.Kind.NotKeyword:
                if (isNotted) {
                    throw new scanner_1.MediaQueryError((0, i18n_1.i) `Expression specified NOT twice`, cursor.position.line, cursor.position.column);
                }
                cursor.take(); // suck up the not token
                return Expression.parse(cursor, true, inParen);
            case scanner_1.Kind.OpenParen: {
                cursor.take();
                const result = Expression.parse(cursor, isNotted, inParen);
                takeWhitespace(cursor);
                if (cursor.kind !== scanner_1.Kind.CloseParen) {
                    throw new scanner_1.MediaQueryError((0, i18n_1.i) `Expected close parenthesis for expression, found ${JSON.stringify(cursor.text)}`, cursor.position.line, cursor.position.column);
                }
                cursor.take();
                return result;
            }
            default:
                throw new scanner_1.MediaQueryError((0, i18n_1.i) `Expected expression, found ${JSON.stringify(cursor.text)}`, cursor.position.line, cursor.position.column);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkaWEtcXVlcnkuanMiLCJzb3VyY2VSb290IjoiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL21pY3Jvc29mdC92Y3BrZy10b29sL21haW4vdmNwa2ctYXJ0aWZhY3RzLyIsInNvdXJjZXMiOlsibWVkaWFxdWVyeS9tZWRpYS1xdWVyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsdUNBQXVDO0FBQ3ZDLGtDQUFrQzs7O0FBRWxDLGtDQUE0QjtBQUM1Qix1Q0FBa0U7QUFFbEUsU0FBZ0IsVUFBVSxDQUFDLElBQVk7SUFDckMsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRWpDLE9BQU8sU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNqQyxDQUFDO0FBSkQsZ0NBSUM7QUFFRCxTQUFnQixjQUFjLENBQUMsTUFBZTtJQUM1QyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxZQUFZLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFDMUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0tBQ2Y7QUFDSCxDQUFDO0FBSkQsd0NBSUM7QUFFRCxTQUFTLFlBQVksQ0FBQyxNQUFlO0lBQ25DLE9BQU8sTUFBTSxDQUFDLElBQUksS0FBSyxjQUFJLENBQUMsVUFBVSxDQUFDO0FBQ3pDLENBQUM7QUFFRCxNQUFNLFNBQVM7SUFDYixPQUFPLEdBQUcsSUFBSSxLQUFLLEVBQVMsQ0FBQztJQUM3QixJQUFJLE9BQU87UUFDVCxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztJQUNyQixDQUFDO0lBQ0QsS0FBSyxDQUFtQjtJQUV4QjtRQUNFLEVBQUU7SUFDSixDQUFDO0lBRUQsSUFBSSxNQUFNO1FBQ1IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztJQUM3QixDQUFDO0lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFlO1FBQzFCLE1BQU0sTUFBTSxHQUFHLElBQUks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
// SIG // Begin signature block
// SIG // MIIoKwYJKoZIhvcNAQcCoIIoHDCCKBgCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // 7RIMqzBtVDBEEi9YmLtEo56ksmObt6DU0kuRGINTtyGg
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
// SIG // DQEJBDEiBCDmh8BJmRSWuXmzyvLv+UzVmm8FqDEZX4VN
// SIG // /rL8EAFfczBCBgorBgEEAYI3AgEMMTQwMqAUgBIATQBp
// SIG // AGMAcgBvAHMAbwBmAHShGoAYaHR0cDovL3d3dy5taWNy
// SIG // b3NvZnQuY29tMA0GCSqGSIb3DQEBAQUABIIBAIk3UqTX
// SIG // rMd7EK5/l5yXb0f8J0M2B7bAHfp6AOtz4OWjDvDYdRd4
// SIG // 1jWwXrlFeh0dRhEY3NG1dsbH/Yz4CHr0NvELqRX87Us1
// SIG // UKQ8x4NKweQTtmbOtd/JHQwYLiZSx68MBF2v7qSQztsi
// SIG // PxSRnVu6NwuLwvM0TKgKA6I0S6EN5yUKAOlewuhQn6+A
// SIG // S6bLho09gkW00/BfmfYX5yK5nBtBddO94orFeArgpYn8
// SIG // yhOoih8g49NovHG9XwNYeLjmS4NJvwhdi428WAWIi8l2
// SIG // MfZi3NG3O9QsYcqO0VcaNMXC3GUH+Hjb5GmDKOKO7uO6
// SIG // 3H2RRflfHu0fo+kP7KWgWjF3hhihgheXMIIXkwYKKwYB
// SIG // BAGCNwMDATGCF4Mwghd/BgkqhkiG9w0BBwKgghdwMIIX
// SIG // bAIBAzEPMA0GCWCGSAFlAwQCAQUAMIIBUgYLKoZIhvcN
// SIG // AQkQAQSgggFBBIIBPTCCATkCAQEGCisGAQQBhFkKAwEw
// SIG // MTANBglghkgBZQMEAgEFAAQgO2q8zhK4TyiFrf1mv70G
// SIG // 7S5skaPPPTkXNG5S/2Mmp3gCBmVWx6TdRxgTMjAyMzEy
// SIG // MTIxOTAzMzguMzQ1WjAEgAIB9KCB0aSBzjCByzELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjElMCMGA1UECxMcTWljcm9zb2Z0
// SIG // IEFtZXJpY2EgT3BlcmF0aW9uczEnMCUGA1UECxMeblNo
// SIG // aWVsZCBUU1MgRVNOOjkyMDAtMDVFMC1EOTQ3MSUwIwYD
// SIG // VQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2aWNl
// SIG // oIIR7TCCByAwggUIoAMCAQICEzMAAAHPUja+cUvNSMoA
// SIG // AQAAAc8wDQYJKoZIhvcNAQELBQAwfDELMAkGA1UEBhMC
// SIG // VVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcT
// SIG // B1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jw
// SIG // b3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgUENBIDIwMTAwHhcNMjMwNTI1MTkxMjExWhcN
// SIG // MjQwMjAxMTkxMjExWjCByzELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjElMCMGA1UECxMcTWljcm9zb2Z0IEFtZXJpY2EgT3Bl
// SIG // cmF0aW9uczEnMCUGA1UECxMeblNoaWVsZCBUU1MgRVNO
// SIG // OjkyMDAtMDVFMC1EOTQ3MSUwIwYDVQQDExxNaWNyb3Nv
// SIG // ZnQgVGltZS1TdGFtcCBTZXJ2aWNlMIICIjANBgkqhkiG
// SIG // 9w0BAQEFAAOCAg8AMIICCgKCAgEAuD3LfteU2Mq1I3ue
// SIG // d5cwUKHYJneQc+1rh/EnR6QKFs/tNU6xxMQUrmjCp8b1
// SIG // TLMmLWrOYemqKVBgEuVilS2QL1LR+tkypgBNCSvotYWn
// SIG // 4gkly2T3EXscXkZDqnmXnywc16dJ7nTDl1FGm9990rPC
// SIG // 5KCuJdy2MZtRG7K929jk6Nnm7AKDSeJEsZlbjzOwvkQ4
// SIG // RrVSkfxJh7EPRnMBppbrueG6olRXdKABQW8OLcU1NZq7
// SIG // iBlj/4vrIIjar3Vf8Gof0HKyohpaVojq/WuWhqyWj0kA
// SIG // 9sYBA3T260n5WMbETHWQiSPL87zr+gZbj3DzxhlSxGlO
// SIG // zrM3WIyuX+GeUrv5TytXkk+TwuERbFXDokuC9LCOCBWc
// SIG // sCHQyR6CoHalkaekObxA5PJL2c+h1hZ2CzpR7qjBGL0C
// SIG // 6+joKKGFPc9AOXDCxxCB2FdcYmgc8dhEYkWPTFD1qIYf
// SIG // k6WVhFGZVJv6vWp11UTdLo3o5ujrFFRQ7LCDLM0TQqhK
// SIG // LSRsLRx5ucawiriZBa/Bn8DXpRZflw6B160GC/c2Ozaf
// SIG // n67E10KSkTZ5iNWrIXJ+RAvsMVLfxGSLJFs3sBH7dP/v
// SIG // 9IN/vGLTJFHWkBOfvHuwvFDIlzh5DCtuYzTUKiwnnZSc
// SIG // BSH/Yq/UqTHO9jUftY+lHm4s/2T1e+HaN43Vb6uw4jxZ
// SIG // U2/dlCsCAwEAAaOCAUkwggFFMB0GA1UdDgQWBBQ2nij7
// SIG // adHk0lXRvoGXOQQ5Gm04ODAfBgNVHSMEGDAWgBSfpxVd
// SIG // AF5iXYP05dJlpxtTNRnpcjBfBgNVHR8EWDBWMFSgUqBQ
// SIG // hk5odHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3Bz
// SIG // L2NybC9NaWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIwUENB
// SIG // JTIwMjAxMCgxKS5jcmwwbAYIKwYBBQUHAQEEYDBeMFwG
// SIG // CCsGAQUFBzAChlBodHRwOi8vd3d3Lm1pY3Jvc29mdC5j
// SIG // b20vcGtpb3BzL2NlcnRzL01pY3Jvc29mdCUyMFRpbWUt
// SIG // U3RhbXAlMjBQQ0ElMjAyMDEwKDEpLmNydDAMBgNVHRMB
// SIG // Af8EAjAAMBYGA1UdJQEB/wQMMAoGCCsGAQUFBwMIMA4G
// SIG // A1UdDwEB/wQEAwIHgDANBgkqhkiG9w0BAQsFAAOCAgEA
// SIG // UIJuKZwNMZHf/bilyTM3TGMsVH1Jv2brFAWt9jBGV0Lj
// SIG // BqdtKUrl9lVvf7aUzKOW5GiXQVaFMndg2w7DW9ZI6/9+
// SIG // p7U9I7y9wKFkrQBYWQcqZqT28fgTyuPWZXo5TOHeXqV+
// SIG // uvLUURnxYqfU4pfcikX1wa15zP6uuCIpze81xENxRUIX
// SIG // STM7fIm1wpTu3hQPtR4sGT1srGFj2/2ThaGzxDL14nvh
// SIG // phG0ym4RObc3ukawPWno4z/r9aLhaA+WzI+UIPsH2V6n
// SIG // voX2CqTHfEDp0Mns/jZY9YrcpzmVn8B1Ue3VcFdMi0pT
// SIG // 0/shyDvIPt31ogMKaDte2w3J7Ume2DgZY16yIGneFuIF
// SIG // /uLadXgbHOl1iCEzwTc8UA2WUcQ+K18zgel0ZRFSXWGU
// SIG // PIG1zoq4P3Tb0thsXEedEHTlwwLpnRB2hjR2+stiJyWn
// SIG // Qj6dok+UCwuDJ80fmGZ6NW/JlqQnTnUbPYNtUG26yNOo
// SIG // i5PSg+tZ8eyuUXkrnLkuWfZ25CAWi1MQ3rBYa9cJndcp
// SIG // 39B0OdUsK8oe2CO0109I6/NZm77yPcbaKoxbyITQbCAn
// SIG // Qn00fdcpSUx/FrVJaQ4RIEqlrd4MzSz00r1wMV06SDOf
// SIG // N7GXXfv9mBgAzHlprfD7jHHuhrCHCwjhdjYmGddElx2U
// SIG // uR0ay6wobs3nQ0YrFqSLubkwggdxMIIFWaADAgECAhMz
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
// SIG // BAsTHm5TaGllbGQgVFNTIEVTTjo5MjAwLTA1RTAtRDk0
// SIG // NzElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAg
// SIG // U2VydmljZaIjCgEBMAcGBSsOAwIaAxUA6vMc1V8C4Lmr
// SIG // gEI9a6yeP08hDJuggYMwgYCkfjB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMDANBgkqhkiG9w0BAQsFAAIFAOki
// SIG // 4wkwIhgPMjAyMzEyMTIxMzQ3NTNaGA8yMDIzMTIxMzEz
// SIG // NDc1M1owdzA9BgorBgEEAYRZCgQBMS8wLTAKAgUA6SLj
// SIG // CQIBADAKAgEAAgIEGQIB/zAHAgEAAgITWjAKAgUA6SQ0
// SIG // iQIBADA2BgorBgEEAYRZCgQCMSgwJjAMBgorBgEEAYRZ
// SIG // CgMCoAowCAIBAAIDB6EgoQowCAIBAAIDAYagMA0GCSqG
// SIG // SIb3DQEBCwUAA4IBAQCahylKkLUZhBtbz6gxekxRI/lF
// SIG // EgBy705hUulnrzwZh5k9D9iuhN+R6TsszQRwcb5pRRUD
// SIG // pZL46uENdzpkMxkPyCm6T+uZLlVMlc2w1ih6f4pSNsGn
// SIG // gOCnrFvqXzlnYLkgedlRMtrvuR9YB+UXaOnMkKb7PPgP
// SIG // b4XV4Y9+PRwqyqU/H3vRgu7CARtHBIJvMSbNJ7cWg7kh
// SIG // jSp0e4l3MWWFQlQyxlVf31ciIxmT2mCKw9OyG9CWLbmA
// SIG // d7h31gvw1/CFi/M+NnUjDYF0ydwkmn1NgeI7VGEFB2Y1
// SIG // hgtBcr6mEaDXIIf3ZbmxHhasanmneVyGz1JMqgh2tcd+
// SIG // 4yCsaLRBMYIEDTCCBAkCAQEwgZMwfDELMAkGA1UEBhMC
// SIG // VVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcT
// SIG // B1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jw
// SIG // b3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgUENBIDIwMTACEzMAAAHPUja+cUvNSMoAAQAA
// SIG // Ac8wDQYJYIZIAWUDBAIBBQCgggFKMBoGCSqGSIb3DQEJ
// SIG // AzENBgsqhkiG9w0BCRABBDAvBgkqhkiG9w0BCQQxIgQg
// SIG // /up3IOAM/NjRyFui7hvfaeiRCbRu4jWIzRV5mYtjzScw
// SIG // gfoGCyqGSIb3DQEJEAIvMYHqMIHnMIHkMIG9BCCz6bC6
// SIG // njUuDbmFxNlSZTLr0HllQPNGQxYaTj40s4T2vzCBmDCB
// SIG // gKR+MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNo
// SIG // aW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQK
// SIG // ExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMT
// SIG // HU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwAhMz
// SIG // AAABz1I2vnFLzUjKAAEAAAHPMCIEIDLcviAm9+BYvp7i
// SIG // Zo+aR9SIDMQoqS8vIV7N1DueULEXMA0GCSqGSIb3DQEB
// SIG // CwUABIICABXQ0vwNaK3fowquz7FZi96/jd/7Xuhs4x41
// SIG // DwTNJdp6sjVyXNgCgTPLeVEMvLveQdnNlbP2LrIT4Kzg
// SIG // LXP+gTOwmObkNmp684t8lYQ96RFoxVf64WYSfVASg6pQ
// SIG // Kbd5O8fP75LZyzyIk4v6B/LkE5W4a6u+bOf5Rh+/4PTK
// SIG // xGWOXoD5a38ApiHGa8vlwnLqBr1XdHadTR5mDf1ubzte
// SIG // rbhNvjfL8wbEOu4SGFi/jKOAxKreKj52jGs0ZCMUtLpd
// SIG // kKsyTbaL7cWtqpobdWMXh7J6SNfKnjBDxeIIGjdWA9xs
// SIG // FI75oUjDwGHJ92He2M9TXJuZOJJCTs0nMU71SLLriiLT
// SIG // dgO4SDG97hmK9FJLTHzlbP5q2JvOwe+7gmWeIG9j9XI1
// SIG // iRi1kN/NOguvGQ8rZL+Drn8FHyCTN6Iu4Ne2s1SiSYBH
// SIG // 5q6agtcCH7t6JzeC+0uB5dCjKzL1c5KJhGk3/lHgYhi3
// SIG // qFYKeNPvks44QW6hWVnGs9XCIfulVTvEJm701TIcWMIV
// SIG // cg7sUpr9WJBE+CPp/RpK/CX3UlwZATDCkOQLXqEAHtS3
// SIG // BiqsG099a53UqNsh77MBf4ZjzZFjzW0wZpvdyUZA2lr4
// SIG // gYLwxzItJHlvvCpNQnSoXmVuWk0U+mzUSB24m/2wkOcF
// SIG // bxGAlcizlrwNN9FhDUPuE0elx7P4W3Re
// SIG // End signature block
