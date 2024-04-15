import { Dictionary } from '../interfaces/collections';
import { Contact as IContact } from '../interfaces/metadata/contact';
import { Entity } from '../yaml/Entity';
import { EntityMap } from '../yaml/EntityMap';
import { Strings } from '../yaml/strings';
import { Yaml, YAMLDictionary } from '../yaml/yaml-types';
export declare class Contact extends Entity implements IContact {
    get email(): string | undefined;
    set email(value: string | undefined);
    readonly roles: Strings;
}
export declare class Contacts extends EntityMap<YAMLDictionary, Contact> implements Dictionary<IContact> {
    constructor(node?: YAMLDictionary, parent?: Yaml, key?: string);
}
//# sourceMappingURL=contact.d.ts.map