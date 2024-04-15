import { Entity } from '../yaml/Entity';
import { EntityMap } from '../yaml/EntityMap';
import { Primitive, Yaml, YAMLDictionary } from '../yaml/yaml-types';
import { Exports } from './exports';
import { Installs } from './installer';
import { Requires } from './Requires';
/**
 * A map of mediaquery to DemandBlock
 */
export declare class Demands extends EntityMap<YAMLDictionary, DemandBlock> {
    constructor(node?: YAMLDictionary, parent?: Yaml, key?: string);
    get keys(): string[];
}
export declare class DemandBlock extends Entity {
    discoveredData: Record<string, string>;
    get error(): string | undefined;
    set error(value: string | undefined);
    get warning(): string | undefined;
    set warning(value: string | undefined);
    get message(): string | undefined;
    set message(value: string | undefined);
    readonly requires: Requires;
    readonly exports: Exports;
    readonly install: Installs;
    constructor(node?: YAMLDictionary, parent?: Yaml, key?: string);
    private evaluate;
    asString(value: any): string | undefined;
    asPrimitive(value: any): Primitive | undefined;
}
//# sourceMappingURL=demands.d.ts.map