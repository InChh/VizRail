/**
 * Does a Promise.any(), and accept the one that first matches the predicate, or if all resolve, and none match, the first.
 *
 * @remarks WARNING - this requires Node 15+
 * @param from
 * @param predicate
 */
export declare function anyWhere<T>(from: Iterable<Promise<T>>, predicate: (value: T) => boolean): Promise<T>;
export declare class Queue {
    private maxConcurency;
    private total;
    private active;
    private queue;
    private whenZero;
    private rejections;
    constructor(maxConcurency?: number);
    get count(): number;
    get done(): Promise<number>;
    /** Will block until the queue hits the zero mark */
    private zero;
    private next;
    /**
     * Queues up actions for throttling the number of concurrent async tasks running at a given time.
     *
     * If the process has reached max concurrency, the action is deferred until the last item
     * The last item
     * @param action
     */
    enqueue<T>(action: () => Promise<T>): Promise<T>;
    enqueueMany<S, T>(iterable: Iterable<S>, fn: (v: S) => Promise<T>): this;
}
//# sourceMappingURL=promise.d.ts.map