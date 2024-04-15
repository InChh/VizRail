/// <reference types="node" />
import { Readable, Writable } from 'stream';
import { Uri } from '../util/uri';
import { FileStat, FileSystem, FileType, ReadHandle } from './filesystem';
/**
 * HTTPS Filesystem
 *
 */
export declare class HttpsFileSystem extends FileSystem {
    stat(uri: Uri): Promise<FileStat>;
    readDirectory(uri: Uri): Promise<Array<[Uri, FileType]>>;
    createDirectory(uri: Uri): Promise<void>;
    readFile(uri: Uri): Promise<Uint8Array>;
    writeFile(uri: Uri, content: Uint8Array): Promise<void>;
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
    readStream(uri: Uri, options?: {
        start?: number;
        end?: number;
    }): Promise<Readable>;
    writeStream(uri: Uri): Promise<Writable>;
    openFile(uri: Uri): Promise<ReadHandle>;
}
//# sourceMappingURL=http-filesystem.d.ts.map