import { InstallEvents, InstallOptions } from '../interfaces/events';
import { NupkgInstaller } from '../interfaces/metadata/installers/nupkg';
import { Session } from '../session';
import { Uri } from '../util/uri';
export declare function installNuGet(session: Session, name: string, version: string, targetLocation: Uri, install: NupkgInstaller, events: Partial<InstallEvents>, options: Partial<InstallOptions>): Promise<void>;
//# sourceMappingURL=nuget.d.ts.map