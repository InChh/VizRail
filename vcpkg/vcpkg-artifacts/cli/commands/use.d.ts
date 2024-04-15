import { Command } from '../command';
import { MSBuildProps } from '../switches/msbuild-props';
import { Project } from '../switches/project';
import { Version } from '../switches/version';
export declare class UseCommand extends Command {
    readonly command = "use";
    version: Version;
    project: Project;
    msbuildProps: MSBuildProps;
    run(): Promise<boolean>;
}
//# sourceMappingURL=use.d.ts.map