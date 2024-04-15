import { ProjectManifest } from '../../artifacts/artifact';
import { Uri } from '../../util/uri';
import { Switch } from '../switch';
interface ResolvedProjectUri {
    filename: string;
    uri: Uri;
}
export declare class Project extends Switch {
    switch: string;
    resolveProjectUri(): Promise<ResolvedProjectUri | undefined>;
    get resolvedValue(): Promise<Uri | undefined>;
    get manifest(): Promise<ProjectManifest | undefined>;
}
export {};
//# sourceMappingURL=project.d.ts.map