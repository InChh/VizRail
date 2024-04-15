import { ErrorKind } from './error-kind';
export interface ValidationMessage {
    message: string;
    range?: [number, number, number] | {
        sourcePosition(): [number, number, number] | undefined;
    };
    rangeOffset?: {
        line: number;
        column: number;
    };
    category: ErrorKind;
}
//# sourceMappingURL=validation-message.d.ts.map