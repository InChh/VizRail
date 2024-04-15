/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { EventEmitter, Transform, TransformCallback } from 'stream';
export interface Progress {
    progress(percent: number, bytes: number, msec: number): void;
}
export interface ProgressTrackingEvents extends EventEmitter {
    on(event: 'progress', callback: (progress: number, currentPosition: number, msec: number) => void): this;
}
export declare class ProgressTrackingStream extends Transform implements ProgressTrackingEvents {
    private readonly stopwatch;
    private readonly scaler;
    private currentPosition;
    constructor(start: number, end: number);
    _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback): void;
    get currentPercentage(): number;
}
//# sourceMappingURL=streams.d.ts.map