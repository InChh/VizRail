import { Dictionary, Strings as IStrings } from '../interfaces/collections';
import { EntityMap } from './EntityMap';
import { ScalarSequence } from './ScalarSequence';
import { Yaml, YAMLDictionary, YAMLScalar, YAMLSequence } from './yaml-types';
export declare class Strings extends ScalarSequence<string> implements IStrings {
    constructor(node?: YAMLSequence | YAMLScalar, parent?: Yaml, key?: string);
}
export declare class StringsMap extends EntityMap<YAMLSequence | YAMLScalar, ScalarSequence<string>> implements Dictionary<IStrings> {
    constructor(node?: YAMLDictionary, parent?: Yaml, key?: string);
}
//# sourceMappingURL=strings.d.ts.map