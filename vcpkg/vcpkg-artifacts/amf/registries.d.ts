import { Dictionary } from '../interfaces/collections';
import { Uri } from '../util/uri';
import { Entity } from '../yaml/Entity';
import { Strings } from '../yaml/strings';
import { Node, Yaml, YAMLDictionary, YAMLSequence } from '../yaml/yaml-types';
export declare class RegistryDeclaration extends Entity {
    readonly location: Strings;
    get registryKind(): string | undefined;
    set registryKind(value: string | undefined);
}
export declare class RegistriesDeclaration extends Yaml<YAMLDictionary | YAMLSequence> implements Dictionary<RegistryDeclaration>, Iterable<[string, RegistryDeclaration]> {
    [Symbol.iterator](): Iterator<[string, RegistryDeclaration]>;
    clear(): void;
    createNode(): YAMLSequence;
    add(name: string, location?: Uri, kind?: string): RegistryDeclaration;
    delete(key: string): boolean;
    get(key: string): RegistryDeclaration | undefined;
    has(key: string): boolean;
    get length(): number;
    get keys(): Array<string>;
    protected createRegistry(node: Node): RegistryDeclaration | undefined;
}
//# sourceMappingURL=registries.d.ts.map