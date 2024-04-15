import { Command } from './command';
export declare abstract class Switch {
    #private;
    protected command: Command;
    readonly abstract switch: string;
    readonly title = "";
    readonly required: boolean;
    constructor(command: Command, options?: {
        required?: boolean;
    });
    get valid(): boolean;
    get values(): string[];
    get value(): string | undefined;
    get requiredValue(): string;
    get active(): boolean;
    get isRangeOfVersions(): boolean;
}
//# sourceMappingURL=switch.d.ts.map