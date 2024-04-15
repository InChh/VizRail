import { Command } from '../command';
import { Clear } from '../switches/clear';
export declare class CacheCommand extends Command {
    readonly command = "cache";
    clear: Clear;
    run(): Promise<boolean>;
}
//# sourceMappingURL=cache.d.ts.map