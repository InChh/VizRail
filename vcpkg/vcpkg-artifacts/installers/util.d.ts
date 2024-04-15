import { AcquireOptions } from '../fs/acquire';
import { Installer } from '../interfaces/metadata/installers/Installer';
import { Verifiable } from '../interfaces/metadata/installers/verifiable';
export declare function artifactFileName(name: string, version: string, install: Installer & Verifiable, extension: string): string;
export declare function applyAcquireOptions(options: AcquireOptions, install: Verifiable): AcquireOptions;
//# sourceMappingURL=util.d.ts.map