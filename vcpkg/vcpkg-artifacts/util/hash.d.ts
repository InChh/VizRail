/// <reference types="node" />
import { Readable } from 'stream';
import { HashVerifyEvents } from '../interfaces/events';
import { Uri } from './uri';
export type Algorithm = 'sha256' | 'sha384' | 'sha512';
export declare function hash(stream: Readable, uri: Uri, size: number, algorithm: "sha256" | "sha512" | "sha384" | undefined, events: Partial<HashVerifyEvents>): Promise<any>;
export interface Hash {
    value?: string;
    algorithm?: 'sha256' | 'sha384' | 'sha512';
}
//# sourceMappingURL=hash.d.ts.map