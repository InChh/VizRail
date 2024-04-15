import { ValidationMessage } from '../interfaces/validation-message';
import { Yaml, YAMLSequence } from './yaml-types';
export declare class Options extends Yaml<YAMLSequence> {
    static create(): YAMLSequence;
    has(option: string): boolean;
    set(option: string, value: boolean): void;
    validate(): Iterable<ValidationMessage>;
}
//# sourceMappingURL=Options.d.ts.map