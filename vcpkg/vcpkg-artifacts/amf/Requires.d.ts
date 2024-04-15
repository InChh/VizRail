import { VersionReference as IVersionReference } from '../interfaces/metadata/version-reference';
import { CustomScalarMap } from '../yaml/CustomScalarMap';
import { Yaml, YAMLDictionary } from '../yaml/yaml-types';
import { VersionReference } from './version-reference';
export declare class Requires extends CustomScalarMap<VersionReference> {
    constructor(node?: YAMLDictionary, parent?: Yaml, key?: string);
    set(key: string, value: VersionReference | IVersionReference | string): void;
}
//# sourceMappingURL=Requires.d.ts.map