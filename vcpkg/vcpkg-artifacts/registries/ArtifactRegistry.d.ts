import { MetadataFile } from '../amf/metadata-file';
import { Artifact } from '../artifacts/artifact';
import { Session } from '../session';
import { Uri } from '../util/uri';
import { ArtifactIndex } from './artifact-index';
import { Index } from './indexer';
import { Registry, SearchCriteria } from './registries';
export declare abstract class ArtifactRegistry implements Registry {
    #private;
    protected session: Session;
    readonly location: Uri;
    constructor(session: Session, location: Uri);
    abstract load(): Promise<void>;
    abstract readonly installationFolder: Uri;
    protected abstract readonly cacheFolder: Uri;
    protected index: Index<MetadataFile, ArtifactIndex>;
    protected abstract indexYaml: Uri;
    get count(): number;
    get loaded(): boolean;
    protected set loaded(loaded: boolean);
    abstract update(displayName?: string): Promise<void>;
    regenerate(normalize?: boolean): Promise<void>;
    search(criteria?: SearchCriteria): Promise<Array<[string, Array<Artifact>]>>;
    private openArtifact;
    private openArtifacts;
    save(): Promise<void>;
}
//# sourceMappingURL=ArtifactRegistry.d.ts.map