import { Dictionary } from '../interfaces/collections';
import { ValidationMessage } from '../interfaces/validation-message';
import { BaseMap } from './BaseMap';
import { EntityFactory, Node, Yaml, YAMLDictionary } from './yaml-types';
export declare abstract class EntityMap<TNode extends Node, TElement extends Yaml<TNode>> extends BaseMap implements Dictionary<TElement>, Iterable<[string, TElement]> {
    protected factory: EntityFactory<TNode, TElement>;
    protected constructor(factory: EntityFactory<TNode, TElement>, node?: YAMLDictionary, parent?: Yaml, key?: string);
    get values(): Iterable<TElement>;
    [Symbol.iterator](): Iterator<[string, TElement]>;
    validate(): Iterable<ValidationMessage>;
    add(key: string): TElement;
    get(key: string): TElement | undefined;
    set(key: string, value: TElement): void;
}
//# sourceMappingURL=EntityMap.d.ts.map