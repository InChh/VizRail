import { Command } from '../command';
import { All } from '../switches/all';
import { Project } from '../switches/project';
export declare class UpdateCommand extends Command {
    readonly command = "update";
    project: Project;
    all: All;
    run(): Promise<boolean>;
}
//# sourceMappingURL=update.d.ts.map