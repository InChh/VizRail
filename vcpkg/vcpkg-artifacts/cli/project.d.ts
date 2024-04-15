import { ResolvedArtifact } from '../artifacts/artifact';
import { RegistryDisplayContext } from '../registries/registries';
import { Session } from '../session';
import { Uri } from '../util/uri';
export interface ActivationOptions {
    force?: boolean;
    allLanguages?: boolean;
    language?: string;
    msbuildProps?: Uri;
    json?: Uri;
}
export declare function activate(session: Session, allowStacking: boolean, stackEntries: Array<string>, artifacts: Array<ResolvedArtifact>, registries: RegistryDisplayContext, options?: ActivationOptions): Promise<boolean>;
//# sourceMappingURL=project.d.ts.map