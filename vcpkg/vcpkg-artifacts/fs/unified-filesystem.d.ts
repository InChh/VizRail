/// <reference types="node" />
import { Readable, Writable } from 'stream';
import { Uri } from '../util/uri';
import { FileStat, FileSystem, FileType, ReadHandle, WriteStreamOptions } from './filesystem';
/**
 * gets the scheme off the front of an uri.
 * @param uri the uri to get the scheme for.
 * @returns the scheme, undefined if the uri has no scheme (colon)
 */
export declare function schemeOf(uri: string): string | undefined;
export declare class UnifiedFileSystem extends FileSystem {
    private filesystems;
    /** registers a scheme to a given filesystem
     *
     * @param scheme the Uri scheme to reserve
     * @param fileSystem the filesystem to associate with the scheme
     */
    register(scheme: string, fileSystem: FileSystem): this;
    /**
     * gets the filesystem for the given uri.
     *
     * @param uri the uri to check the filesystem for
     *
     * @returns the filesystem. Will throw if no filesystem is valid.
     */
    filesystem(uri: string | Uri): FileSystem;
    /**
    * Creates a new URI from a string, e.g. `https://www.msft.com/some/path`,
    * `file:///usr/home`, or `scheme:with/path`.
    *
    * @param uri A string which represents an URI (see `URI#toString`).
    */
    parseUri(uri: string, _strict?: boolean): Uri;
    stat(uri: Uri): Promise<FileStat>;
    readDirectory(uri: Uri, options?: {
        recursive?: boolean;
    }): Promise<Array<[Uri, FileType]>>;
    createDirectory(uri: Uri): Promise<void>;
    readFile(uri: Uri): Promise<Uint8Array>;
    openFile(uri: Uri): Promise<ReadHandle>;
    writeFile(uri: Uri, content: Uint8Array): Promise<void>;
    readStream(uri: Uri, options?: {
        start?: number;
        end?: number;
    }): Promise<Readable>;
    writeStream(uri: Uri, options?: WriteStreamOptions): Promise<Writable>;
    delete(uri: Uri, options?: {
        recursive?: boolean | undefined;
        useTrash?: boolean | undefined;
    }): Promise<void>;
    rename(source: Uri, target: Uri, options?: {
        overwrite?: boolean | undefined;
    }): Promise<void>;
    copy(source: Uri, target: Uri, options?: {
        overwrite?: boolean | undefined;
    }): Promise<number>;
    createSymlink(original: Uri, symlink: Uri): Promise<void>;
}
//# sourceMappingURL=unified-filesystem.d.ts.map