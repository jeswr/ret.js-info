import { Tokens } from 'ret';

/**
 * Details that are added to every ret.js token
 */
interface details {
  /**
   * Minimum number of characters required to 'satisfy' the regex component
   */
  minChar : number;
  /**
   * Maximum number of characters required to 'satisfy' the regex component
   */
  maxChar : number;
  /**
   * Regular expression (Regex Object with flags) that the token is representing
   */
  regex : RegExp;
  /**
   * Whether this token has a 'fixed solution', e.g `(hello)`,
   * or many solutions, e.g. `[0-9]`.
   */
  fixed: boolean;
  /**
   * List of options that satisfy the token
   */
  stringOptions: string[] | undefined;
  /**
   * The group reference of the token (if applicable)
   */
  reference?: number;
  /**
   * Whether the '^' positional is applied or not;
   */
  leftEnd: boolean;
  /**
   * Whether the '$' positional is applied or not;
   */
  rightEnd: boolean;
}

export type detailedTokens = Tokens & details
