/// <reference types="node" />
import { EventEmitter } from 'node:events';
import { Session } from '../session';
/** Event defintions for channel events */
export interface ChannelEvents {
    warning(text: string, msec: number): void;
    error(text: string, msec: number): void;
    message(text: string, msec: number): void;
    debug(text: string, msec: number): void;
}
/** Exposes a set of events that are used to communicate with the user
 *
 * Warning, Error, Message, Debug
 */
export declare class Channels extends EventEmitter {
    warning(text: string | Array<string>): void;
    error(text: string | Array<string>): void;
    message(text: string | Array<string>): void;
    debug(text: string | Array<string>): void;
    constructor(session: Session);
}
//# sourceMappingURL=channels.d.ts.map