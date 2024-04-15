"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Git = void 0;
const exec_cmd_1 = require("../util/exec-cmd");
const uri_1 = require("../util/uri");
/** @internal */
class Git {
    #toolPath;
    #targetFolder;
    constructor(toolPath, targetFolder) {
        this.#toolPath = toolPath;
        this.#targetFolder = targetFolder;
    }
    /**
     * Method that clones a git repo into a desired location and with various options.
     * @param repo The Uri of the remote repository that is desired to be cloned.
     * @param events The events that may need to be updated in order to track progress.
     * @param options The options that will modify how the clone will be called.
     * @returns Boolean representing whether the execution was completed without error, this is not necessarily
     *  a guarantee that the clone did what we expected.
     */
    async clone(repo, events, options = {}) {
        const remote = await (0, uri_1.isFilePath)(repo) ? repo.fsPath : repo.toString();
        const result = await (0, exec_cmd_1.execute)(this.#toolPath, [
            'clone',
            remote,
            this.#targetFolder.fsPath,
            options.recursive ? '--recursive' : '',
            options.depth ? `--depth=${options.depth}` : '',
            '--progress'
        ], {
            onStdErrData: chunkToHeartbeat(events),
            onStdOutData: chunkToHeartbeat(events)
        });
        return result.code === 0 ? true : false;
    }
    /**
     * Fetches a 'tag', this could theoretically be a commit, a tag, or a branch.
     * @param remoteName Remote name to fetch from. Typically will be 'origin'.
     * @param events Events that may be called in order to present progress.
     * @param options Options to modify how fetch is called.
     * @returns Boolean representing whether the execution was completed without error, this is not necessarily
     *  a guarantee that the fetch did what we expected.
     */
    async fetch(remoteName, events, options = {}) {
        const result = await (0, exec_cmd_1.execute)(this.#toolPath, [
            '-C',
            this.#targetFolder.fsPath,
            'fetch',
            remoteName,
            options.commit ? options.commit : '',
            options.depth ? `--depth=${options.depth}` : ''
        ], {
            cwd: this.#targetFolder.fsPath
        });
        return result.code === 0 ? true : false;
    }
    /**
     * Checks out a specific commit. If no commit is given, the default behavior of a checkout will be
     * used. (Checking out the current branch)
     * @param events Events to possibly track progress.
     * @param options Passing along a commit or branch to checkout, optionally.
     * @returns Boolean representing whether the execution was completed without error, this is not necessarily
     *  a guarantee that the checkout did what we expected.
     */
    async checkout(events, options = {}) {
        const result = await (0, exec_cmd_1.execute)(this.#toolPath, [
            '-C',
            this.#targetFolder.fsPath,
            'checkout',
            options.commit ? options.commit : ''
        ], {
            cwd: this.#targetFolder.fsPath,
            onStdErrData: chunkToHeartbeat(events),
            onStdOutData: chunkToHeartbeat(events)
        });
        return result.code === 0 ? true : false;
    }
    /**
     * Performs a reset on the git repo.
     * @param events Events to possibly track progress.
     * @param options Options to control how the reset is called.
     * @returns Boolean representing whether the execution was completed without error, this is not necessarily
     *  a guarantee that the reset did what we expected.
     */
    async reset(events, options = {}) {
        const result = await (0, exec_cmd_1.execute)(this.#toolPath, [
            '-C',
            this.#targetFolder.fsPath,
            'reset',
            options.commit ? options.commit : '',
            options.recurse ? '--recurse-submodules' : '',
            options.hard ? '--hard' : ''
        ], {
            cwd: this.#targetFolder.fsPath,
            onStdErrData: chunkToHeartbeat(events),
            onStdOutData: chunkToHeartbeat(events)
        });
        return result.code === 0 ? true : false;
    }
    /**
     * Initializes a folder on disk to be a git repository
     * @returns true if the initialization was successful, false otherwise.
     */
    async init() {
        if (!await this.#targetFolder.exists()) {
            await this.#targetFolder.createDirectory();
        }
        if (!await this.#targetFolder.isDirectory()) {
            throw new Error(`${this.#targetFolder.fsPath} is not a directory.`);
        }
        const result = await (0, exec_cmd_1.execute)(this.#toolPath, ['init'], {
            cwd: this.#targetFolder.fsPath
        });
        return result.code === 0 ? true : false;
    }
    /**
     * Adds a remote location to the git repo.
     * @param name the name of the remote to add.
     * @param location the location of the remote to add.
     * @returns true if the addition was successful, false otherwise.
     */
    async addRemote(name, location) {
        const result = await (0, exec_cmd_1.execute)(this.#toolPath, [
            '-C',
            this.#targetFolder.fsPath,
            'remote',
            'add',
            name,
            location.toString()
        ], {
            cwd: this.#targetFolder.fsPath
        });
        return result.code === 0;
    }
    /**
     * updates submodules in a git repository
     * @param events Events to possibly track progress.
     * @param options Options to control how the submodule update is called.
     * @returns true if the update was successful, false otherwise.
     */
    async updateSubmodules(events, options = {}) {
        const result = await (0, exec_cmd_1.execute)(this.#toolPath, [
            '-C',
            this.#targetFolder.fsPath,
            'submodule',
            'update',
            '--progress',
            options.init ? '--init' : '',
            options.depth ? `--depth=${options.depth}` : '',
            options.recursive ? '--recursive' : '',
        ], {
            cwd: this.#targetFolder.fsPath,
            onStdErrData: chunkToHeartbeat(events),
            onStdOutData: chunkToHeartbeat(events)
        });
        return result.code === 0;
    }
    /**
     * sets a git configuration value in the repo.
     * @param configFile the relative path to the config file inside the repo on disk
     * @param key the key to set in the config file
     * @param value the value to set in the config file
     * @returns true if the config file was updated, false otherwise
     */
    async config(configFile, key, value) {
        const result = await (0, exec_cmd_1.execute)(this.#toolPath, [
            'config',
            '-f',
            this.#targetFolder.join(configFile).fsPath,
            key,
            value
        ], {
            cwd: this.#targetFolder.fsPath
        });
        return result.code === 0;
    }
}
exports.Git = Git;
function chunkToHeartbeat(events) {
    return (chunk) => {
        const regex = /\s([0-9]*?)%/;
        chunk.toString().split(/^/gim).map((x) => x.trim()).filter((each) => each).forEach((line) => {
            const match_array = line.match(regex);
            if (match_array !== null) {
                events.unpackArchiveHeartbeat?.(line.trim());
            }
        });
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0LmpzIiwic291cmNlUm9vdCI6Imh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9taWNyb3NvZnQvdmNwa2ctdG9vbC9tYWluL3ZjcGtnLWFydGlmYWN0cy8iLCJzb3VyY2VzIjpbImFyY2hpdmVycy9naXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHVDQUF1QztBQUN2QyxrQ0FBa0M7OztBQUdsQywrQ0FBMkM7QUFDM0MscUNBQThDO0FBTTlDLGdCQUFnQjtBQUNoQixNQUFhLEdBQUc7SUFDZCxTQUFTLENBQVM7SUFDbEIsYUFBYSxDQUFNO0lBRW5CLFlBQVksUUFBZ0IsRUFBRSxZQUFpQjtRQUM3QyxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztRQUMxQixJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQztJQUNwQyxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBUyxFQUFFLE1BQTZCLEVBQUUsVUFBbUQsRUFBRTtRQUN6RyxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUEsZ0JBQVUsRUFBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRXRFLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBQSxrQkFBTyxFQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDM0MsT0FBTztZQUNQLE1BQU07WUFDTixJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU07WUFDekIsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3RDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFdBQVcsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQy9DLFlBQVk7U0FDYixFQUFFO1lBQ0QsWUFBWSxFQUFFLGdCQUFnQixDQUFDLE1BQU0sQ0FBQztZQUN0QyxZQUFZLEVBQUUsZ0JBQWdCLENBQUMsTUFBTSxDQUFDO1NBQ3ZDLENBQUMsQ0FBQztRQUVILE9BQU8sTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQzFDLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFrQixFQUFFLE1BQTZCLEVBQUUsVUFBK0MsRUFBRTtRQUM5RyxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUEsa0JBQU8sRUFBQyxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQzNDLElBQUk7WUFDSixJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU07WUFDekIsT0FBTztZQUNQLFVBQVU7WUFDVixPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3BDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFdBQVcsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFO1NBQ2hELEVBQUU7WUFDRCxHQUFHLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNO1NBQy9CLENBQUMsQ0FBQztRQUVILE9BQU8sTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQzFDLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUE2QixFQUFFLFVBQStCLEVBQUU7UUFDN0UsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFBLGtCQUFPLEVBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUMzQyxJQUFJO1lBQ0osSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNO1lBQ3pCLFVBQVU7WUFDVixPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFO1NBQ3JDLEVBQUU7WUFDRCxHQUFHLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNO1lBQzlCLFlBQVksRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUM7WUFDdEMsWUFBWSxFQUFFLGdCQUFnQixDQUFDLE1BQU0sQ0FBQztTQUN2QyxDQUFDLENBQUM7UUFDSCxPQUFPLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUMxQyxDQUFDO0lBR0Q7Ozs7OztPQU1HO0lBQ0gsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUE2QixFQUFFLFVBQWtFLEVBQUU7UUFDN0csTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFBLGtCQUFPLEVBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUMzQyxJQUFJO1lBQ0osSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNO1lBQ3pCLE9BQU87WUFDUCxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3BDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQzdDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRTtTQUM3QixFQUFFO1lBQ0QsR0FBRyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTTtZQUM5QixZQUFZLEVBQUUsZ0JBQWdCLENBQUMsTUFBTSxDQUFDO1lBQ3RDLFlBQVksRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUM7U0FDdkMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFDMUMsQ0FBQztJQUdEOzs7T0FHRztJQUNILEtBQUssQ0FBQyxJQUFJO1FBQ1IsSUFBSSxDQUFFLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUN2QyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxFQUFFLENBQUM7U0FDNUM7UUFFRCxJQUFJLENBQUUsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxFQUFFO1lBQzVDLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sc0JBQXNCLENBQUMsQ0FBQztTQUNyRTtRQUVELE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBQSxrQkFBTyxFQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUNyRCxHQUFHLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNO1NBQy9CLENBQUMsQ0FBQztRQUVILE9BQU8sTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQzFDLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBWSxFQUFFLFFBQWE7UUFDekMsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFBLGtCQUFPLEVBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUMzQyxJQUFJO1lBQ0osSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNO1lBQ3pCLFFBQVE7WUFDUixLQUFLO1lBQ0wsSUFBSTtZQUNKLFFBQVEsQ0FBQyxRQUFRLEVBQUU7U0FDcEIsRUFBRTtZQUNELEdBQUcsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU07U0FDL0IsQ0FBQyxDQUFDO1FBRUgsT0FBTyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsTUFBNkIsRUFBRSxVQUFtRSxFQUFFO1FBQ3pILE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBQSxrQkFBTyxFQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDM0MsSUFBSTtZQUNKLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTTtZQUN6QixXQUFXO1lBQ1gsUUFBUTtZQUNSLFlBQVk7WUFDWixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDNUIsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsV0FBVyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDL0MsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFFO1NBQ3ZDLEVBQUU7WUFDRCxHQUFHLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNO1lBQzlCLFlBQVksRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUM7WUFDdEMsWUFBWSxFQUFFLGdCQUFnQixDQUFDLE1BQU0sQ0FBQztTQUN2QyxDQUFDLENBQUM7UUFFSCxPQUFPLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQWtCLEVBQUUsR0FBVyxFQUFFLEtBQWE7UUFDekQsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFBLGtCQUFPLEVBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUMzQyxRQUFRO1lBQ1IsSUFBSTtZQUNKLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU07WUFDMUMsR0FBRztZQUNILEtBQUs7U0FDTixFQUFFO1lBQ0QsR0FBRyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTTtTQUMvQixDQUFDLENBQUM7UUFDSCxPQUFPLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDO0lBQzNCLENBQUM7Q0FDRjtBQTlMRCxrQkE4TEM7QUFDRCxTQUFTLGdCQUFnQixDQUFDLE1BQTZCO0lBQ3JELE9BQU8sQ0FBQyxLQUFVLEVBQUUsRUFBRTtRQUNwQixNQUFNLEtBQUssR0FBRyxjQUFjLENBQUM7UUFDN0IsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBWSxFQUFFLEVBQUU7WUFDL0csTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN0QyxJQUFJLFdBQVcsS0FBSyxJQUFJLEVBQUU7Z0JBQ3hCLE1BQU0sQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2FBQzlDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUM7QUFDSixDQUFDIn0=
// SIG // Begin signature block
// SIG // MIIoNwYJKoZIhvcNAQcCoIIoKDCCKCQCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // Kv9xrD1WYPeNDTPUTh8LSmwh8IULZ/3uPahwLB2XgCag
// SIG // gg2FMIIGAzCCA+ugAwIBAgITMwAAA64tNVHIU49VHQAA
// SIG // AAADrjANBgkqhkiG9w0BAQsFADB+MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBT
// SIG // aWduaW5nIFBDQSAyMDExMB4XDTIzMTExNjE5MDg1OVoX
// SIG // DTI0MTExNDE5MDg1OVowdDELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEeMBwGA1UEAxMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA
// SIG // 9CD8pjY3wxCoPmMhOkow7ycCltfqYnqk4wGNApzh2dTY
// SIG // +YqxozWTzJUOB38VxsgFQmXBFhOMdrGYGpvO9kdbNPkw
// SIG // HpTrW6hZqFuLLiRwGKEx4ZM5zVSqbHJuX2fPfUJ0Xmb+
// SIG // VrVsGw/BwBV2zz0rVtiSgqj3GeeGOsG7llfWyrSjyJqm
// SIG // 5DHE3o04BAI/NuhkHOv04euiqJGvHFCL8+fXvyD9OAxq
// SIG // 4fcJKtoyBb0PBA3oMNQeCsiUyLO+voZqVTOUsAWY0bN5
// SIG // YjkK4nq5DVaNdVrrowd5AX9gmz6D/TJTssns6pDCG00Y
// SIG // +Dh3ipWpnVmkhYcByyUSEKX3PLC8DkiAQQIDAQABo4IB
// SIG // gjCCAX4wHwYDVR0lBBgwFgYKKwYBBAGCN0wIAQYIKwYB
// SIG // BQUHAwMwHQYDVR0OBBYEFIcf73Spl4cHOFoll27H9COd
// SIG // 4fE/MFQGA1UdEQRNMEukSTBHMS0wKwYDVQQLEyRNaWNy
// SIG // b3NvZnQgSXJlbGFuZCBPcGVyYXRpb25zIExpbWl0ZWQx
// SIG // FjAUBgNVBAUTDTIzMDAxMis1MDE4MzYwHwYDVR0jBBgw
// SIG // FoAUSG5k5VAF04KqFzc3IrVtqMp1ApUwVAYDVR0fBE0w
// SIG // SzBJoEegRYZDaHR0cDovL3d3dy5taWNyb3NvZnQuY29t
// SIG // L3BraW9wcy9jcmwvTWljQ29kU2lnUENBMjAxMV8yMDEx
// SIG // LTA3LTA4LmNybDBhBggrBgEFBQcBAQRVMFMwUQYIKwYB
// SIG // BQUHMAKGRWh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9w
// SIG // a2lvcHMvY2VydHMvTWljQ29kU2lnUENBMjAxMV8yMDEx
// SIG // LTA3LTA4LmNydDAMBgNVHRMBAf8EAjAAMA0GCSqGSIb3
// SIG // DQEBCwUAA4ICAQBqyWA1Eu7PKNMjaaxl0V7gJ0XBysUo
// SIG // xZluMHJXFE2LEGZIZ2zMLYVjOnAGG/4dluRjSrZZo/8v
// SIG // wk4Xt8v6NBB9ofo8H1P/XidHytWTv9lg9MYu++6lPmu5
// SIG // fCozD3cI2NLZPW2BBhGX2D0R8tQBj0FbmZRuIucpiQ7D
// SIG // K3CHKlfKcc7MP8pPzuMv55Tox8+KFQD1NG6+bfbYA/BN
// SIG // PBkg4tyOh+exbaHfcNuodDJUIjq9dF6oa+Yjy0u0pUMI
// SIG // /B1t+8m6rJo0KSoZlrpesYl0jRhpt+hmqx8uENXoGJcY
// SIG // ZVJ5N2Skq90LViKNRhi9N4U+e8c4y9uXyomUF/6viCPJ
// SIG // 7huTNEJo75ehIJba+IWd3txUEc0R3y6DT6txC6cW1nR/
// SIG // LTbo9I/8fQq538G5IvJ+e5iSiOSVVkVk0i5m03Awy5E2
// SIG // ZSS4PVdQSCcFxmN4tpEfYuR7AAy/GJVtIDFlUpSgdXok
// SIG // pSui5hYtK1R9enXXvo+U/xGkLRc+qp4De3dZbzu7pOq7
// SIG // V/jCyhuCw0bEIAU4urCGIip7TI6GBRzD7yPzjFIqeZY7
// SIG // S4rVW5BRn2oEqpm8Su6yTIQvMIk8x2pwYNUa2339Z4gW
// SIG // 5xW21eFA5mLpo7NRSKRQms5OgAA18aCgqOU7Ds0h6q/Y
// SIG // B4BmEAtoTMl/TBiyKaMGAlEcdy+5FIhmzojMGjCCB3ow
// SIG // ggVioAMCAQICCmEOkNIAAAAAAAMwDQYJKoZIhvcNAQEL
// SIG // BQAwgYgxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNo
// SIG // aW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQK
// SIG // ExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xMjAwBgNVBAMT
// SIG // KU1pY3Jvc29mdCBSb290IENlcnRpZmljYXRlIEF1dGhv
// SIG // cml0eSAyMDExMB4XDTExMDcwODIwNTkwOVoXDTI2MDcw
// SIG // ODIxMDkwOVowfjELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEoMCYG
// SIG // A1UEAxMfTWljcm9zb2Z0IENvZGUgU2lnbmluZyBQQ0Eg
// SIG // MjAxMTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoC
// SIG // ggIBAKvw+nIQHC6t2G6qghBNNLrytlghn0IbKmvpWlCq
// SIG // uAY4GgRJun/DDB7dN2vGEtgL8DjCmQawyDnVARQxQtOJ
// SIG // DXlkh36UYCRsr55JnOloXtLfm1OyCizDr9mpK656Ca/X
// SIG // llnKYBoF6WZ26DJSJhIv56sIUM+zRLdd2MQuA3WraPPL
// SIG // bfM6XKEW9Ea64DhkrG5kNXimoGMPLdNAk/jj3gcN1Vx5
// SIG // pUkp5w2+oBN3vpQ97/vjK1oQH01WKKJ6cuASOrdJXtjt
// SIG // 7UORg9l7snuGG9k+sYxd6IlPhBryoS9Z5JA7La4zWMW3
// SIG // Pv4y07MDPbGyr5I4ftKdgCz1TlaRITUlwzluZH9TupwP
// SIG // rRkjhMv0ugOGjfdf8NBSv4yUh7zAIXQlXxgotswnKDgl
// SIG // mDlKNs98sZKuHCOnqWbsYR9q4ShJnV+I4iVd0yFLPlLE
// SIG // tVc/JAPw0XpbL9Uj43BdD1FGd7P4AOG8rAKCX9vAFbO9
// SIG // G9RVS+c5oQ/pI0m8GLhEfEXkwcNyeuBy5yTfv0aZxe/C
// SIG // HFfbg43sTUkwp6uO3+xbn6/83bBm4sGXgXvt1u1L50kp
// SIG // pxMopqd9Z4DmimJ4X7IvhNdXnFy/dygo8e1twyiPLI9A
// SIG // N0/B4YVEicQJTMXUpUMvdJX3bvh4IFgsE11glZo+TzOE
// SIG // 2rCIF96eTvSWsLxGoGyY0uDWiIwLAgMBAAGjggHtMIIB
// SIG // 6TAQBgkrBgEEAYI3FQEEAwIBADAdBgNVHQ4EFgQUSG5k
// SIG // 5VAF04KqFzc3IrVtqMp1ApUwGQYJKwYBBAGCNxQCBAwe
// SIG // CgBTAHUAYgBDAEEwCwYDVR0PBAQDAgGGMA8GA1UdEwEB
// SIG // /wQFMAMBAf8wHwYDVR0jBBgwFoAUci06AjGQQ7kUBU7h
// SIG // 6qfHMdEjiTQwWgYDVR0fBFMwUTBPoE2gS4ZJaHR0cDov
// SIG // L2NybC5taWNyb3NvZnQuY29tL3BraS9jcmwvcHJvZHVj
// SIG // dHMvTWljUm9vQ2VyQXV0MjAxMV8yMDExXzAzXzIyLmNy
// SIG // bDBeBggrBgEFBQcBAQRSMFAwTgYIKwYBBQUHMAKGQmh0
// SIG // dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2kvY2VydHMv
// SIG // TWljUm9vQ2VyQXV0MjAxMV8yMDExXzAzXzIyLmNydDCB
// SIG // nwYDVR0gBIGXMIGUMIGRBgkrBgEEAYI3LgMwgYMwPwYI
// SIG // KwYBBQUHAgEWM2h0dHA6Ly93d3cubWljcm9zb2Z0LmNv
// SIG // bS9wa2lvcHMvZG9jcy9wcmltYXJ5Y3BzLmh0bTBABggr
// SIG // BgEFBQcCAjA0HjIgHQBMAGUAZwBhAGwAXwBwAG8AbABp
// SIG // AGMAeQBfAHMAdABhAHQAZQBtAGUAbgB0AC4gHTANBgkq
// SIG // hkiG9w0BAQsFAAOCAgEAZ/KGpZjgVHkaLtPYdGcimwuW
// SIG // EeFjkplCln3SeQyQwWVfLiw++MNy0W2D/r4/6ArKO79H
// SIG // qaPzadtjvyI1pZddZYSQfYtGUFXYDJJ80hpLHPM8QotS
// SIG // 0LD9a+M+By4pm+Y9G6XUtR13lDni6WTJRD14eiPzE32m
// SIG // kHSDjfTLJgJGKsKKELukqQUMm+1o+mgulaAqPyprWElj
// SIG // HwlpblqYluSD9MCP80Yr3vw70L01724lruWvJ+3Q3fMO
// SIG // r5kol5hNDj0L8giJ1h/DMhji8MUtzluetEk5CsYKwsat
// SIG // ruWy2dsViFFFWDgycScaf7H0J/jeLDogaZiyWYlobm+n
// SIG // t3TDQAUGpgEqKD6CPxNNZgvAs0314Y9/HG8VfUWnduVA
// SIG // KmWjw11SYobDHWM2l4bf2vP48hahmifhzaWX0O5dY0Hj
// SIG // Wwechz4GdwbRBrF1HxS+YWG18NzGGwS+30HHDiju3mUv
// SIG // 7Jf2oVyW2ADWoUa9WfOXpQlLSBCZgB/QACnFsZulP0V3
// SIG // HjXG0qKin3p6IvpIlR+r+0cjgPWe+L9rt0uX4ut1eBrs
// SIG // 6jeZeRhL/9azI2h15q/6/IvrC4DqaTuv/DDtBEyO3991
// SIG // bWORPdGdVk5Pv4BXIqF4ETIheu9BCrE/+6jMpF3BoYib
// SIG // V3FWTkhFwELJm3ZbCoBIa/15n8G9bW1qyVJzEw16UM0x
// SIG // ghoKMIIaBgIBATCBlTB+MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBTaWduaW5n
// SIG // IFBDQSAyMDExAhMzAAADri01UchTj1UdAAAAAAOuMA0G
// SIG // CWCGSAFlAwQCAQUAoIGuMBkGCSqGSIb3DQEJAzEMBgor
// SIG // BgEEAYI3AgEEMBwGCisGAQQBgjcCAQsxDjAMBgorBgEE
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCCTKGeFUYhT/pQ0
// SIG // VZ6d+3uGAZYsvfZHXhUoIkCNL+RGHjBCBgorBgEEAYI3
// SIG // AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMAbwBmAHShGoAY
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tMA0GCSqGSIb3
// SIG // DQEBAQUABIIBAJaHycWXPjVul4398PAOTXspxg8zSWYS
// SIG // +RI0q+mr5yI2BO4vi5p4yAYBtoDJvs4Gea5K97Z2w9Sr
// SIG // rQTjnWFPRs5PWORtOJLDFAlySw6u2Cl4VS39ASPinhLi
// SIG // P2Aw+lksv/QNagoqlyPYrTETdS7m6bvsTNtnEo/Eseea
// SIG // fq0I2ULDEZIlqnW4mND2+Wx/BbWPsBecHuDcMSvfH3MW
// SIG // Ik9xVTJc6u1WdouzUAPEajveCqtHQ1rNNmfjG8FKp8V0
// SIG // ryvny4GAyAOP9nnwwUtoHw7oEbXcDY/BH5S65CHwfldC
// SIG // Vigz9HbJXkuTNxHJrSmWw8Cp+qqjvjR33+u9QuGKGt1Q
// SIG // mxyhgheUMIIXkAYKKwYBBAGCNwMDATGCF4Awghd8Bgkq
// SIG // hkiG9w0BBwKgghdtMIIXaQIBAzEPMA0GCWCGSAFlAwQC
// SIG // AQUAMIIBUgYLKoZIhvcNAQkQAQSgggFBBIIBPTCCATkC
// SIG // AQEGCisGAQQBhFkKAwEwMTANBglghkgBZQMEAgEFAAQg
// SIG // ZJKBZYuspDKOnkh7EKYn6Thjri+vnRSZAtKuarmKtoIC
// SIG // BmVWwxezXhgTMjAyMzEyMTIxOTAzNDIuMDA0WjAEgAIB
// SIG // 9KCB0aSBzjCByzELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjElMCMG
// SIG // A1UECxMcTWljcm9zb2Z0IEFtZXJpY2EgT3BlcmF0aW9u
// SIG // czEnMCUGA1UECxMeblNoaWVsZCBUU1MgRVNOOkE0MDAt
// SIG // MDVFMC1EOTQ3MSUwIwYDVQQDExxNaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBTZXJ2aWNloIIR6jCCByAwggUIoAMCAQIC
// SIG // EzMAAAHWJ2n/ci1WyK4AAQAAAdYwDQYJKoZIhvcNAQEL
// SIG // BQAwfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMd
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAwHhcN
// SIG // MjMwNTI1MTkxMjM0WhcNMjQwMjAxMTkxMjM0WjCByzEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjElMCMGA1UECxMcTWljcm9z
// SIG // b2Z0IEFtZXJpY2EgT3BlcmF0aW9uczEnMCUGA1UECxMe
// SIG // blNoaWVsZCBUU1MgRVNOOkE0MDAtMDVFMC1EOTQ3MSUw
// SIG // IwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2
// SIG // aWNlMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKC
// SIG // AgEAzyzNjpvK+bt33GwxDl8nSbW5FuVN+ChWn7QvvEMj
// SIG // aqZTCM0kwtU6BNM3MHkArzyH6WLcjwd47enz0aa74cAp
// SIG // LFMPadDn5mc1jw75LeNAVErbvNd0Ja5aEXaZS89saZNv
// SIG // YyDmePqwWymmZAT2eEeC10IZJB53tGP2IfOWajDEWjFp
// SIG // ATOp1MFeWg4sF6nRPScpdItWlmGwqs8AUXTewk5QCcay
// SIG // eO6L97n/5RYPYZ1UHKkGIEa0RaQzRTDj9IMM+TY+mtuB
// SIG // mZ3BRBkZisCJi/uSlj51YL2nSUkaemaq2FdxZmwZmbbB
// SIG // dIUpVYy0DvJ8XpRle076iCEiLL9m0DIFAVRM/MBxclN/
// SIG // Ot4B4/AQmxKSc5u+XyybC9z+upSVDUTewkbHzRGx3V/3
// SIG // eo6KVThcBe6Jpk0I6VN+wP+2EdMCQ07embF1Po/8GJaP
// SIG // W9trdalLYao0bN9qBn9k0UwqEFi4SXt3ACGEZZWv4BCp
// SIG // W7gw7Bt/dusuBDBxcU47I63GRGw1sIwd8K6ddQ8oNUCn
// SIG // A8i1LNmpwaJb0MCUzdJjDrlzvLQc9tJ4P/l8PuMPlvTz
// SIG // JL1tX2mIuN+VYykWbB38SD4yM2dMH+BYm5lTyR2fmk8R
// SIG // rFST8cnQob7xgn+H3vF32GPT+ZW5/UnCnOGnU3eOBgqw
// SIG // ZSfyTrKAODrzR2Olvl3ClXCCBlsCAwEAAaOCAUkwggFF
// SIG // MB0GA1UdDgQWBBRhmlQ2O00AYjAioNvo/80U3GLGTjAf
// SIG // BgNVHSMEGDAWgBSfpxVdAF5iXYP05dJlpxtTNRnpcjBf
// SIG // BgNVHR8EWDBWMFSgUqBQhk5odHRwOi8vd3d3Lm1pY3Jv
// SIG // c29mdC5jb20vcGtpb3BzL2NybC9NaWNyb3NvZnQlMjBU
// SIG // aW1lLVN0YW1wJTIwUENBJTIwMjAxMCgxKS5jcmwwbAYI
// SIG // KwYBBQUHAQEEYDBeMFwGCCsGAQUFBzAChlBodHRwOi8v
// SIG // d3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NlcnRzL01p
// SIG // Y3Jvc29mdCUyMFRpbWUtU3RhbXAlMjBQQ0ElMjAyMDEw
// SIG // KDEpLmNydDAMBgNVHRMBAf8EAjAAMBYGA1UdJQEB/wQM
// SIG // MAoGCCsGAQUFBwMIMA4GA1UdDwEB/wQEAwIHgDANBgkq
// SIG // hkiG9w0BAQsFAAOCAgEA1L/kYzYncCcUmzJNSL0vC38T
// SIG // TPFWlYacUdUpFvhUWOgCpJ9rNzp9vZxhFZWrW5SL9alU
// SIG // ypK1MS2DGdM/kQOppn17ntmO/2AW8zOZFHlIFNstTJm4
// SIG // p+sWnU/Q8xAnhOxOPt5Ng5mcblfhixWELKpA23vKMu/t
// SIG // wUolNvasmQGE/b0QwCz1AuWcMqD5DXym6o5d1YBU6iLm
// SIG // xEK+ejNGHTFpagqqtMlZZ/Zj24Rx81xzo2kLLq6IRwn+
// SIG // 1U/HLe/aaN+BXfF3LKpsoXSgctY3cpJ64pPhd7xJf/dK
// SIG // mqJ+TfCk2aBrThZWiRT52dg6kLW9llpH7gKBlqxkgONz
// SIG // Mpe/j2G1LK4vzazLwHfWfifRZarDMF0BcQAe7oyYuIT/
// SIG // AR/I+qpJsuLrpVOUkkGul5BJXGikGEqSXEo5I8kwyDqX
// SIG // +i2QU2hcennqKg2dJVEYYkajvtcqPLlzvPXupIAXgvLd
// SIG // VjeSE6l546HGIA78haabbFA4J0VIiNTP0JfztvfVZLTJ
// SIG // CC+9oukHeAQbK492foixJyj/XqVMKLD9Ztzdr/coV0NR
// SIG // 4rrCZetyH1yMnwSWlr0A4FNyZOHiGUq/9iiI+KbV7ePe
// SIG // gkYh04tNdZHMA6XY0CwEIgr6I9absoX8FX9huWcAabSF
// SIG // 4rzUW2t+CpA+aKphKBdckRUPOIg7H/4Isp/1yE+2GP8w
// SIG // ggdxMIIFWaADAgECAhMzAAAAFcXna54Cm0mZAAAAAAAV
// SIG // MA0GCSqGSIb3DQEBCwUAMIGIMQswCQYDVQQGEwJVUzET
// SIG // MBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVk
// SIG // bW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0
// SIG // aW9uMTIwMAYDVQQDEylNaWNyb3NvZnQgUm9vdCBDZXJ0
// SIG // aWZpY2F0ZSBBdXRob3JpdHkgMjAxMDAeFw0yMTA5MzAx
// SIG // ODIyMjVaFw0zMDA5MzAxODMyMjVaMHwxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFBDQSAyMDEwMIICIjANBgkqhkiG9w0BAQEF
// SIG // AAOCAg8AMIICCgKCAgEA5OGmTOe0ciELeaLL1yR5vQ7V
// SIG // gtP97pwHB9KpbE51yMo1V/YBf2xK4OK9uT4XYDP/XE/H
// SIG // ZveVU3Fa4n5KWv64NmeFRiMMtY0Tz3cywBAY6GB9alKD
// SIG // RLemjkZrBxTzxXb1hlDcwUTIcVxRMTegCjhuje3XD9gm
// SIG // U3w5YQJ6xKr9cmmvHaus9ja+NSZk2pg7uhp7M62AW36M
// SIG // EBydUv626GIl3GoPz130/o5Tz9bshVZN7928jaTjkY+y
// SIG // OSxRnOlwaQ3KNi1wjjHINSi947SHJMPgyY9+tVSP3PoF
// SIG // VZhtaDuaRr3tpK56KTesy+uDRedGbsoy1cCGMFxPLOJi
// SIG // ss254o2I5JasAUq7vnGpF1tnYN74kpEeHT39IM9zfUGa
// SIG // RnXNxF803RKJ1v2lIH1+/NmeRd+2ci/bfV+Autuqfjbs
// SIG // Nkz2K26oElHovwUDo9Fzpk03dJQcNIIP8BDyt0cY7afo
// SIG // mXw/TNuvXsLz1dhzPUNOwTM5TI4CvEJoLhDqhFFG4tG9
// SIG // ahhaYQFzymeiXtcodgLiMxhy16cg8ML6EgrXY28MyTZk
// SIG // i1ugpoMhXV8wdJGUlNi5UPkLiWHzNgY1GIRH29wb0f2y
// SIG // 1BzFa/ZcUlFdEtsluq9QBXpsxREdcu+N+VLEhReTwDwV
// SIG // 2xo3xwgVGD94q0W29R6HXtqPnhZyacaue7e3PmriLq0C
// SIG // AwEAAaOCAd0wggHZMBIGCSsGAQQBgjcVAQQFAgMBAAEw
// SIG // IwYJKwYBBAGCNxUCBBYEFCqnUv5kxJq+gpE8RjUpzxD/
// SIG // LwTuMB0GA1UdDgQWBBSfpxVdAF5iXYP05dJlpxtTNRnp
// SIG // cjBcBgNVHSAEVTBTMFEGDCsGAQQBgjdMg30BATBBMD8G
// SIG // CCsGAQUFBwIBFjNodHRwOi8vd3d3Lm1pY3Jvc29mdC5j
// SIG // b20vcGtpb3BzL0RvY3MvUmVwb3NpdG9yeS5odG0wEwYD
// SIG // VR0lBAwwCgYIKwYBBQUHAwgwGQYJKwYBBAGCNxQCBAwe
// SIG // CgBTAHUAYgBDAEEwCwYDVR0PBAQDAgGGMA8GA1UdEwEB
// SIG // /wQFMAMBAf8wHwYDVR0jBBgwFoAU1fZWy4/oolxiaNE9
// SIG // lJBb186aGMQwVgYDVR0fBE8wTTBLoEmgR4ZFaHR0cDov
// SIG // L2NybC5taWNyb3NvZnQuY29tL3BraS9jcmwvcHJvZHVj
// SIG // dHMvTWljUm9vQ2VyQXV0XzIwMTAtMDYtMjMuY3JsMFoG
// SIG // CCsGAQUFBwEBBE4wTDBKBggrBgEFBQcwAoY+aHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNS
// SIG // b29DZXJBdXRfMjAxMC0wNi0yMy5jcnQwDQYJKoZIhvcN
// SIG // AQELBQADggIBAJ1VffwqreEsH2cBMSRb4Z5yS/ypb+pc
// SIG // FLY+TkdkeLEGk5c9MTO1OdfCcTY/2mRsfNB1OW27DzHk
// SIG // wo/7bNGhlBgi7ulmZzpTTd2YurYeeNg2LpypglYAA7AF
// SIG // vonoaeC6Ce5732pvvinLbtg/SHUB2RjebYIM9W0jVOR4
// SIG // U3UkV7ndn/OOPcbzaN9l9qRWqveVtihVJ9AkvUCgvxm2
// SIG // EhIRXT0n4ECWOKz3+SmJw7wXsFSFQrP8DJ6LGYnn8Atq
// SIG // gcKBGUIZUnWKNsIdw2FzLixre24/LAl4FOmRsqlb30mj
// SIG // dAy87JGA0j3mSj5mO0+7hvoyGtmW9I/2kQH2zsZ0/fZM
// SIG // cm8Qq3UwxTSwethQ/gpY3UA8x1RtnWN0SCyxTkctwRQE
// SIG // cb9k+SS+c23Kjgm9swFXSVRk2XPXfx5bRAGOWhmRaw2f
// SIG // pCjcZxkoJLo4S5pu+yFUa2pFEUep8beuyOiJXk+d0tBM
// SIG // drVXVAmxaQFEfnyhYWxz/gq77EFmPWn9y8FBSX5+k77L
// SIG // +DvktxW/tM4+pTFRhLy/AsGConsXHRWJjXD+57XQKBqJ
// SIG // C4822rpM+Zv/Cuk0+CQ1ZyvgDbjmjJnW4SLq8CdCPSWU
// SIG // 5nR0W2rRnj7tfqAxM328y+l7vzhwRNGQ8cirOoo6CGJ/
// SIG // 2XBjU02N7oJtpQUQwXEGahC0HVUzWLOhcGbyoYIDTTCC
// SIG // AjUCAQEwgfmhgdGkgc4wgcsxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xJTAjBgNVBAsTHE1pY3Jvc29mdCBBbWVyaWNhIE9w
// SIG // ZXJhdGlvbnMxJzAlBgNVBAsTHm5TaGllbGQgVFNTIEVT
// SIG // TjpBNDAwLTA1RTAtRDk0NzElMCMGA1UEAxMcTWljcm9z
// SIG // b2Z0IFRpbWUtU3RhbXAgU2VydmljZaIjCgEBMAcGBSsO
// SIG // AwIaAxUA+a9w1UaQBkKPbEy1B3gQvOzaSvqggYMwgYCk
// SIG // fjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDANBgkq
// SIG // hkiG9w0BAQsFAAIFAOki3Y0wIhgPMjAyMzEyMTIxMzI0
// SIG // MjlaGA8yMDIzMTIxMzEzMjQyOVowdDA6BgorBgEEAYRZ
// SIG // CgQBMSwwKjAKAgUA6SLdjQIBADAHAgEAAgIN9DAHAgEA
// SIG // AgIT4TAKAgUA6SQvDQIBADA2BgorBgEEAYRZCgQCMSgw
// SIG // JjAMBgorBgEEAYRZCgMCoAowCAIBAAIDB6EgoQowCAIB
// SIG // AAIDAYagMA0GCSqGSIb3DQEBCwUAA4IBAQBbBMUGUpP9
// SIG // nyRKbGXzIls5B9NTT2YgbK0bQkdIhKHB1DPA0rVgEkpT
// SIG // ask5SAg0oM0eswNI2+gEZLqgdyoOza7Z/+sZirNxd1ZB
// SIG // c1CpTyov1kkzhfRsCeWUxJK8gs4MrpzwUjFAYdDERupf
// SIG // r4ZoKuXYEYr5+fF5Db0oW4fSLERA46oOo1aYlAQ5VydU
// SIG // QeMwidhenXgnb2gxhC/UW+xOf0uBDDSDkMgVspj+geyu
// SIG // QJVI8+wKHzYadq0fK8y7mPL/VDOU9Ez9R27rcitRedYX
// SIG // xsiSzK1Osbe0uQDefAJiVwHUSBuKiNtJi3BAJD4KZoSf
// SIG // HDQgTfxc58gMEIje0aE+Q7tXMYIEDTCCBAkCAQEwgZMw
// SIG // fDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWlj
// SIG // cm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMAAAHW
// SIG // J2n/ci1WyK4AAQAAAdYwDQYJYIZIAWUDBAIBBQCgggFK
// SIG // MBoGCSqGSIb3DQEJAzENBgsqhkiG9w0BCRABBDAvBgkq
// SIG // hkiG9w0BCQQxIgQgdC2z4xco37tOwkiGQBZtpZX/XPFo
// SIG // AAqXt91XzpE2tBwwgfoGCyqGSIb3DQEJEAIvMYHqMIHn
// SIG // MIHkMIG9BCDWy00NV3jTPhAYpzhCTI2XdIzDQ7q/gCvj
// SIG // vD9do+Uk/DCBmDCBgKR+MHwxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFBDQSAyMDEwAhMzAAAB1idp/3ItVsiuAAEAAAHWMCIE
// SIG // IMzGruhc2TkrFB5SO5qxlnMeGM7atf5ItT4WyypJtoaD
// SIG // MA0GCSqGSIb3DQEBCwUABIICADmElLd+qaM1n/LVu+4d
// SIG // p3sYryew1jHURaObxLem9i7jWV7cEfejg9Cm59TsbQ21
// SIG // Xh7uX9EXMnkeeu49ndFelFPV4ueOSafa+gZatDBkl/vK
// SIG // I8NwEX0xM4BhhJnxzSNh1JTM9ByeZHUmyPEUL5uFRGie
// SIG // xJKrjBNd9aeGNa4sZA12TCen3a+jyItaLndtaEe6wBz6
// SIG // PPDS2bbvrisbgqnpORljBUisRkLEAHRjGfzKZbVNIHzi
// SIG // PhzMILr7Dbyh538g07jZZGSsPEu792WBAAYK/GHXeSTp
// SIG // JuE8rbRe/42H6EBE+c4vIOK1qYvVMIPx7ZB5kUaVurgW
// SIG // 8Z0I7WLMUJKl5qzn4CwQbMvsbP1TkHbuwRmXKn8pmc7U
// SIG // 91DEF89B1p7dD7tnRt0kkLYk0fo0bkzUsT36H0BD6UzA
// SIG // qqGDiI3et5LRoJ/sF2YVwbzySRAH9sYsr0oAU0ZpjbmA
// SIG // IozyLjEIf3C9g5yO+gAABH2dXtMDTaj4cjyTTr/PT9Mv
// SIG // CQboLPC3PQ/G6cCNOVD1L9S4stHoFrzZah1Uu6wh+C0l
// SIG // jTMHKJHuoSzM3rSsXV1LvYLDlcuwF5oG5DMWOTWCbAMb
// SIG // q/stEBv4EC3DGU1YM3ZxE2h7B7h3pAPoamRjvgRcGnaO
// SIG // XcrWnBvM2lN4nbZMWNrTOmbWf7K21TYi9HpRmhSRfNvW
// SIG // v6zr
// SIG // End signature block
