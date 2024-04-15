import { MediaQueryError, Scanner, Token } from './scanner';
export declare function parseQuery(text: string): QueryList;
export declare function takeWhitespace(cursor: Scanner): void;
declare class QueryList {
    queries: Query[];
    get isValid(): boolean;
    error?: MediaQueryError;
    protected constructor();
    get length(): number;
    static parse(cursor: Scanner): QueryList;
    static parseQuery(cursor: Scanner): Iterable<Query>;
    get features(): Set<string>;
    match(properties: Record<string, unknown>): boolean;
}
declare class Query {
    readonly expressions: Array<Expression>;
    protected constructor(expressions: Array<Expression>);
    static parse(cursor: Scanner): Query;
}
declare class Expression {
    protected readonly featureToken: Token;
    protected readonly constantToken: Token | undefined;
    readonly not: boolean;
    protected constructor(featureToken: Token, constantToken: Token | undefined, not: boolean);
    get feature(): string;
    get constant(): string | undefined;
}
export {};
//# sourceMappingURL=media-query.d.ts.map