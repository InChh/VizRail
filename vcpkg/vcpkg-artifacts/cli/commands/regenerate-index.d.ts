import { Command } from '../command';
import { Normalize } from '../switches/normalize';
export declare class RegenerateCommand extends Command {
    readonly command = "regenerate";
    readonly normalize: Normalize;
    run(): Promise<boolean>;
}
//# sourceMappingURL=regenerate-index.d.ts.map