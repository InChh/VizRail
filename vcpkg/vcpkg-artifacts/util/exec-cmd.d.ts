/// <reference types="node" />
/// <reference types="node" />
import { ChildProcess, SpawnOptions } from 'child_process';
export interface ExecOptions extends SpawnOptions {
    onCreate?(cp: ChildProcess): void;
    onStdOutData?(chunk: any): void;
    onStdErrData?(chunk: any): void;
}
export interface ExecResult {
    stdout: string;
    stderr: string;
    env: NodeJS.ProcessEnv | undefined;
    /**
     * Union of stdout and stderr.
     */
    log: string;
    error: Error | null;
    code: number | null;
    command: string;
    args: Array<string>;
}
export declare function cmdlineToArray(text: string, result?: Array<string>, matcher?: RegExp, count?: number): Array<string>;
export declare function execute(command: string, cmdlineargs: Array<string>, options?: ExecOptions): Promise<ExecResult>;
//# sourceMappingURL=exec-cmd.d.ts.map