export type IndexOf<T> = T extends Map<T, infer V> ? T : T extends Array<infer V> ? number : string;
/** performs a truthy check on the value, and calls onTrue when the condition is true,and onFalse when it's not */
export declare function when<T>(value: T, onTrue: (value: NonNullable<T>) => void, onFalse?: () => void): void;
export interface IterableWithLinq<T> extends Iterable<T> {
    linq: IterableWithLinq<T>;
    any(predicate?: (each: T) => boolean): boolean;
    all(predicate: (each: T) => boolean): boolean;
    bifurcate(predicate: (each: T) => boolean): Array<Array<T>>;
    concat(more: Iterable<T>): IterableWithLinq<T>;
    distinct(selector?: (each: T) => any): IterableWithLinq<T>;
    duplicates(selector?: (each: T) => any): IterableWithLinq<T>;
    first(predicate?: (each: T) => boolean): T | undefined;
    selectNonNullable<V>(selector: (each: T) => V): IterableWithLinq<NonNullable<V>>;
    select<V>(selector: (each: T) => V): IterableWithLinq<V>;
    selectAsync<V>(selector: (each: T) => V): AsyncGenerator<V>;
    selectMany<V>(selector: (each: T) => Iterable<V>): IterableWithLinq<V>;
    where(predicate: (each: T) => boolean): IterableWithLinq<T>;
    forEach(action: (each: T) => void): void;
    aggregate<A, R>(accumulator: (current: T | A, next: T) => A, seed?: T | A, resultAction?: (result?: T | A) => A | R): T | A | R | undefined;
    toArray(): Array<T>;
    toObject<V, U>(selector: (each: T) => [V, U]): Record<string, U>;
    results(): Promise<void>;
    toRecord<TValue>(keySelector: (each: T) => string, selector: (each: T) => TValue): Record<string, TValue>;
    toMap<TKey, TValue>(keySelector: (each: T) => TKey, selector: (each: T) => TValue): Map<TKey, TValue>;
    groupBy<TKey, TValue>(keySelector: (each: T) => TKey, selector: (each: T) => TValue): Map<TKey, Array<TValue>>;
    /**
       * Gets or sets the length of the iterable. This is a number one higher than the highest element defined in an array.
       */
    count(): number;
    /**
      * Adds all the elements of an array separated by the specified separator string.
      * @param separator A string used to separate one element of an array from the next in the resulting String. If omitted, the array elements are separated with a comma.
      */
    join(separator?: string): string;
}
export declare function keys<K, T>(source: Map<K, T> | null | undefined): Iterable<K>;
export declare function keys<T, TSrc extends Record<string, T>>(source: Record<string, T> | null | undefined): Iterable<string>;
export declare function keys<T, TSrc extends Array<T>>(source: Array<T> | null | undefined): Iterable<number>;
export declare function keys<K, T, TSrc>(source: any | undefined | null): Iterable<any>;
/** returns an IterableWithLinq<> for keys in the collection */
declare function _keys<K, T>(source: Map<K, T> | null | undefined): IterableWithLinq<K>;
declare function _keys<T, TSrc extends Record<string, T>>(source: Record<string, T> | null | undefined): IterableWithLinq<string>;
declare function _keys<T, TSrc extends Array<T>>(source: Array<T> | null | undefined): IterableWithLinq<number>;
declare function _keys<K, T, TSrc>(source: any | undefined | null): IterableWithLinq<any>;
export declare function values<K, T, TSrc extends (Array<T> | Record<string, T> | Map<K, T>)>(source: (Iterable<T> | Array<T> | Record<string, T> | Map<K, T> | Set<T>) | null | undefined): Iterable<T>;
export declare const linq: {
    values: typeof _values;
    entries: typeof _entries;
    keys: typeof _keys;
    find: typeof _find;
    startsWith: typeof _startsWith;
    join: typeof _join;
};
/** returns an IterableWithLinq<> for values in the collection
 *
 * @note - null/undefined/empty values are considered 'empty'
*/
declare function _values<K, T>(source: (Array<T> | Record<string, T> | Map<K, T> | Set<T> | Iterable<T>) | null | undefined): IterableWithLinq<T>;
export declare function entries<K, T, TSrc extends (Array<T> | Record<string, T> | Map<K, T> | undefined | null)>(source: TSrc & (Array<T> | Record<string, T> | Map<K, T>) | null | undefined): Iterable<[IndexOf<TSrc>, T]>;
/** returns an IterableWithLinq<{key,value}> for the source */
declare function _entries<K, T, TSrc extends (Array<T> | Record<string, T> | Map<K, T> | undefined | null)>(source: TSrc & (Array<T> | Record<string, T> | Map<K, T>) | null | undefined): IterableWithLinq<[IndexOf<TSrc>, T]>;
/** returns the first value where the key equals the match value (case-insensitive) */
declare function _find<K, T, TSrc extends (Array<T> | Record<string, T> | Map<K, T> | undefined | null)>(source: TSrc & (Array<T> | Record<string, T> | Map<K, T>) | null | undefined, match: string): T | undefined;
/** returns the first value where the key starts with the match value (case-insensitive) */
declare function _startsWith<K, T, TSrc extends (Array<T> | Record<string, T> | Map<K, T> | undefined | null)>(source: TSrc & (Array<T> | Record<string, T> | Map<K, T>) | null | undefined, match: string): T | undefined;
declare function _join<K, T>(source: (Array<T> | Record<string, T> | Map<K, T> | Set<T> | Iterable<T>) | null | undefined, delimiter: string): string;
export declare function length<T, K>(source?: string | Iterable<T> | Record<string, T> | Array<T> | Map<K, T> | Set<T>): number;
/** A Map of Key: Array<Value>  */
export declare class ManyMap<K, V> extends Map<K, Array<V>> {
    /**
     * Push the value into the array at key
     * @param key the unique key in the map
     * @param value the value to push to the collection at 'key'
     */
    push(key: K, value: V): void;
}
export declare function countWhere<T>(from: Iterable<T>, predicate: (each: T) => Promise<boolean>): Promise<number>;
export declare function countWhere<T>(from: Iterable<T>, predicate: (each: T) => boolean): number;
export {};
//# sourceMappingURL=linq.d.ts.map