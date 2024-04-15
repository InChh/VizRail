import { MetadataFile } from '../amf/metadata-file';
import { IdentityKey, IndexSchema, SemverKey, StringKey } from './indexer';
export declare class ArtifactIndex extends IndexSchema<MetadataFile, ArtifactIndex> {
    id: IdentityKey<MetadataFile, ArtifactIndex>;
    version: SemverKey<MetadataFile, ArtifactIndex>;
    summary: StringKey<MetadataFile, ArtifactIndex>;
}
//# sourceMappingURL=artifact-index.d.ts.map