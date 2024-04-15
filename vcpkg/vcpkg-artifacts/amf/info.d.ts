import { Validation } from '../interfaces/validation';
import { Entity } from '../yaml/Entity';
import { Options } from '../yaml/Options';
export declare class Info extends Entity implements Validation {
    get id(): string;
    get version(): string;
    get summary(): string | undefined;
    get description(): string | undefined;
    readonly options: Options;
    get priority(): number;
}
//# sourceMappingURL=info.d.ts.map