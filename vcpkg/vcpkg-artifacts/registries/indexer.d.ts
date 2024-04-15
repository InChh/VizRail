import { Range, SemVer } from 'semver';
import BTree from 'sorted-btree';
/** Keys have to support toString so that we can serialize them */
interface HasToString {
    toString(): string;
}
/**
 * An Index is the means to search a registry
 *
 * @param TGraph The type of object to create an index for
 * @param TIndexSchema the custom index schema (layout).
 */
export declare class Index<TGraph extends Object, TIndexSchema extends IndexSchema<TGraph, TIndexSchema>> {
    protected indexConstructor: new (index: Index<TGraph, TIndexSchema>) => TIndexSchema;
    /**
     * Creates an index for fast searching.
     *
     * @param indexConstructor the class for the custom index.
     */
    constructor(indexConstructor: new (index: Index<TGraph, TIndexSchema>) => TIndexSchema);
    reset(): void;
    /**
     * Serializes the index to a javascript object graph that can be persisted.
     */
    serialize(): {
        items: string[];
        indexes: any;
    };
    /**
     * Deserializes an object graph to the expected indexes.
     *
     * @param content the object graph to deserialize.
     */
    deserialize(content: any): void;
    /**
     * Returns a clone of the index that can be searched, which narrows the list of
     */
    get where(): TIndexSchema;
    /** inserts an object into the index */
    insert(content: TGraph, target: string): void;
    doneInsertion(): void;
}
/**
 * A Key is a means to creating a searchable, sortable index
 */
declare abstract class Key<TGraph extends Object, TKey extends HasToString, TIndexSchema extends IndexSchema<TGraph, any>> {
    accessor: (value: TGraph, ...args: Array<any>) => TKey | undefined | Array<TKey> | Iterable<TKey>;
    /** child class must implement a standard compare function */
    abstract compare(a: TKey, b: TKey): number;
    /** child class must implement a function to transform value into comparable key */
    abstract coerce(value: TKey | string): TKey;
    protected nestedKeys: Key<TGraph, any, TIndexSchema>[];
    protected values: BTree<TKey, Set<number>>;
    protected words: BTree<string, Set<number>>;
    protected indexSchema: TIndexSchema;
    readonly identity: string;
    readonly alternativeIdentities: Array<string>;
    /** persists the key to an object graph */
    serialize(): any;
    /** deserializes an object graph back into this key */
    deserialize(content: any): void;
    /** adds key value to this Key */
    protected addKey(each: TKey, n: number): void;
    /** adds a 'word' value to this key  */
    protected addWord(each: TKey, n: number): void;
    /** processes an object to generate key/word values for it. */
    insert(graph: TGraph, n: number): void;
    /** insert the key/word values and process any children */
    private insertKey;
    /** construct a Key */
    constructor(indexSchema: IndexSchema<TGraph, TIndexSchema>, accessor: (value: TGraph, ...args: Array<any>) => TKey | undefined | Array<TKey> | Iterable<TKey>, protoIdentity: Array<string> | string);
    /** word search */
    contains(value: TKey | string): TIndexSchema;
    /** exact match search */
    equals(value: TKey | string): TIndexSchema;
    /** metadata value is greater than search */
    greaterThan(value: TKey | string): TIndexSchema;
    /** metadata value is less than search */
    lessThan(value: TKey | string): TIndexSchema;
    /** regex search -- WARNING: slower */
    match(regex: string): TIndexSchema;
    /** substring match -- slower */
    startsWith(value: TKey | string): TIndexSchema;
    /** substring match -- slower */
    endsWith(value: TKey | string): TIndexSchema;
    doneInsertion(): void;
}
/** An  key for string values. */
export declare class StringKey<TGraph extends Object, TIndexSchema extends IndexSchema<TGraph, any>> extends Key<TGraph, string, TIndexSchema> {
    compare(a: string, b: string): number;
    /** impl: transform value into comparable key */
    coerce(value: string): string;
}
export declare class IdentityKey<TGraph extends Object, TIndexSchema extends IndexSchema<TGraph, any>> extends StringKey<TGraph, TIndexSchema> {
    protected identities: BTree<string, Set<number>>;
    protected idShortName: Map<string, string>;
    doneInsertion(): void;
    getShortNameOf(id: string): string | undefined;
    nameOrShortNameIs(value: string): TIndexSchema;
    /** deserializes an object graph back into this key */
    deserialize(content: any): void;
}
/** An key for string values. Does not support 'word' searches */
export declare class SemverKey<TGraph extends Object, TIndex extends IndexSchema<TGraph, any>> extends Key<TGraph, SemVer, TIndex> {
    compare(a: SemVer, b: SemVer): number;
    coerce(value: SemVer | string): SemVer;
    protected addWord(each: SemVer, n: number): void;
    rangeMatch(value: Range | string): TIndex;
    serialize(): any;
}
/**
 * Base class for a custom IndexSchema
 *
 * @param TGraph - the object kind to be indexing
 * @param TSelf - the child class that is being constructed.
 */
export declare abstract class IndexSchema<TGraph extends Object, TSelf extends IndexSchema<TGraph, any>> {
    index: Index<TGraph, TSelf>;
    /** the collection of keys in this IndexSchema */
    readonly mapOfKeyObjects: Map<string, Key<TGraph, any, TSelf>>;
    /**
     * the selected element ids.
     *
     * if this is `undefined`, the whole set is currently selected
     */
    selectedElements?: Set<number>;
    /**
     * filter the selected elements down to an intersection of the {selectedelements} ∩ {idsToKeep}
     *
     * @param idsToKeep the element ids to intersect with.
     */
    filter(idsToKeep: Iterable<number>): void;
    /**
     * Serializes this IndexSchema to a persistable object graph.
     */
    serialize(): any;
    /**
     * Deserializes a persistable object graph into the IndexSchema.
     *
     * replaces any existing data in the IndexSchema.
     * @param content the persistable object graph.
     */
    deserialize(content: any): void;
    /**
     * returns the selected
     */
    get items(): Array<string>;
}
export {};
//# sourceMappingURL=indexer.d.ts.map