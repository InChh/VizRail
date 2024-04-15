import { Scalar, YAMLMap, YAMLSeq } from 'yaml';
import { ValidationMessage } from '../interfaces/validation-message';
export declare class YAMLDictionary extends YAMLMap<string, any> {
}
export declare class YAMLSequence extends YAMLSeq<any> {
}
export declare class YAMLScalar extends Scalar<any> {
}
export type Primitive = string | number | boolean;
export type Node = YAMLDictionary | YAMLSequence | YAMLScalar;
export type Range = [number, number, number];
export declare abstract class Yaml<ThisType extends Node = Node> {
    protected parent?: Yaml<Node> | undefined;
    protected key?: string | undefined;
    constructor(/** @internal */ node?: ThisType, parent?: Yaml<Node> | undefined, key?: string | undefined);
    get fullName(): string;
    /** returns the current node as a JSON string */
    toString(): string;
    get keys(): Array<string>;
    /**
     * Coercion function to string
     *
     * This will pass the coercion up to the parent if it exists
     * (or otherwise overridden in the subclass)
     *
     * Which allows for value overriding
     */
    protected asString(value: any): string | undefined;
    /**
     * Coercion function to number
     *
     * This will pass the coercion up to the parent if it exists
     * (or otherwise overridden in the subclass)
     *
     * Which allows for value overriding
     */
    asNumber(value: any): number | undefined;
    /**
     * Coercion function to boolean
     *
     * This will pass the coercion up to the parent if it exists
     * (or otherwise overridden in the subclass)
     *
     * Which allows for value overriding
     */
    asBoolean(value: any): boolean | undefined;
    /**
     * Coercion function to any primitive
     *
     * This will pass the coercion up to the parent if it exists
     * (or otherwise overridden in the subclass)
     *
     * Which allows for value overriding
     */
    asPrimitive(value: any): Primitive | undefined;
    get root(): Yaml;
    protected createNode(): ThisType;
    private _node;
    get node(): ThisType | undefined;
    set node(n: ThisType | undefined);
    sourcePosition(key?: string | number): Range | undefined;
    /** will dispose of this object if it is empty (or forced) */
    dispose(force?: boolean, deleteFromParent?: boolean): void;
    /** if this node has any data, this should return false */
    get empty(): boolean;
    protected deleteChild(child: Yaml<ThisType>): void;
    validate(): Iterable<ValidationMessage>;
    protected validateChildKeys(keys: Array<string>): Iterable<ValidationMessage>;
    protected validateIsObject(): Iterable<ValidationMessage>;
    protected validateIsSequence(): Iterable<ValidationMessage>;
    protected validateIsSequenceOrPrimitive(): Iterable<ValidationMessage>;
    protected validateIsObjectOrPrimitive(): Iterable<ValidationMessage>;
    protected validateChild(child: string, kind: 'string' | 'boolean' | 'number'): Iterable<ValidationMessage>;
}
export /** @internal */ interface EntityFactory<TNode extends Node, TEntity extends Yaml = Yaml<TNode>> extends NodeFactory<TNode> {
}
export /** @internal */ interface NodeFactory<TNode extends Node> extends Function {
}
//# sourceMappingURL=yaml-types.d.ts.map