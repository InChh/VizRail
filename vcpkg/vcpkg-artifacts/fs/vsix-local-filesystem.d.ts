import { Session } from '../session';
import { Uri } from '../util/uri';
import { LocalFileSystem } from './local-filesystem';
export declare class VsixLocalFilesystem extends LocalFileSystem {
    private readonly vsixBaseUri;
    constructor(session: Session);
    /**
     * Creates a new URI from a string, e.g. `https://www.msft.com/some/path`,
     * `file:///usr/home`, or `scheme:with/path`.
     *
     * @param value A string which represents an URI (see `URI#toString`).
     */
    parseUri(value: string, _strict?: boolean): Uri;
}
//# sourceMappingURL=vsix-local-filesystem.d.ts.map