import { Command } from '../command';
import { Switch } from '../switch';
export declare class All extends Switch {
    switch: string;
}
export declare class Downloads extends Switch {
    switch: string;
}
export declare class Artifacts extends Switch {
    switch: string;
}
export declare class CleanCommand extends Command {
    readonly command = "clean";
    all: All;
    artifacts: Artifacts;
    downloads: Downloads;
    run(): Promise<boolean>;
}
//# sourceMappingURL=clean.d.ts.map