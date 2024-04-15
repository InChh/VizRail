/**
 * Creates a reusable safe-eval sandbox to execute code in.
 */
export declare function createSandbox(): <T>(code: string, context?: any) => T;
export declare const safeEval: <T>(code: string, context?: any) => T;
export declare function setLocale(newLocale: string | undefined): void;
/**
 * Support for tagged template literals for i18n.
 *
 * Leverages translation files in ../i18n
 *
 * @param literals the literal values in the tagged template
 * @param values the inserted values in the template
 *
 * @translator
 */
export declare function i(literals: TemplateStringsArray, ...values: Array<string | number | boolean | undefined | Date>): string;
//# sourceMappingURL=i18n.d.ts.map