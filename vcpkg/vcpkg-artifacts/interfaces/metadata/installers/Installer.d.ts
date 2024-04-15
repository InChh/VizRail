import { Validation } from '../../validation';
/**
   * defines what should be physically laid out on disk for this artifact
   *
   * Note: once the host/environment queries have been completed, there should
   *       only be one single package/file/repo/etc that gets downloaded and
   *       installed for this artifact.  If there needs to be more than one,
   *       then there would need to be a 'requires' that refers to the additional
   *       package.
   *
   * More types to follow.
   */
export interface Installer extends Validation {
    readonly installerKind: string;
    readonly lang?: string;
    readonly nametag?: string;
}
//# sourceMappingURL=Installer.d.ts.map