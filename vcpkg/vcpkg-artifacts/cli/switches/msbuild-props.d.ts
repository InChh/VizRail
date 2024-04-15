import { Uri } from '../../util/uri';
import { Command } from '../command';
import { Switch } from '../switch';
export declare class MSBuildProps extends Switch {
    readonly switch: string;
    constructor(command: Command, swName?: string);
    get resolvedValue(): Uri | undefined;
}
//# sourceMappingURL=msbuild-props.d.ts.map