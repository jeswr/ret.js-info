import type {
  Char, Group, Position, Range, Reference, Repetition, Root, Set, Tokens,
} from 'ret';

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
  pattern?: string[];
  /**
   * Whether this token has a 'fixed solution', e.g `(hello)`,
   * or many solutions, e.g. `[0-9]`.
   */
  fixed: boolean;
}

export interface DetailGroup extends Detailed<Group> {
  stack?: DetailToken[];
  options?: DetailToken[][];
  reference?: number;
}

export interface DetailSet extends Detailed<Set> {
  set: (DetailSet | Detailed<Range> | Detailed<Char>)[];
}

export interface DetailRepetition extends Detailed<Repetition> {
  value: DetailToken;
}

export interface DetailRoot extends Detailed<Root> {
  stack?: DetailToken[];
  options?: DetailToken[][];
}

export type DetailToken =
  | DetailSet
  | DetailRepetition
  | DetailGroup
  | Detailed<Reference>
  | Detailed<Char>
  | Detailed<Position>
  | Detailed<Range>;

export type DetailTokens = DetailToken | DetailRoot;
