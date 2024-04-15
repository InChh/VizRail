import { DownloadEvents } from '../interfaces/events';
import { Session } from '../session';
import { Hash } from '../util/hash';
import { Uri } from '../util/uri';
export interface AcquireOptions extends Hash {
    /** force a redownload even if it's in cache */
    force?: boolean;
}
export declare function acquireArtifactFile(session: Session, uris: Array<Uri>, outputFilename: string, events: Partial<DownloadEvents>, options?: AcquireOptions): Promise<Uri>;
export declare function resolveNugetUrl(session: Session, pkg: string): Promise<Uri>;
export declare function acquireNugetFile(session: Session, pkg: string, outputFilename: string, events: Partial<DownloadEvents>, options?: AcquireOptions): Promise<Uri>;
//# sourceMappingURL=acquire.d.ts.map