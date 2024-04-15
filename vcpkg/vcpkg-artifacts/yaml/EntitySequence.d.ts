import { EntityFactory, Yaml, YAMLDictionary, YAMLSequence } from './yaml-types';
/**
 * EntitySequence is expressed as either a single entity or a sequence of entities.
 */
export declare class EntitySequence<TElement extends Yaml<YAMLDictionary>> extends Yaml<YAMLSequence | YAMLDictionary> {
    protected factory: EntityFactory<YAMLDictionary, TElement>;
    protected constructor(factory: EntityFactory<YAMLDictionary, TElement>, node?: YAMLDictionary, parent?: Yaml, key?: string);
    static create(): YAMLDictionary;
    get length(): number;
    add(value: TElement): void;
    get(index: number): TElement | undefined;
    [Symbol.iterator](): Iterator<TElement>;
    clear(): void;
    protected static generator<T extends Yaml<YAMLDictionary>>(sequence: EntitySequence<T>): Generator<T, void, unknown>;
}
//# sourceMappingURL=EntitySequence.d.ts.map