import { CloneOptions } from '../archivers/git';
import { InstallEvents, InstallOptions } from '../interfaces/events';
import { CloneSettings, GitInstaller } from '../interfaces/metadata/installers/git';
import { Session } from '../session';
import { Uri } from '../util/uri';
export declare function installGit(session: Session, name: string, version: string, targetLocation: Uri, install: GitInstaller, events: Partial<InstallEvents>, options: Partial<InstallOptions & CloneOptions & CloneSettings>): Promise<void>;
//# sourceMappingURL=git.d.ts.map