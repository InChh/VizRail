import { Command } from './command';
export type switches = {
    [key: string]: Array<string>;
};
declare class Ctx {
    constructor(cmdline: CommandLine);
    readonly os: string;
    readonly arch: string;
    get windows(): boolean;
    get linux(): boolean;
    get freebsd(): boolean;
    get osx(): boolean;
    get x64(): boolean;
    get x86(): boolean;
    get arm(): boolean;
    get arm64(): boolean;
}
export declare class CommandLine {
    #private;
    readonly commands: Command[];
    readonly inputs: string[];
    readonly switches: switches;
    readonly context: Ctx & switches;
    get homeFolder(): string;
    get vcpkgCommand(): string;
    get force(): boolean;
    get debug(): boolean;
    get vcpkgArtifactsRoot(): string;
    get vcpkgDownloads(): string;
    get vcpkgRegistriesCache(): string;
    get telemetryFile(): string;
    get nextPreviousEnvironment(): string;
    get globalConfig(): string;
    get language(): string;
    get allLanguages(): boolean;
    isSet(sw: string): boolean;
    claim(sw: string): string[];
    addCommand(command: Command): void;
    /** parses the command line and returns the command that has been requested */
    get command(): Command | undefined;
    constructor(args: Array<string>);
}
export {};
//# sourceMappingURL=command-line.d.ts.map