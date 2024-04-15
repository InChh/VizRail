import { Session } from '../session';
import { CommandLine } from './command-line';
export declare function indent(text: string): string;
export declare function indent(text: Array<string>): Array<string>;
export declare const log: (message?: any) => void;
export declare const error: (message?: any) => void;
export declare const warning: (message?: any) => void;
export declare const debug: (message?: any) => void;
export declare function writeException(e: any): void;
export declare function initStyling(commandline: CommandLine, session: Session): void;
//# sourceMappingURL=styling.d.ts.map