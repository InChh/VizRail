export declare enum MessageCategory {
    Warning = 0,
    Error = 1,
    Suggestion = 2,
    Message = 3
}
export interface Message {
    code: number;
    category: MessageCategory;
    text: string;
}
export declare const messages: {
    DigitExpected: {
        code: number;
        category: MessageCategory;
        text: string;
    };
    HexDigitExpected: {
        code: number;
        category: MessageCategory;
        text: string;
    };
    BinaryDigitExpected: {
        code: number;
        category: MessageCategory;
        text: string;
    };
    UnexpectedEndOfFile: {
        code: number;
        category: MessageCategory;
        text: string;
    };
    InvalidEscapeSequence: {
        code: number;
        category: MessageCategory;
        text: string;
    };
};
export declare function format(text: string, ...args: Array<string | number>): string;
export interface Token {
    /** the character offset within the document */
    readonly offset: number;
    /** the text of the current token (when appropriate) */
    text: string;
    /** the literal value  */
    stringValue?: string;
    /** the token kind */
    readonly kind: Kind;
}
/**
 * Position in a text document expressed as zero-based line and character offset.
 * The offsets are based on a UTF-16 string representation. So a string of the form
 * `a𐐀b` the character offset of the character `a` is 0, the character offset of `𐐀`
 * is 1 and the character offset of b is 3 since `𐐀` is represented using two code
 * units in UTF-16.
 *
 * Positions are line end character agnostic. So you cannot specify a position that
 * denotes `\r|\n` or `\n|` where `|` represents the character offset.
 */
export interface Position {
    /**
     * Line position in a document (zero-based).
     * If a line number is greater than the number of lines in a document, it defaults back to the number of lines in the document.
     * If a line number is negative, it defaults to 0.
     */
    line: number;
    /**
     * Character offset on a line in a document (zero-based). Assuming that the line is
     * represented as a string, the `character` value represents the gap between the
     * `character` and `character + 1`.
     *
     * If the character value is greater than the line length it defaults back to the
     * line length.
     * If a line number is negative, it defaults to 0.
     */
    column: number;
}
export declare enum Kind {
    Unknown = 0,
    EndOfFile = 1,
    SingleLineComment = 2,
    MultiLineComment = 3,
    NewLine = 4,
    Whitespace = 5,
    ConflictMarker = 6,
    NumericLiteral = 7,
    StringLiteral = 8,
    BooleanLiteral = 9,
    TrueKeyword = 10,
    FalseKeyword = 11,
    OpenBrace = 12,
    CloseBrace = 13,
    OpenParen = 14,
    CloseParen = 15,
    OpenBracket = 16,
    CloseBracket = 17,
    Dot = 18,
    Elipsis = 19,
    Semicolon = 20,
    Comma = 21,
    QuestionDot = 22,
    LessThan = 23,
    OpenAngle = 23,
    LessThanSlash = 24,
    GreaterThan = 25,
    CloseAngle = 25,
    LessThanEquals = 26,
    GreaterThanEquals = 27,
    EqualsEquals = 28,
    ExclamationEquals = 29,
    EqualsEqualsEquals = 30,
    ExclamationEqualsEquals = 31,
    EqualsArrow = 32,
    Plus = 33,
    Minus = 34,
    Asterisk = 35,
    AsteriskAsterisk = 36,
    Slash = 37,
    Percent = 38,
    PlusPlus = 39,
    MinusMinus = 40,
    LessThanLessThan = 41,
    GreaterThanGreaterThan = 42,
    GreaterThanGreaterThanGreaterThan = 43,
    Ampersand = 44,
    Bar = 45,
    Caret = 46,
    Exclamation = 47,
    Tilde = 48,
    AmpersandAmpersand = 49,
    BarBar = 50,
    Question = 51,
    Colon = 52,
    At = 53,
    QuestionQuestion = 54,
    Equals = 55,
    PlusEquals = 56,
    MinusEquals = 57,
    AsteriskEquals = 58,
    AsteriskAsteriskEquals = 59,
    SlashEquals = 60,
    PercentEquals = 61,
    LessThanLessThanEquals = 62,
    GreaterThanGreaterThanEquals = 63,
    GreaterThanGreaterThanGreaterThanEquals = 64,
    AmpersandEquals = 65,
    BarEquals = 66,
    BarBarEquals = 67,
    AmpersandAmpersandEquals = 68,
    QuestionQuestionEquals = 69,
    CaretEquals = 70,
    Identifier = 71,
    KeywordsStart = 1000,
    AndKeyword = 1001,
    NotKeyword = 1002,
    KeywordsEnd = 1003,
    Elements = 2000,
    Model = 2001,
    Enum = 2002,
    EnumValue = 2003,
    Import = 2004,
    TypeAlias = 2005,
    ParameterAlias = 2006,
    ResponseAlias = 2007,
    Interface = 2008,
    Operation = 2009,
    Annotation = 2010,
    Documentation = 2011,
    Label = 2012,
    Preamble = 2013,
    Property = 2014,
    Parameter = 2015,
    TemplateDeclaration = 2016,
    TemplateParameters = 2017,
    Parent = 2018,
    Response = 2019,
    ResponseExpression = 2020,
    Result = 2021,
    TypeExpression = 2022,
    Union = 2023
}
export declare class Scanner implements Token {
    #private;
    /** The assumed tab width. If this is set before scanning, it enables accurate Position tracking. */
    tabWidth: number;
    /** the character offset within the document */
    offset: number;
    /** the token kind */
    kind: Kind;
    /** the text of the current token (when appropriate) */
    text: string;
    /** the string value of current string literal token (unquoted, unescaped) */
    stringValue?: string;
    /** returns the Position (line/column) of the current token */
    get position(): Position;
    constructor(text: string);
    get eof(): boolean;
    private advance;
    private next;
    /** adds the current position to the token to the offset:position map */
    private markPosition;
    /** updates the position and marks the location  */
    private newLine;
    start(): this;
    /**
     * Identifies and returns the next token type in the document
     *
     * @returns the state of the scanner will have the properties `token`, `value`, `offset` pointing to the current token at the end of this call.
     *
     * @notes before this call, `#offset` is pointing to the next character to be evaluated.
     *
     */
    scan(): Kind;
    take(): this;
    takeWhitespace(): void;
    /**
   * When the current token is greaterThan, this will return any tokens with characters
   * after the greater than character. This has to be scanned separately because greater
   * thans appear in positions where longer tokens are incorrect, e.g. `model x<y>=y;`.
   * The solution is to call rescanGreaterThan from the parser in contexts where longer
   * tokens starting with `>` are allowed (i.e. when parsing binary expressions).
   */
    rescanGreaterThan(): Kind;
    private isConflictMarker;
    private scanWhitespace;
    private scanDigits;
    private scanNumber;
    private scanHexNumber;
    private scanBinaryNumber;
    private get widthOfCh();
    private scanUntil;
    private scanSingleLineComment;
    private scanMultiLineComment;
    private scanString;
    private unescapeString;
    scanIdentifier(): Kind;
    /**
   * Returns the zero-based line/column from the given offset
   * (binary search thru the token start locations)
   * @param offset the character position in the document
   */
    positionFromOffset(offset: number): Position;
    static TokensFrom(text: string): Iterable<Token>;
    protected assert(assertion: boolean, message: string): void;
}
export declare class MediaQueryError extends Error {
    readonly line: number;
    readonly column: number;
    constructor(message: string, line: number, column: number);
}
//# sourceMappingURL=scanner.d.ts.map