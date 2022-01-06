import type { Char, Position, Set, Tokens, Range, Repetition, Reference, Group, Root, reconstruct, Token, SetTokens } from 'ret';
import type genex from 'genex'

/**
 * Details that are added to every ret.js token
 */
 export interface Detailed<T extends Tokens> {
  /**
   * Minimum number of characters required to 'satisfy' the regex component
   */
  minChar: number;
  /**
   * Maximum number of characters required to 'satisfy' the regex component
   */
  maxChar: number;
  /**
   * Whether the '^' positional is applied or not;
   */
  leftEnd: boolean;
  /**
   * Whether the '$' positional is applied or not;
   */
  rightEnd: boolean;
  /**
   * The original tokens
   */
  token: T
  /**
   * Regular expression (Regex Object with flags) that the token is representing
   */
  regex: RegExp;
  /**
   * Generator for possible values of regular expression
   */
  pattern: ReturnType<typeof genex>;
  /**
   * Whether this token has a 'fixed solution', e.g `(hello)`,
   * or many solutions, e.g. `[0-9]`.
   */
  fixed: boolean;
}

export interface DetailGroup extends Detailed<Group> {
  stack?: Detailed<Token>[];
  options?: Detailed<Token>[][];
}

export interface DetailSet extends Detailed<Set> {
  set: (DetailSet | Detailed<Range> | Detailed<Char>)[];
}

export interface DetailRepetition extends Detailed<Repetition> {
  value: Detailed<Token>;
}

export interface DetailRoot extends Detailed<Root> {
  stack?: Detailed<Token>[];
  options?: Detailed<Token>[][];
}


export type DetailToken = DetailSet | DetailRepetition | DetailGroup | Detailed<Reference> | Detailed<Char> | Detailed<Position> | Detailed<Range>;
export type DetailTokens = DetailToken | DetailRoot;
