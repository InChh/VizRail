import { Command } from './command';
export declare abstract class Argument {
    protected command: Command;
    readonly abstract argument: string;
    readonly title = "";
    constructor(command: Command);
}
//# sourceMappingURL=argument.d.ts.map