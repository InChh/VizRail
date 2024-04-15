import { Session } from '../session';
import { Uri } from '../util/uri';
import { ArtifactRegistry } from './ArtifactRegistry';
export declare class LocalRegistry extends ArtifactRegistry {
    protected indexYaml: Uri;
    readonly installationFolder: Uri;
    readonly cacheFolder: Uri;
    constructor(session: Session, location: Uri);
    update(displayName?: string): Promise<void>;
    load(force?: boolean): Promise<void>;
    private get localName();
}
//# sourceMappingURL=LocalRegistry.d.ts.map