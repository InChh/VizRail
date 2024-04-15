import { Uri } from './uri';
export declare class Failed extends Error {
    fatal: boolean;
}
export declare class RemoteFileUnavailable extends Error {
    uri: Array<Uri>;
    constructor(uri: Array<Uri>);
}
export declare class TargetFileCollision extends Error {
    uri: Uri;
    constructor(uri: Uri, message: string);
}
export declare class MultipleInstallsMatched extends Error {
    queries: Array<string>;
    constructor(queries: Array<string>);
}
//# sourceMappingURL=exceptions.d.ts.map