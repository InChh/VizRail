import { Artifact } from '../artifacts/artifact';
import { Session } from '../session';
import { Uri } from '../util/uri';
export interface SearchCriteria {
    idOrShortName?: string;
    version?: string;
    keyword?: string;
}
export interface ArtifactSearchable {
    search(criteria?: SearchCriteria): Promise<Array<[string, Array<Artifact>]>>;
}
export interface Registry extends ArtifactSearchable {
    readonly count: number;
    readonly location: Uri;
    load(force?: boolean): Promise<void>;
    save(): Promise<void>;
    update(displayName?: string): Promise<void>;
    regenerate(normalize?: boolean): Promise<void>;
}
/**
  * returns an artifact for the strongly-named artifact id/version.
  */
export declare function getArtifact(registry: ArtifactSearchable, idOrShortName: string, version: string | undefined): Promise<[string, Artifact] | undefined>;
export declare class RegistryDatabase {
    #private;
    getRegistryByUri(registryUri: string): Registry | undefined;
    has(registryUri: string): boolean;
    add(uri: Uri, registry: Registry): void;
    loadRegistry(session: Session, locationUri: Uri): Promise<Registry>;
    getAllUris(): string[];
}
export interface RegistryDisplayContext {
    getRegistryDisplayName(registry: Uri): string;
}
export declare class RegistryResolver implements RegistryDisplayContext {
    #private;
    private addMapping;
    constructor(parent: RegistryDatabase | RegistryResolver);
    getRegistryName(registry: Uri): string | undefined;
    getRegistryDisplayName(registry: Uri): string;
    getRegistryByUri(registryUri: Uri): Registry | undefined;
    getRegistryByName(name: string): Registry | undefined;
    add(registryUri: Uri, name: string): void;
    search(criteria?: SearchCriteria): Promise<Array<[string, Array<Artifact>]>>;
    with(otherResolver: RegistryResolver): RegistryResolver;
}
//# sourceMappingURL=registries.d.ts.map