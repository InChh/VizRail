import { Command } from '../command';
import { Project } from '../switches/project';
import { Version } from '../switches/version';
export declare class AddCommand extends Command {
    readonly command = "add";
    version: Version;
    project: Project;
    run(): Promise<boolean>;
}
//# sourceMappingURL=add.d.ts.map