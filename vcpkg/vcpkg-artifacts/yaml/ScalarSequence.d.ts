import { Scalar, YAMLSeq } from 'yaml';
import { ValidationMessage } from '../interfaces/validation-message';
import { Primitive, Yaml, YAMLScalar } from './yaml-types';
/**
 * ScalarSequence is expressed as either a single scalar value or a sequence of scalar values.
 */
export declare class ScalarSequence<TElement extends Primitive> extends Yaml<YAMLSeq<TElement> | Scalar<TElement>> {
    static create(): YAMLScalar;
    get length(): number;
    has(value: TElement): boolean;
    add(value: TElement): void;
    delete(value: TElement): boolean;
    get(index: number): TElement | undefined;
    [Symbol.iterator](): Iterator<TElement>;
    clear(): void;
    validate(): Iterable<ValidationMessage>;
}
//# sourceMappingURL=ScalarSequence.d.ts.map