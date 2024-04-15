import { Range, SemVer } from 'semver';
import { Validation } from '../validation';
export interface VersionReference extends Validation {
    range: Range;
    resolved?: SemVer;
    readonly raw?: string;
}
//# sourceMappingURL=version-reference.d.ts.map