import { Char, Position, Set, types, Tokens, Range, Repetition, Reference, Group, Root, reconstruct } from 'ret';
import genex from 'genex'
import * as R from 'ramda';

/**
 * Details that are added to every ret.js token
 */
 interface PartialDetailToken {
  /**
   * Minimum number of characters required to 'satisfy' the regex component
   */
   minChar : number;
   /**
    * Maximum number of characters required to 'satisfy' the regex component
    */
   maxChar : number;
  /**
   * Whether the '^' positional is applied or not;
   */
  leftEnd: boolean;
  /**
   * Whether the '$' positional is applied or not;
   */
  rightEnd: boolean;
}


/**
 * Details that are added to every ret.js token
 */
interface DetailToken {
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
  stringOptions: ReturnType<typeof genex>;
  /**
   * Whether the '^' positional is applied or not;
   */
  leftEnd: boolean;
  /**
   * Whether the '$' positional is applied or not;
   */
  rightEnd: boolean;
}




interface DetailChar extends DetailToken, Char {

}

interface DetailPosition extends DetailToken, Position {

}

interface DetailSet extends DetailToken, Set {
  set: (DetailRange | DetailChar | DetailSet)[]
}

interface DetailRepetition extends DetailToken, Omit<Repetition, 'value'> {
  value: DetailTokenNoRoot
}

interface DetailGroup extends DetailToken, Omit<Group, 'stack' | 'options'> {
  stack?: DetailTokenNoRoot[];
  options?: DetailTokenNoRoot[][];
}

interface DetailRoot extends DetailToken, Omit<Root, 'stack' | 'options'> {
  stack?: DetailTokenNoRoot[];
  options?: DetailTokenNoRoot[][];
}

interface DetailReference extends DetailToken, Reference {
  
}

interface DetailRange extends DetailToken, Range {
  
}

type DetailTokenNoRoot = 
  | DetailChar
  | DetailPosition
  | DetailSet
  | DetailRepetition
  | DetailGroup
  | DetailReference
  | DetailRange

type DetailTokens = 
  | DetailChar
  | DetailPosition
  | DetailSet
  | DetailRepetition
  | DetailGroup
  | DetailRoot
  | DetailReference
  | DetailRange

export function charHandler(token: Char) {
  return {
    minChar: 1,
    maxChar: 1,
  }
}

export function positionHandler(token: Position) {
  return {
    minChar: 0,
    maxChar: 0,
    leftEnd: token.value === '^',
    rightEnd: token.value === '$'
  }
}

export function rangeHandler(token: Range) {
  return {
    minChar: 1,
    maxChar: 1,
  }
}

export function setHandler(token: Set, flags: string[]) {
  const set = token.set.map((tkn) => addDetail(tkn, flags))
  return {
    set,
    minChar: Math.min(...set.map((x) => x.minChar)),
    maxChar: Math.max(...set.map((x) => x.maxChar)),
    leftEnd: false,
    rightEnd: false
  }
}

export function repetitionHandler(token: Repetition, flags: string[]) {
  const value = addDetail(token.value, flags);
  return {
    value,
    minChar: value.minChar * token.min,
    maxChar: value.maxChar * token.max,
    leftEnd: false,
    rightEnd: false,
  }
}

export function referenceHandler(token: Reference, currentStack: DetailToken[]) {
  const ref = currentStack[token.value - 1];
  return {
    minChar: ref.minChar,
    maxChar: ref.maxChar,
    leftEnd: ref.leftEnd,
    rightEnd: ref.rightEnd,
  }
}

/**
 * Takes a tokenized expression add adds details to each token
 * according to the 'detailedToken' type
 * @param token Tokenized regular expression
 * @param flags Flags associated with the tokenized expression
 */
 export function addDetail(
  token: Tokens & { flags?: string[] },
  flags: string[] = (token.flags ??= []),
  currentStack: PartialDetailToken[] = [],
): DetailTokens {
  const regex = new RegExp(reconstruct(token), flags.join(''));
  const stringOptions = genex(regex);
  switch (token.type) {
    case types.CHAR: return {
      ...token,
      regex,
      stringOptions,
      fixed: stringOptions.count() === 1,
      minChar: 1,
      maxChar: 1,
      leftEnd: false,
      rightEnd: false
    };
    case types.POSITION: return {
      ...token,
      regex,
      stringOptions,
      fixed: stringOptions.count() === 1,
      minChar: 0,
      maxChar: 0,
      leftEnd: token.value === '^',
      rightEnd: token.value === '$'
    };
    case types.RANGE: return {
      ...token,
      regex,
      stringOptions,
      fixed: stringOptions.count() === 1,
      minChar: 1,
      maxChar: 1,
      leftEnd: false,
      rightEnd: false
    };
    case types.SET: return {
      ...token,
      regex,
      stringOptions,
      fixed: stringOptions.count() === 1,
      ...setHandler(token, flags)
    };
    case types.REPETITION: return {
      ...token,
      ...repetitionHandler(token, flags)
      regex,
      stringOptions,
      fixed: stringOptions.count() === 1,
    };
    case types.REFERENCE: return referenceHandler(token, currentStack);
    case types.GROUP:
    case types.ROOT:
      return { 
        type: token.type,

        regex,
        stringOptions,
        fixed: stringOptions.count() === 1,
        ...groupHandler(token, flags)
      }
  }
  // Have flags for left and right being 'artificially' bounded
  return;
}


export function handleStack(oldStack: Tokens[], flags: string[]) {
  const stack = oldStack.reduce((t: DetailTokenNoRoot[], token): DetailTokenNoRoot[] => {
    const detail = addDetail(token, flags, t)
    
    if (detail.type === types.ROOT) {
      throw new Error();
    }

    return [
      ...t,
      detail,
    ]
  }, <DetailTokenNoRoot[]>[]);
  return {
    stack,
    minChar: R.sum(stack.map((x) => x.minChar)),
    maxChar: R.sum(stack.map((x) => x.maxChar)),
    leftEnd: stack[0].leftEnd,
    rightEnd: R.last(stack)?.rightEnd ?? false,
  };
}


function groupHandler(token: Group | Root, flags: string[]) {
  if (token.stack) {
    return handleStack(token.stack, flags);
  } else if (token.options) {
    const options = token.options.map((option) => handleStack(option, flags));
    return {
      options,
      minChar: Math.min(...options.map((x) => x.minChar)),
      maxChar: Math.max(...options.map((x) => x.maxChar)),
      leftEnd: options.every((x) => x.leftEnd),
      rightEnd: options.every((x) => x.rightEnd)
    }
  }
  throw new Error('Group and root tokens should contain a stack or options parameter');
}
