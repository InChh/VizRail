import { Uri } from '../util/uri';
export declare function projectFile(uri: Uri): string;
export declare function prettyRegistryName(registryName: string): string;
export declare function artifactIdentity(registryName: string, identity: string, shortName: string): string;
export declare function addVersionToArtifactIdentity(identity: string, version: string): string;
export declare function heading(text: string, level?: number): string;
export declare function optional(text: string): string;
export declare function cmdSwitch(text: string): string;
export declare function command(text: string): string;
export declare function hint(text: string): string;
export declare function count(num: number): string;
export declare function position(text: string): string;
//# sourceMappingURL=format.d.ts.map