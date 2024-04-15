import { YAMLMap } from 'yaml';
import { ValidationMessage } from '../interfaces/validation-message';
import { Uri } from './uri';
export declare function checkOptionalString(parent: YAMLMap, range: [number, number, number], name: string): Iterable<ValidationMessage>;
export declare function checkOptionalBool(parent: YAMLMap, range: [number, number, number], name: string): Iterable<ValidationMessage>;
export declare function checkOptionalArrayOfStrings(parent: YAMLMap, range: [number, number, number], name: string): Iterable<ValidationMessage>;
export declare function isGithubRepo(uri: Uri): boolean;
//# sourceMappingURL=checks.d.ts.map