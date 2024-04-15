import { Scalar } from 'yaml';
import { ValidationMessage } from '../interfaces/validation-message';
import { BaseMap } from './BaseMap';
import { EntityFactory, Yaml, YAMLDictionary } from './yaml-types';
export declare class CustomScalarMap<TElement extends Yaml<Scalar>> extends BaseMap {
    protected factory: EntityFactory<Scalar, TElement>;
    protected constructor(factory: EntityFactory<Scalar, TElement>, node?: YAMLDictionary, parent?: Yaml, key?: string);
    add(key: string): TElement;
    [Symbol.iterator](): Iterator<[string, TElement]>;
    get(key: string): TElement | undefined;
    set(key: string, value: TElement): void;
    validate(): Iterable<ValidationMessage>;
}
//# sourceMappingURL=CustomScalarMap.d.ts.map