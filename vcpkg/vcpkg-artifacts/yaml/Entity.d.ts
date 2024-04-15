import { ValidationMessage } from '../interfaces/validation-message';
import { Primitive, Yaml, YAMLDictionary } from './yaml-types';
/** An object that is backed by a YamlMAP node */
export declare class Entity extends Yaml<YAMLDictionary> {
    protected setMember(name: string, value: Primitive | undefined): void;
    protected getMember(name: string): Primitive | undefined;
    validate(): Iterable<ValidationMessage>;
    has(key: string, kind?: 'sequence' | 'entity' | 'scalar'): boolean;
    kind(key: string): 'sequence' | 'entity' | 'scalar' | 'string' | 'number' | 'boolean' | 'undefined' | undefined;
    childIs(key: string, kind: 'sequence' | 'entity' | 'scalar' | 'string' | 'number' | 'boolean'): boolean | undefined;
}
//# sourceMappingURL=Entity.d.ts.map