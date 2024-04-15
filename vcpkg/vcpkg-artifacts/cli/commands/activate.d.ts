import { Command } from '../command';
import { Json } from '../switches/json';
import { MSBuildProps } from '../switches/msbuild-props';
import { Project } from '../switches/project';
export declare class ActivateCommand extends Command {
    readonly command = "activate";
    project: Project;
    msbuildProps: MSBuildProps;
    json: Json;
    run(): Promise<boolean>;
}
//# sourceMappingURL=activate.d.ts.map