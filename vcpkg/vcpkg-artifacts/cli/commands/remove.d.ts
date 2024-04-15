import { Command } from '../command';
import { Project } from '../switches/project';
export declare class RemoveCommand extends Command {
    readonly command = "remove";
    project: Project;
    run(): Promise<boolean>;
}
//# sourceMappingURL=remove.d.ts.map