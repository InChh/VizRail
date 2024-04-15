import { InstallEvents, InstallOptions } from '../interfaces/events';
import { UnTarInstaller } from '../interfaces/metadata/installers/tar';
import { Session } from '../session';
import { Uri } from '../util/uri';
export declare function installUnTar(session: Session, name: string, version: string, targetLocation: Uri, install: UnTarInstaller, events: Partial<InstallEvents>, options: Partial<InstallOptions>): Promise<void>;
//# sourceMappingURL=untar.d.ts.map