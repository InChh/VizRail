import { DownloadEvents } from './interfaces/events';
import { Session } from './session';
import { Uri } from './util/uri';
export declare function vcpkgFetch(session: Session, fetchKey: string): Promise<string>;
export declare function vcpkgExtract(session: Session, archive: string, target: string, strip?: number | string): Promise<string>;
export declare function vcpkgDownload(session: Session, destination: string, sha512: string | undefined, uris: Array<Uri>, events: Partial<DownloadEvents>): Promise<void>;
//# sourceMappingURL=vcpkg.d.ts.map