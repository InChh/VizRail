/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { Readable, Writable } from 'stream';
import { URL } from 'url';
import { URI } from 'vscode-uri';
import { UriComponents } from 'vscode-uri/lib/umd/uri';
import { FileStat, FileSystem, FileType, ReadHandle, WriteStreamOptions } from '../fs/filesystem';
import { HashVerifyEvents } from '../interfaces/events';
import { Algorithm, Hash } from './hash';
/**
 * This class is intended to be a drop-in replacement for the vscode uri
 * class, but has a filesystem associated with it.
 *
 * By associating the filesystem with the URI, we can allow for file URIs
 * to be scoped to a given filesystem (ie, a zip could be a filesystem )
 *
 * Uniform Resource Identifier (URI) https://tools.ietf.org/html/rfc3986.
 * This class is a simple parser which creates the basic component parts
 * (https://tools.ietf.org/html/rfc3986#section-3) with minimal validation
 * and encoding.
 *
 *
 * ```txt
 *       foo://example.com:8042/over/there?name=ferret#nose
 *       \_/   \______________/\_________/ \_________/ \__/
 *        |           |            |            |        |
 *     scheme     authority       path        query   fragment
 *        |   _____________________|__
 *       / \ /                        \
 *       urn:example:animal:ferret:nose
 * ```
 *
 */
export declare class Uri implements URI {
    readonly fileSystem: FileSystem;
    protected readonly uri: URI;
    protected constructor(fileSystem: FileSystem, uri: URI);
    static readonly invalid: Uri;
    static isInvalid(uri?: Uri): boolean;
    /**
    * scheme is the 'https' part of 'https://www.msft.com/some/path?query#fragment'.
    * The part before the first colon.
    */
    get scheme(): string;
    /**
    * authority is the 'www.msft.com' part of 'https://www.msft.com/some/path?query#fragment'.
    * The part between the first double slashes and the next slash.
    */
    get authority(): string;
    /**
     * path is the '/some/path' part of 'https://www.msft.com/some/path?query#fragment'.
     */
    get path(): string;
    /**
     * query is the 'query' part of 'https://www.msft.com/some/path?query#fragment'.
     */
    get query(): string;
    /**
     * fragment is the 'fragment' part of 'https://www.msft.com/some/path?query#fragment'.
     */
    get fragment(): string;
    /**
    * Creates a new Uri from a string, e.g. `https://www.msft.com/some/path`,
    * `file:///usr/home`, or `scheme:with/path`.
    *
    * @param value A string which represents an URI (see `URI#toString`).
    */
    static parse(fileSystem: FileSystem, value: string, _strict?: boolean): Uri;
    /**
     * Creates a new Uri from a string, and replaces 'vsix' schemes with file:// instead.
     *
     * @param value A string which represents a URI which may be a VSIX uri.
     */
    static parseFilterVsix(fileSystem: FileSystem, value: string, _strict?: boolean, vsixBaseUri?: Uri): Uri;
    /**
   * Creates a new URI from a file system path, e.g. `c:\my\files`,
   * `/usr/home`, or `\\server\share\some\path`.
   *
   * The *difference* between `URI#parse` and `URI#file` is that the latter treats the argument
   * as path, not as stringified-uri. E.g. `URI.file(path)` is **not the same as**
   * `URI.parse('file://' + path)` because the path might contain characters that are
   * interpreted (# and ?). See the following sample:
   * ```ts
  const good = URI.file('/coding/c#/project1');
  good.scheme === 'file';
  good.path === '/coding/c#/project1';
  good.fragment === '';
  const bad = URI.parse('file://' + '/coding/c#/project1');
  bad.scheme === 'file';
  bad.path === '/coding/c'; // path is now broken
  bad.fragment === '/project1';
  ```
   *
   * @param path A file system path (see `URI#fsPath`)
   */
    static file(fileSystem: FileSystem, path: string): Uri;
    /** construct an Uri from the various parts */
    static from(fileSystem: FileSystem, components: {
        scheme: string;
        authority?: string;
        path?: string;
        query?: string;
        fragment?: string;
    }): Uri;
    /**
     * Join all arguments together and normalize the resulting Uri.
     *
     * Also ensures that slashes are all forward.
     * */
    join(...paths: Array<string>): Uri;
    relative(target: Uri): string;
    /** returns true if the uri represents a file:// resource. */
    get isLocal(): boolean;
    get isHttps(): boolean;
    /**
     * Returns a string representing the corresponding file system path of this URI.
     * Will handle UNC paths, normalizes windows drive letters to lower-case, and uses the
     * platform specific path separator.
     *
     * * Will *not* validate the path for invalid characters and semantics.
     * * Will *not* look at the scheme of this URI.
     * * The result shall *not* be used for display purposes but for accessing a file on disk.
     *
     *
     * The *difference* to `URI#path` is the use of the platform specific separator and the handling
     * of UNC paths. See the below sample of a file-uri with an authority (UNC path).
     *
     * ```ts
        const u = URI.parse('file://server/c$/folder/file.txt')
        u.authority === 'server'
        u.path === '/shares/c$/file.txt'
        u.fsPath === '\\server\c$\folder\file.txt'
    ```
     *
     * Using `URI#path` to read a file (using fs-apis) would not be enough because parts of the path,
     * namely the server name, would be missing. Therefore `URI#fsPath` exists - it's sugar to ease working
     * with URIs that represent files on disk (`file` scheme).
     */
    get fsPath(): string;
    /** Duplicates the current Uri, changing out any parts */
    with(change: {
        scheme?: string | undefined;
        authority?: string | null | undefined;
        path?: string | null | undefined;
        query?: string | null | undefined;
        fragment?: string | null | undefined;
    }): URI;
    /**
    * Creates a string representation for this URI. It's guaranteed that calling
    * `URI.parse` with the result of this function creates an URI which is equal
    * to this URI.
    *
    * * The result shall *not* be used for display purposes but for externalization or transport.
    * * The result will be encoded using the percentage encoding and encoding happens mostly
    * ignore the scheme-specific encoding rules.
    *
    * @param skipEncoding Do not encode the result, default is `false`
    */
    toString(skipEncoding?: boolean): string;
    get formatted(): string;
    /** returns a JSON object with the components of the Uri */
    toJSON(): UriComponents;
    toUrl(): URL;
    protected resolve(uriOrRelativePath?: Uri | string): Uri;
    stat(uri?: Uri | string): Promise<FileStat>;
    readDirectory(uri?: Uri | string, options?: {
        recursive?: boolean;
    }): Promise<Array<[Uri, FileType]>>;
    createDirectory(uri?: Uri | string): Promise<Uri>;
    readFile(uri?: Uri | string): Promise<Uint8Array>;
    readUTF8(uri?: Uri | string): Promise<string>;
    tryReadUTF8(uri?: Uri | string): Promise<string | undefined>;
    openFile(uri?: Uri | string): Promise<ReadHandle>;
    readStream(start?: number, end?: number): Promise<Readable>;
    readBlock(start?: number, end?: number): Promise<Buffer>;
    writeFile(content: Uint8Array): Promise<Uri>;
    writeUTF8(content: string): Promise<Uri>;
    writeStream(options?: WriteStreamOptions): Promise<Writable>;
    delete(options?: {
        recursive?: boolean;
        useTrash?: boolean;
    }): Promise<void>;
    exists(uri?: Uri | string): Promise<boolean>;
    isFile(uri?: Uri | string): Promise<boolean>;
    isSymlink(uri?: Uri | string): Promise<boolean>;
    isDirectory(uri?: Uri | string): Promise<boolean>;
    size(uri?: Uri | string): Promise<number>;
    hash(algorithm?: Algorithm): Promise<string | undefined>;
    hashValid(events: Partial<HashVerifyEvents>, matchOptions?: Hash): Promise<boolean>;
    get parent(): Uri;
}
export declare function isFilePath(uriOrPath?: Uri | string): boolean;
//# sourceMappingURL=uri.d.ts.map