import { Command } from '../command';
import { MSBuildProps } from '../switches/msbuild-props';
import { Project } from '../switches/project';
export declare class GenerateMSBuildPropsCommand extends Command {
    readonly command = "generate-msbuild-props";
    project: Project;
    msbuildProps: MSBuildProps;
    run(): Promise<boolean>;
}
//# sourceMappingURL=generate-msbuild-props.d.ts.map