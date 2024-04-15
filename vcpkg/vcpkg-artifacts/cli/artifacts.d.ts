import { ResolvedArtifact, Selections } from '../artifacts/artifact';
import { RegistryDisplayContext, RegistryResolver } from '../registries/registries';
import { Session } from '../session';
export declare function showArtifacts(artifacts: Iterable<ResolvedArtifact>, registries: RegistryDisplayContext, options?: {
    force?: boolean;
}): Promise<boolean>;
export interface SelectedArtifact extends ResolvedArtifact {
    requestedVersion: string | undefined;
}
export declare function selectArtifacts(session: Session, selections: Selections, registries: RegistryResolver, dependencyDepth: number): Promise<false | Array<SelectedArtifact>>;
export declare function acquireArtifacts(session: Session, resolved: Array<ResolvedArtifact>, registries: RegistryDisplayContext, options?: {
    force?: boolean;
    allLanguages?: boolean;
    language?: string;
}): Promise<boolean>;
//# sourceMappingURL=artifacts.d.ts.map