"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystem = exports.ReadHandle = exports.FileType = void 0;
/* eslint-disable @typescript-eslint/ban-types */
const node_events_1 = require("node:events");
const stream_1 = require("stream");
const uri_1 = require("../util/uri");
const size64K = 1 << 16;
const size32K = 1 << 15;
/**
* Enumeration of file types. The types `File` and `Directory` can also be
* a symbolic links, in that case use `FileType.File | FileType.SymbolicLink` and
* `FileType.Directory | FileType.SymbolicLink`.
*/
var FileType;
(function (FileType) {
    /**
     * The file type is unknown.
     */
    FileType[FileType["Unknown"] = 0] = "Unknown";
    /**
     * A regular file.
     */
    FileType[FileType["File"] = 1] = "File";
    /**
     * A directory.
     */
    FileType[FileType["Directory"] = 2] = "Directory";
    /**
     * A symbolic link to a file.
     */
    FileType[FileType["SymbolicLink"] = 64] = "SymbolicLink";
})(FileType = exports.FileType || (exports.FileType = {}));
/**
 * A random-access reading interface to access a file in a FileSystem.
 *
 * Ideally, we keep reads in a file to a forward order, so that this can be implemented on filesystems
 * that do not support random access (ie, please do your best to order reads so that they go forward only as much as possible)
 *
 * Underneath on FSes that do not support random access, this would likely require multiple 'open' operation for the same
 * target file.
 */
class ReadHandle {
    async readComplete(buffr, offset = 0, length = buffr.byteLength, position = null, totalRead = 0) {
        const { bytesRead, buffer } = await this.read(buffr, offset, length, position);
        if (length) {
            if (bytesRead && bytesRead < length) {
                return await this.readComplete(buffr, offset + bytesRead, length - bytesRead, position ? position + bytesRead : null, bytesRead + totalRead);
            }
        }
        return { bytesRead: bytesRead + totalRead, buffer };
    }
    /**
     * Returns a Readable for consuming an opened ReadHandle
     * @param start the first byte to read of the target
     * @param end the last byte to read of the target (inclusive!)
     */
    readStream(start = 0, end = Infinity) {
        return stream_1.Readable.from(asyncIterableOverHandle(start, end, this), {});
    }
    range(start, length) {
        return new RangeReadHandle(this, start, length);
    }
}
exports.ReadHandle = ReadHandle;
class RangeReadHandle extends ReadHandle {
    start;
    length;
    pos = 0;
    readHandle;
    constructor(readHandle, start, length) {
        super();
        this.start = start;
        this.length = length;
        this.readHandle = readHandle;
    }
    async read(buffer, offset, length, position) {
        if (this.readHandle) {
            position = position !== undefined && position !== null ? (position + this.start) : (this.pos + this.start);
            length = length === null ? this.length : length;
            const result = await this.readHandle.read(buffer, offset, length, position);
            this.pos += result.bytesRead;
            return result;
        }
        return {
            bytesRead: 0, buffer
        };
    }
    async size() {
        return this.length;
    }
    async close() {
        this.readHandle = undefined;
    }
}
/**
 * Picks a reasonable buffer size. Not more than 64k
 *
 * @param length
 */
function reasonableBuffer(length) {
    return Buffer.alloc(length > size64K ? size32K : length);
}
/**
 * Creates an AsyncIterable<Buffer> over a ReadHandle
 * @param start the first byte in the target read from
 * @param end the last byte in the target to read from
 * @param handle the ReadHandle
 */
async function* asyncIterableOverHandle(start, end, handle) {
    while (start < end) {
        // buffer alloc must be inside the loop; zlib will hold the buffers until it can deal with a whole stream.
        const buffer = reasonableBuffer(1 + end - start);
        const count = Math.min(1 + end - start, buffer.byteLength);
        const b = await handle.read(buffer, 0, count, start);
        if (b.bytesRead === 0) {
            return;
        }
        start += b.bytesRead;
        // return only what was actually read. (just a view)
        if (b.bytesRead === buffer.byteLength) {
            yield buffer;
        }
        else {
            yield buffer.slice(0, b.bytesRead);
        }
    }
}
class FileSystem extends node_events_1.EventEmitter {
    session;
    baseUri;
    /**
   * Creates a new URI from a file system path, e.g. `c:\my\files`,
   * `/usr/home`, or `\\server\share\some\path`.
   *
   * associates this FileSystem with the Uri
   *
   * @param path A file system path (see `URI#fsPath`)
   */
    file(path) {
        return uri_1.Uri.file(this, path);
    }
    /** construct an Uri from the various parts */
    from(components) {
        return uri_1.Uri.from(this, components);
    }
    /**
   * Creates a new URI from a string, e.g. `https://www.msft.com/some/path`,
   * `file:///usr/home`, or `scheme:with/path`.
   *
   * @param value A string which represents an URI (see `URI#toString`).
   */
    parseUri(value, _strict) {
        return uri_1.Uri.parse(this, value, _strict);
    }
    /** checks to see if the target exists */
    async exists(uri) {
        try {
            return !!(await this.stat(uri));
        }
        catch (e) {
            // if this fails, we're assuming false
        }
        return false;
    }
    /** checks to see if the target is a directory/folder */
    async isDirectory(uri) {
        try {
            return !!((await this.stat(uri)).type & FileType.Directory);
        }
        catch {
            // if this fails, we're assuming false
        }
        return false;
    }
    /** checks to see if the target is a file */
    async isFile(uri) {
        try {
            const s = await this.stat(uri);
            return !!(s.type & FileType.File);
        }
        catch {
            // if this fails, we're assuming false
        }
        return false;
    }
    /** checks to see if the target is a symbolic link */
    async isSymlink(uri) {
        try {
            return !!((await this.stat(uri)) && FileType.SymbolicLink);
        }
        catch {
            // if this fails, we're assuming false
        }
        return false;
    }
    constructor(session) {
        super();
        this.session = session;
    }
    /** EventEmitter for when files are read */
    read(path, context) {
        this.emit('read', path, context, this.session.stopwatch.total);
    }
    /** EventEmitter for when files are written */
    write(path, context) {
        this.emit('write', path, context, this.session.stopwatch.total);
    }
    /** EventEmitter for when files are deleted */
    deleted(path, context) {
        this.emit('deleted', path, context, this.session.stopwatch.total);
    }
    /** EventEmitter for when files are renamed */
    renamed(path, context) {
        this.emit('renamed', path, context, this.session.stopwatch.total);
    }
    /** EventEmitter for when directories are read */
    directoryRead(path, contents) {
        this.emit('directoryRead', path, contents, this.session.stopwatch.total);
    }
    /** EventEmitter for when direcotries are created */
    directoryCreated(path, context) {
        this.emit('directoryCreated', path, context, this.session.stopwatch.total);
    }
}
exports.FileSystem = FileSystem;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZXN5c3RlbS5qcyIsInNvdXJjZVJvb3QiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vbWljcm9zb2Z0L3ZjcGtnLXRvb2wvbWFpbi92Y3BrZy1hcnRpZmFjdHMvIiwic291cmNlcyI6WyJmcy9maWxlc3lzdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSx1Q0FBdUM7QUFDdkMsa0NBQWtDOzs7QUFFbEMsaURBQWlEO0FBRWpELDZDQUEyQztBQUMzQyxtQ0FBNEM7QUFFNUMscUNBQWtDO0FBRWxDLE1BQU0sT0FBTyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDeEIsTUFBTSxPQUFPLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQXVDeEI7Ozs7RUFJRTtBQUNGLElBQVksUUFpQlg7QUFqQkQsV0FBWSxRQUFRO0lBQ2xCOztPQUVHO0lBQ0gsNkNBQVcsQ0FBQTtJQUNYOztPQUVHO0lBQ0gsdUNBQVEsQ0FBQTtJQUNSOztPQUVHO0lBQ0gsaURBQWEsQ0FBQTtJQUNiOztPQUVHO0lBQ0gsd0RBQWlCLENBQUE7QUFDbkIsQ0FBQyxFQWpCVyxRQUFRLEdBQVIsZ0JBQVEsS0FBUixnQkFBUSxRQWlCbkI7QUFRRDs7Ozs7Ozs7R0FRRztBQUNILE1BQXNCLFVBQVU7SUFXOUIsS0FBSyxDQUFDLFlBQVksQ0FBNkIsS0FBYyxFQUFFLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLEtBQUssQ0FBQyxVQUFVLEVBQUUsV0FBMEIsSUFBSSxFQUFFLFNBQVMsR0FBRyxDQUFDO1FBQ2pKLE1BQU0sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQy9FLElBQUksTUFBTSxFQUFFO1lBQ1YsSUFBSSxTQUFTLElBQUksU0FBUyxHQUFHLE1BQU0sRUFBRTtnQkFDbkMsT0FBTyxNQUFNLElBQUksQ0FB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
// SIG // Begin signature block
// SIG // MIIoKwYJKoZIhvcNAQcCoIIoHDCCKBgCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // nLkG9ta88s7AMrRh67jTSV5nCt9M+PUfGPBYuaVkQOmg
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
// SIG // DQEJBDEiBCAH/Il6185HQp3xu/1GtVe4W1brTrdzv99K
// SIG // mj0acxEDRDBCBgorBgEEAYI3AgEMMTQwMqAUgBIATQBp
// SIG // AGMAcgBvAHMAbwBmAHShGoAYaHR0cDovL3d3dy5taWNy
// SIG // b3NvZnQuY29tMA0GCSqGSIb3DQEBAQUABIIBAFuzUe/W
// SIG // CBvvp38iFQW9DD8isPqF36dWfzAE1xYj0jpnyZxHSQbx
// SIG // FxeT8bHgz6B3doWzogvASkBVNzhtQ03qfX2mRAly4h07
// SIG // EU1zuqf0bJr16/8MOJxtvtMfrmBJhJNDDchWj/vmfJgu
// SIG // VoU/y8F4ZZjsZ5oJtTtAei0RpAknsnsjameobCrRkrSx
// SIG // XwuW6H6/OJwlnDO/E0e+QVOQpHpKmeYo16vGtWlitQnS
// SIG // QkhR9ajlCCbHB8MRZpom1Ao2Ty4QY2bUOF3o00zgYXCz
// SIG // 3fdm+vqvYs3cYcuDuE57bwENXdliDL8RENqKeOMBcrzF
// SIG // ULAHpAHiubdum/OMSi6pWstHawOhgheXMIIXkwYKKwYB
// SIG // BAGCNwMDATGCF4Mwghd/BgkqhkiG9w0BBwKgghdwMIIX
// SIG // bAIBAzEPMA0GCWCGSAFlAwQCAQUAMIIBUgYLKoZIhvcN
// SIG // AQkQAQSgggFBBIIBPTCCATkCAQEGCisGAQQBhFkKAwEw
// SIG // MTANBglghkgBZQMEAgEFAAQgbFr79+chjwHjQr8BK+QB
// SIG // eRX4woLGR+XWh5Tn/6YFVJgCBmVorf0rAhgTMjAyMzEy
// SIG // MTIxOTAzNDQuMDk3WjAEgAIB9KCB0aSBzjCByzELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjElMCMGA1UECxMcTWljcm9zb2Z0
// SIG // IEFtZXJpY2EgT3BlcmF0aW9uczEnMCUGA1UECxMeblNo
// SIG // aWVsZCBUU1MgRVNOOjdGMDAtMDVFMC1EOTQ3MSUwIwYD
// SIG // VQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2aWNl
// SIG // oIIR7TCCByAwggUIoAMCAQICEzMAAAHVqQLPxafJ6VoA
// SIG // AQAAAdUwDQYJKoZIhvcNAQELBQAwfDELMAkGA1UEBhMC
// SIG // VVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcT
// SIG // B1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jw
// SIG // b3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgUENBIDIwMTAwHhcNMjMwNTI1MTkxMjMwWhcN
// SIG // MjQwMjAxMTkxMjMwWjCByzELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjElMCMGA1UECxMcTWljcm9zb2Z0IEFtZXJpY2EgT3Bl
// SIG // cmF0aW9uczEnMCUGA1UECxMeblNoaWVsZCBUU1MgRVNO
// SIG // OjdGMDAtMDVFMC1EOTQ3MSUwIwYDVQQDExxNaWNyb3Nv
// SIG // ZnQgVGltZS1TdGFtcCBTZXJ2aWNlMIICIjANBgkqhkiG
// SIG // 9w0BAQEFAAOCAg8AMIICCgKCAgEAxX2pOezqYfb7sbZa
// SIG // AAYi3Onp0/sih+tfW/joRnZMoYDc5F/NClBiP4xKjlTF
// SIG // eEqrf1DxRYncdre79khE49rQM7lSrQ36thwabvNL2dL8
// SIG // kA8nVbeDAy+LSUiqoGKHwsQyAa1sySY4AaJSnTicdbrd
// SIG // k8jnPlDpu3vdrVTx6Y3YPjpn99Uy1H/6KLsgDifyJ59o
// SIG // odwEj9EGJvgBUI4WAzQ7vLszHcBxeUHcLLHDWvT1Uhnn
// SIG // S3Qy6PYy+g6DxeDWKNOpb7xELkifSJsGXwRi8v/IaRO0
// SIG // Q+HsLySpjNfrenkLhLE146xjNlo5FtfEoFGfJ/laS9rp
// SIG // OgIQ5Amt+eSOd9adCZKqaKJ+3R7i1HWUkDuNKplSEOqk
// SIG // Amp7yJk6pjYBP6zydK4K9ITDyP7kdU/4mi9JhKuG6mpP
// SIG // t7GvCPhQGDiPzwu1fsxHpPrHclrWl/p3Wxpb/0SW+ZkG
// SIG // hp/Dbp25H7xw9ULeQ9K5rTDnpGDKu0I2KhNxRD/8AGOE
// SIG // w7icbLY7Gth14tslAxIODCS+vyb7EF06DmfiMUeik+be
// SIG // XweRaWWAaVSzJmt6Zuc+lV75F62LN9zVyalVi8IrMGuz
// SIG // VBVfOxLNrKLvSHcN8gGZhyGFoDkPgyGNZ2N2huQzg4sD
// SIG // daychG/pm1g2oK3VcXJ3K+lCijuPXqDU1xFvrHFH+hsF
// SIG // xtChMpkCAwEAAaOCAUkwggFFMB0GA1UdDgQWBBSv0Fyj
// SIG // Tt+WwTDs90eYIl+wJWtjmjAfBgNVHSMEGDAWgBSfpxVd
// SIG // AF5iXYP05dJlpxtTNRnpcjBfBgNVHR8EWDBWMFSgUqBQ
// SIG // hk5odHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3Bz
// SIG // L2NybC9NaWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIwUENB
// SIG // JTIwMjAxMCgxKS5jcmwwbAYIKwYBBQUHAQEEYDBeMFwG
// SIG // CCsGAQUFBzAChlBodHRwOi8vd3d3Lm1pY3Jvc29mdC5j
// SIG // b20vcGtpb3BzL2NlcnRzL01pY3Jvc29mdCUyMFRpbWUt
// SIG // U3RhbXAlMjBQQ0ElMjAyMDEwKDEpLmNydDAMBgNVHRMB
// SIG // Af8EAjAAMBYGA1UdJQEB/wQMMAoGCCsGAQUFBwMIMA4G
// SIG // A1UdDwEB/wQEAwIHgDANBgkqhkiG9w0BAQsFAAOCAgEA
// SIG // ZkXXar0Lso0acdBxsbzqn3xa24BQINI/Nr9L+0fv/Gu9
// SIG // EtleLe8imCkrEBiOqb7dQPCRprmco5iF5sNtwJCOW2ZM
// SIG // b0oMLPK6wbScPb2pBHJHFhUG+yRum+tfMdLPUNwy9HUa
// SIG // uOkGUZ5u1Ott+JXnL47LQKMN9HT9E5yGnD1iqT3N0IAf
// SIG // lg54JTdn3U9a7kOliFQXp5qY6RvcqUQDSlMeTUXKXSQE
// SIG // FthahB00tzbW/tLQqiJDRyeWhbBenoUaL1madDGCM/W6
// SIG // SR4sdFa43S1TDqXu8L+trfdBN1KxNiplcKUOcLDA+mFL
// SIG // HKArEkUGawOQG8EzgmSaXhts97w6P4brzyvE3kydi7bv
// SIG // yLV4MSJSDkKf7WxwIjfF6bcPyZiGYPXnUPxYg2iCMBuW
// SIG // B7H5tru08Dhcnejqi8NfGeY/yLwz85ZMFicZOkRyReXU
// SIG // uLN358i8NwxwXuQ2r+imAeJ/Mf3BJg/0eOP/IEuT37ht
// SIG // bK4y3cshrcodCokQ0po8Pn2u4tVT6HponQ1jWe5LDWnT
// SIG // GneGaA74JKjleAOmvjfByHPz+oNIq63sy1lIGyl0jfIh
// SIG // /UT/liRceXwRxOABca2wFENmZ+Yw5hwCN8GHEA55xGD+
// SIG // dQO+VhcD7Lwa3629fumtX7kxB9QGHTjjMvH1/MSqNBNG
// SIG // LPu28SLxT7FKUs3xYwaJZocwggdxMIIFWaADAgECAhMz
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
// SIG // BAsTHm5TaGllbGQgVFNTIEVTTjo3RjAwLTA1RTAtRDk0
// SIG // NzElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAg
// SIG // U2VydmljZaIjCgEBMAcGBSsOAwIaAxUAThIvkv2VRXus
// SIG // NSHd9ZuioHtupTSggYMwgYCkfjB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMDANBgkqhkiG9w0BAQsFAAIFAOki
// SIG // /awwIhgPMjAyMzEyMTIxNTQxMzJaGA8yMDIzMTIxMzE1
// SIG // NDEzMlowdzA9BgorBgEEAYRZCgQBMS8wLTAKAgUA6SL9
// SIG // rAIBADAKAgEAAgIBuAIB/zAHAgEAAgIT2TAKAgUA6SRP
// SIG // LAIBADA2BgorBgEEAYRZCgQCMSgwJjAMBgorBgEEAYRZ
// SIG // CgMCoAowCAIBAAIDB6EgoQowCAIBAAIDAYagMA0GCSqG
// SIG // SIb3DQEBCwUAA4IBAQBayFZD1/Ysjeb6RU/NetzOaKRx
// SIG // 3HUAuWoeYmfFnLAa2ePlYdCCuH3918dy9Y53lGCcONvl
// SIG // 4SI/1SW1Kcr8Ju8NXGzCeALIZJkFVRS4errzhWVdrz4v
// SIG // mtFW9LHZhWO/jcMVnez+RwIHupd/C/1h/7dkM9NUczm4
// SIG // NdmnKv4TqO2aoT4NXYKSyUBYW2PXGcxxkSzZWkqm2YrF
// SIG // Zta0/HUWe8tFEZV9xAnVhVX7SWuGGCmjeTp81d0UKek5
// SIG // ftBr1Dpbai6IH87z5yTqpOLrpMf0oeXlREKvBZI95igf
// SIG // JYedFMkHEQfYJUUvV68XOcliaD71j0Stmcbqz/BlWYH3
// SIG // GDdxLhR+MYIEDTCCBAkCAQEwgZMwfDELMAkGA1UEBhMC
// SIG // VVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcT
// SIG // B1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jw
// SIG // b3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgUENBIDIwMTACEzMAAAHVqQLPxafJ6VoAAQAA
// SIG // AdUwDQYJYIZIAWUDBAIBBQCgggFKMBoGCSqGSIb3DQEJ
// SIG // AzENBgsqhkiG9w0BCRABBDAvBgkqhkiG9w0BCQQxIgQg
// SIG // 7bBoZt5Za+E3O989C67t30uOcc2iO8Syr6Uo3UysQBcw
// SIG // gfoGCyqGSIb3DQEJEAIvMYHqMIHnMIHkMIG9BCDZvyOG
// SIG // DNeuiTDOxCiHGL5XG69gh4ygtC1DpqWSGwbB/zCBmDCB
// SIG // gKR+MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNo
// SIG // aW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQK
// SIG // ExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMT
// SIG // HU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwAhMz
// SIG // AAAB1akCz8WnyelaAAEAAAHVMCIEIFkxckJpT3b1W2L+
// SIG // y9d8yQFART3HxtTGWnI87WYmxBucMA0GCSqGSIb3DQEB
// SIG // CwUABIICAHMIykJVPSMDgxPReFdwd6WAZKwo7Ny4cXNP
// SIG // BCkpr3cT+vFd+0cpeg018IaHsPVLUA30im3m+GJKPHG0
// SIG // CAVoswCbFncHFyGAKrJ6le62g6/d3E/2CFC4XbaDlTQ8
// SIG // bmhF5c/u//rS2Mp8tQquob0PN//WFECiPHiMhsMtS8TT
// SIG // offnDtPtOhPdJpG7pFjpnIKWHEU+oBAYJmD1oYm2ji1r
// SIG // CfnBD1NIfGS9sup72666jWb05EEu2Kl5RzTYWasBdR/2
// SIG // XlzcCkXVJs1mJ+t4bM5dlY8i1ayLlqXCSwovK0weuJ2A
// SIG // I1bfy1SzRM+Ks+uotjZca0tBJmEL6RfAb6J47pK99jZo
// SIG // n8EvFZVNvU7jMv1N87guLQZ227Vi+O26H5fuVb6XiIPt
// SIG // gXumTl3plnisaAQg2t/zwkvGkllbCByamIu7/9MC72qZ
// SIG // 0hP6mtvkMP1zzj/2DmKp5mKTsOSA++Vvhv+ONgd8aRo2
// SIG // L1wUppDEB4uP4K1T+TKTqiOY6gDjDfuWOqCQeCyQr9zO
// SIG // Uh9o9UUIAuqgubeAL6SOU3hkdsCSbKlo/hETlHW0kJMz
// SIG // +gV3WmTyWqZ0rsFbo+cqQ3xmvWI8Pn6JP+beMgANMZ5k
// SIG // A11s/mNB/5fwEp7gvBm4EgHeY78oep00f4BzInRasmA2
// SIG // BihVlLJDp7AOAunyA0f00nKseBszG0Vq
// SIG // End signature block
