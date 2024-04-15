import { Exports as IExports } from '../interfaces/metadata/exports';
import { BaseMap } from '../yaml/BaseMap';
import { ScalarMap } from '../yaml/ScalarMap';
import { StringsMap } from '../yaml/strings';
export declare class Exports extends BaseMap implements IExports {
    aliases: ScalarMap<string>;
    defines: ScalarMap<string>;
    environment: StringsMap;
    locations: ScalarMap<string>;
    msbuild_properties: ScalarMap<string>;
    paths: StringsMap;
    properties: StringsMap;
    tools: ScalarMap<string>;
}
//# sourceMappingURL=exports.d.ts.map