import { Session } from '../session';
import { Uri } from '../util/uri';
import { ArtifactRegistry } from './ArtifactRegistry';
export declare class RemoteRegistry extends ArtifactRegistry {
    #private;
    protected indexYaml: Uri;
    readonly installationFolder: Uri;
    readonly cacheFolder: Uri;
    constructor(session: Session, location: Uri);
    private get localName();
    private get safeName();
    load(force?: boolean): Promise<void>;
    update(displayName?: string): Promise<void>;
}
//# sourceMappingURL=RemoteRegistry.d.ts.map