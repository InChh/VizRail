import { InstallEvents, InstallOptions } from '../interfaces/events';
import { UnZipInstaller } from '../interfaces/metadata/installers/zip';
import { Session } from '../session';
import { Uri } from '../util/uri';
export declare function installUnZip(session: Session, name: string, version: string, targetLocation: Uri, install: UnZipInstaller, events: Partial<InstallEvents>, options: Partial<InstallOptions>): Promise<void>;
//# sourceMappingURL=unzip.d.ts.map