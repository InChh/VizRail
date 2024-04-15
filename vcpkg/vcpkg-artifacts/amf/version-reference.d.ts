import { Range, SemVer } from 'semver';
import { VersionReference as IVersionReference } from '../interfaces/metadata/version-reference';
import { Yaml, YAMLScalar } from '../yaml/yaml-types';
export declare class VersionReference extends Yaml<YAMLScalar> implements IVersionReference {
    get raw(): string | undefined;
    set raw(value: string | undefined);
    static create(): YAMLScalar;
    private split;
    get range(): Range;
    set range(ver: Range);
    get resolved(): SemVer | undefined;
    set resolved(ver: SemVer | undefined);
}
//# sourceMappingURL=version-reference.d.ts.map