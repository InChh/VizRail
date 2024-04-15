import { Command } from '../command';
import { Project } from '../switches/project';
import { Version } from '../switches/version';
export declare class AcquireCommand extends Command {
    readonly command = "acquire";
    version: Version;
    project: Project;
    run(): Promise<boolean>;
}
//# sourceMappingURL=acquire.d.ts.map