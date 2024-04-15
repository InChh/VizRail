/// <reference types="node" />
import { Readable, Writable } from 'stream';
import { Uri } from '../util/uri';
import { FileStat, FileSystem, FileType, ReadHandle, WriteStreamOptions } from './filesystem';
/**
 * Implementation of the Local File System
 *
 * This is used to handle the access to the local disks.
 */
export declare class LocalFileSystem extends FileSystem {
    stat(uri: Uri): Promise<FileStat>;
    readDirectory(uri: Uri, options?: {
        recursive?: boolean;
    }): Promise<Array<[Uri, FileType]>>;
    createDirectory(uri: Uri): Promise<void>;
    createSymlink(original: Uri, slink: Uri): Promise<void>;
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
    readStream(uri: Uri, options?: {
        start?: number;
        end?: number;
    }): Promise<Readable>;
    writeStream(uri: Uri, options?: WriteStreamOptions): Promise<Writable>;
    openFile(uri: Uri): Promise<ReadHandle>;
}
//# sourceMappingURL=local-filesystem.d.ts.map