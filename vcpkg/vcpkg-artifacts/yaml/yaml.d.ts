import { Document, Node, Pair, YAMLMap } from 'yaml';
export declare function getStrings(node: Document.Parsed | YAMLMap, name: string): Array<string>;
/** values that can be either a single string, or an array of strings */
export type StringOrStrings = string | Array<string>;
export declare function setStrings(node: Document.Parsed | YAMLMap, name: string, value: StringOrStrings): void;
export declare function getPair(from: YAMLMap, name: string): Pair<Node, string> | undefined;
export declare function serialize(value: any): string;
//# sourceMappingURL=yaml.d.ts.map