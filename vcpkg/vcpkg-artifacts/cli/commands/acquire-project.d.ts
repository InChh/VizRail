import { Command } from '../command';
import { Project } from '../switches/project';
export declare class AcquireProjectCommand extends Command {
    readonly command = "acquire-project";
    project: Project;
    run(): Promise<boolean>;
}
//# sourceMappingURL=acquire-project.d.ts.map