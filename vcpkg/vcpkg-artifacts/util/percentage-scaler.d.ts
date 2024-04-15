export declare class PercentageScaler {
    readonly lowestDomain: number;
    readonly highestDomain: number;
    readonly lowestPercentage: number;
    readonly highestPercentage: number;
    private readonly scaledDomainMax;
    private readonly scaledPercentMax;
    private static clamp;
    constructor(lowestDomain: number, highestDomain: number, lowestPercentage?: number, highestPercentage?: number);
    scalePosition(domain: number): number;
}
//# sourceMappingURL=percentage-scaler.d.ts.map