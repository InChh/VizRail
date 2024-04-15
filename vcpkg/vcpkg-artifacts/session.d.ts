import { MetadataFile } from './amf/metadata-file';
import { Artifact } from './artifacts/artifact';
import { FileSystem } from './fs/filesystem';
import { InstallEvents, InstallOptions } from './interfaces/events';
import { Installer } from './interfaces/metadata/installers/Installer';
import { RegistryDatabase, RegistryResolver } from './registries/registries';
import { Channels } from './util/channels';
import { Uri } from './util/uri';
/** The definition for an installer tool function */
type InstallerTool<T extends Installer = any> = (session: Session, name: string, version: string, targetLocation: Uri, install: T, events: Partial<InstallEvents>, options: Partial<InstallOptions>) => Promise<void>;
export type Context = {
    [key: string]: Array<string> | undefined;
} & {
    readonly os: string;
    readonly arch: string;
    readonly windows: boolean;
    readonly osx: boolean;
    readonly linux: boolean;
    readonly freebsd: boolean;
    readonly x64: boolean;
    readonly x86: boolean;
    readonly arm: boolean;
    readonly arm64: boolean;
};
export type SessionSettings = {
    readonly vcpkgCommand?: string;
    readonly homeFolder: string;
    readonly vcpkgArtifactsRoot?: string;
    readonly vcpkgDownloads?: string;
    readonly vcpkgRegistriesCache?: string;
    readonly telemetryFile?: string;
    readonly nextPreviousEnvironment?: string;
    readonly globalConfig?: string;
};
/**
 * The Session class is used to hold a reference to the
 * message channels,
 * the filesystems,
 * and any other 'global' data that should be kept.
 *
 */
export declare class Session {
    #private;
    readonly context: Context;
    readonly settings: SessionSettings;
    readonly fileSystem: FileSystem;
    readonly channels: Channels;
    readonly homeFolder: Uri;
    readonly nextPreviousEnvironment: Uri;
    readonly installFolder: Uri;
    readonly registryFolder: Uri;
    readonly telemetryFile: Uri | undefined;
    get vcpkgCommand(): string | undefined;
    readonly globalConfig: Uri;
    readonly downloads: Uri;
    currentDirectory: Uri;
    configuration?: MetadataFile;
    /** register installer functions here */
    private installers;
    readonly registryDatabase: RegistryDatabase;
    readonly globalRegistryResolver: RegistryResolver;
    processVcpkgArg(argSetting: string | undefined, defaultName: string): Uri;
    constructor(currentDirectory: string, context: Context, settings: SessionSettings);
    parseLocation(location: string): Uri;
    saveConfig(): Promise<void>;
    init(): Promise<this>;
    findProjectProfile(startLocation?: Uri): Promise<Uri | undefined>;
    getInstalledArtifacts(): Promise<{
        folder: Uri;
        id: string;
        artifact: Artifact;
    }[]>;
    /** returns an installer function (or undefined) for a given installerkind */
    artifactInstaller(installInfo: Installer): InstallerTool<any> | undefined;
    openManifest(filename: string, uri: Uri): Promise<MetadataFile>;
    trackAcquire(registryUri: string, id: string, version: string): void;
    trackActivate(registryUri: string, id: string, version: string): void;
    writeTelemetry(): Promise<any>;
}
export {};
//# sourceMappingURL=session.d.ts.map