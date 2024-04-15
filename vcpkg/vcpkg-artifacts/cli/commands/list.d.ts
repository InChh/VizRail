import { Command } from '../command';
import { Installed } from '../switches/installed';
export declare class ListCommand extends Command {
    readonly command = "list";
    installed: Installed;
    run(): Promise<boolean>;
}
//# sourceMappingURL=list.d.ts.map