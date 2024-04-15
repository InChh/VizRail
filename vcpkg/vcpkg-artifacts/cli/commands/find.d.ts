import { Command } from '../command';
import { Project } from '../switches/project';
import { Version } from '../switches/version';
export declare class FindCommand extends Command {
    readonly command = "find";
    version: Version;
    project: Project;
    run(): Promise<boolean>;
}
//# sourceMappingURL=find.d.ts.map