import { Installer as IInstaller } from '../interfaces/metadata/installers/Installer';
import { ValidationMessage } from '../interfaces/validation-message';
import { Entity } from '../yaml/Entity';
import { EntitySequence } from '../yaml/EntitySequence';
import { Node, Yaml, YAMLDictionary } from '../yaml/yaml-types';
export declare class Installs extends EntitySequence<Installer> {
    constructor(node?: YAMLDictionary, parent?: Yaml, key?: string);
    [Symbol.iterator](): Iterator<Installer>;
    protected createInstance(node: Node): Installer;
    validate(): Iterable<ValidationMessage>;
}
export declare class Installer extends Entity implements IInstaller {
    get installerKind(): string;
    get fullName(): string;
    get lang(): string | undefined;
    get nametag(): string | undefined;
    validate(): Iterable<ValidationMessage>;
}
//# sourceMappingURL=installer.d.ts.map