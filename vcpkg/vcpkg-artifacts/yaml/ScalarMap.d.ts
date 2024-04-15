import { BaseMap } from './BaseMap';
import { Primitive } from './yaml-types';
export declare class ScalarMap<TElement extends Primitive = Primitive> extends BaseMap {
    get(key: string): TElement | undefined;
    set(key: string, value: TElement): void;
    add(key: string): TElement;
    [Symbol.iterator](): Iterator<[string, TElement]>;
}
//# sourceMappingURL=ScalarMap.d.ts.map