import { Entity } from './Entity';
import { ScalarSequence } from './ScalarSequence';
import { EntityFactory, Node, Primitive, Yaml, YAMLSequence } from './yaml-types';
export declare abstract class BaseMap extends Entity {
    get length(): number;
    getEntity<TNode extends Node, TEntity extends Yaml<TNode> = Yaml<TNode>>(key: string, factory: EntityFactory<TNode, TEntity>): TEntity | undefined;
    getSequence(key: string, factory: EntityFactory<YAMLSequence, Entity> | (new (node: Node, parent?: Yaml, key?: string) => ScalarSequence<Primitive>)): Entity | ScalarSequence<Primitive> | undefined;
    getValue(key: string): Primitive | undefined;
    delete(key: string): boolean;
    clear(): void;
}
//# sourceMappingURL=BaseMap.d.ts.map