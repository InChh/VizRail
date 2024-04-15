import { Document, LineCounter } from 'yaml';
import { ValidationMessage } from '../interfaces/validation-message';
import { Session } from '../session';
import { Uri } from '../util/uri';
import { BaseMap } from '../yaml/BaseMap';
import { Contacts } from './contact';
import { Demands } from './demands';
import { RegistriesDeclaration } from './registries';
export declare class MetadataFile extends BaseMap {
    #private;
    protected document: Document.Parsed;
    readonly filename: string;
    readonly file: Uri;
    lineCounter: LineCounter;
    readonly registryUri: Uri | undefined;
    private constructor();
    static parseMetadata(filename: string, uri: Uri, session: Session, registryUri?: Uri): Promise<MetadataFile>;
    static parseConfiguration(filename: string, content: string, session: Session, registryUri?: Uri): Promise<MetadataFile>;
    contacts: Contacts;
    registries: RegistriesDeclaration;
    private demandBlock;
    /** Artifact identity
   *
   * this should be the 'path' to the artifact (following the guidelines)
   *
   * ie, 'compilers/microsoft/msvc'
   *
   * artifacts install to artifacts-root/<source>/<id>/<VER>
   */
    get id(): string;
    set id(value: string);
    /** the version of this artifact */
    get version(): string;
    set version(value: string);
    /** a short 1 line descriptive text */
    get summary(): string | undefined;
    set summary(value: string | undefined);
    /** if a longer description is required, the value should go here */
    get description(): string | undefined;
    set description(value: string | undefined);
    /** if true, intended to be used only as a dependency; for example, do not show in search results or lists */
    get dependencyOnly(): boolean;
    get espidf(): boolean;
    /** higher priority artifacts should install earlier; the default is zero */
    get priority(): number;
    set priority(value: number);
    get error(): string | undefined;
    set error(value: string | undefined);
    get warning(): string | undefined;
    set warning(value: string | undefined);
    get message(): string | undefined;
    set message(value: string | undefined);
    get requires(): import("./Requires").Requires;
    get exports(): import("./exports").Exports;
    get install(): import("./installer").Installs;
    readonly conditionalDemands: Demands;
    get isFormatValid(): boolean;
    toJsonString(): string;
    save(uri?: Uri): Promise<void>;
    get formatErrors(): Array<string>;
    formatVMessage(vMessage: ValidationMessage): string;
    deprecationWarnings(): Iterable<ValidationMessage>;
    private positionAt;
    normalize(): void;
}
//# sourceMappingURL=metadata-file.d.ts.map