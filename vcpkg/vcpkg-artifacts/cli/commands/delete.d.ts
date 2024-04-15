import { Command } from '../command';
import { Version } from '../switches/version';
export declare class DeleteCommand extends Command {
    readonly command = "delete";
    version: Version;
    run(): Promise<boolean>;
}
//# sourceMappingURL=delete.d.ts.map