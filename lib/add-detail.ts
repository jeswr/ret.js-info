import {
  Char, Position, Set, types, Tokens, Range, Repetition, Reference, Group, Root, reconstruct, Token,
} from 'ret';
import * as R from 'ramda';
import {
  DetailGroup, DetailRepetition, DetailRoot, DetailSet, DetailToken, DetailTokens, Detailed,
} from './types';

function detail<T extends Tokens>(
  token: T,
  pattern?: string[],
  flags: string[] = [],
  minChar: number = 1,
  maxChar: number = 1,
  leftEnd: boolean = false,
  rightEnd: boolean = false,
): Detailed<T> {
  const regex = new RegExp(reconstruct(token), flags.join(''));
  return {
    minChar,
    maxChar,
    leftEnd,
    rightEnd,
    pattern: pattern && R.uniq(pattern),
    regex,
    fixed: pattern?.length === 1,
    token,
  };
}

function setHandler(token: Set, flags?: string[]): DetailSet {
  const set: (DetailSet | Detailed<Range> | Detailed<Char>)[] = token.set.map(
    (tkn) => addDetail(tkn, flags),
  );
  let pattern: string[] | undefined = [];
  if (token.not !== true) {
    pattern = set.reduce(
      (t: string[] | undefined, { pattern: options }) => ((options && t)
        ? [...t, ...options]
        : undefined),
      [],
    );
  } else {
    pattern = undefined; // This can be improved
  }
  return {
    set,
    ...detail(
      token,
      pattern,
      flags,
      Math.min(...set.map((x) => x.minChar)),
      Math.max(...set.map((x) => x.maxChar)),
    ),
  };
}

function repetitionHandler(token: Repetition, flags: string[] = [], limit: number): DetailRepetition {
  const value = addDetail(token.value, flags);

  let pattern: string[] | undefined = [];
  if (value.pattern && token.max < Infinity) {
    let total = 0;
    for (let i = token.min; i <= token.max; i += 1) {
      total += value.pattern.length ** i;
    }
    if (total > limit) {
      pattern = undefined;
    } else { // TODO: Make sure to add tests for the zero case
      let addPattern = [''];
      for (let i = 1; i < token.min; i += 1) {
        addPattern = R.xprod(addPattern, value.pattern).map((x) => x.join(''));
      }
      for (let i = token.min; i <= token.max; i += 1) {
        addPattern = R.xprod(addPattern, value.pattern).map((x) => x.join(''));
        pattern = pattern.concat(addPattern);
      }
    }
  }
  return {
    value,
    ...detail(token, pattern, flags, value.minChar * token.min, value.maxChar * token.max),
  };
}

/* istanbul ignore next */
function referenceHandler(token: Reference, flags?: string[], currentStack: Detailed<Token>[] = []) {
  const ref = currentStack.find(
    // @ts-ignore
    (x) => x.token.type === types.GROUP && 'reference' in x && x.reference === token.value,
  );
  if (!ref) {
    throw new Error('Could not find reference');
  }
  return detail(token, ref.pattern, flags, ref.minChar, ref.maxChar, ref.leftEnd, ref.rightEnd);
}

function ignoreCase(x: string, flags?: string[]): string[] {
  return flags?.includes('i') ? [x.toUpperCase(), x.toLowerCase()] : [x];
}

function getRange(token: Range, flags: string[] = [], limit: number) {
  if (((token.to - token.from) * (flags.includes('i') ? 2 : 1)) > limit) {
    return undefined;
  }
  let chars: string[] = [];
  for (let i = token.from; i <= token.to; i += 1) {
    chars = chars.concat(ignoreCase(String.fromCharCode(i), flags));
  }
  return chars;
}

/**
 * Takes a tokenized expression add adds details to each token
 * according to the 'detailedToken' type
 * @param token Tokenized regular expression
 * @param flags Flags associated with the tokenized expression
 */
export function addDetail(
  token: Char, flags?: string[], stack?: Detailed<Token>[], limit?: number
  ): Detailed<Char>;
export function addDetail(
  token: Position, flags?: string[], stack?: Detailed<Token>[], limit?: number
  ): Detailed<Position>;
export function addDetail(
  token: Range, flags?: string[], stack?: Detailed<Token>[], limit?: number
  ): Detailed<Range>;
export function addDetail(
  token: Reference, flags?: string[], stack?: Detailed<Token>[], limit?: number
  ): Detailed<Reference>;
export function addDetail(
  token: Set, flags?: string[], stack?: Detailed<Token>[], limit?: number
  ): DetailSet;
export function addDetail(
  token: Repetition, flags?: string[], stack?: Detailed<Token>[], limit?: number
  ): DetailRepetition;
export function addDetail(
  token: Group, flags?: string[], stack?: Detailed<Token>[], limit?: number
  ): DetailGroup;
export function addDetail(
  token: Root, flags?: string[], stack?: Detailed<Token>[], limit?: number
  ): DetailRoot;
export function addDetail(
  token: Set | Range | Char, flags?: string[], stack?: Detailed<Token>[], limit?: number
  ): DetailSet | Detailed<Range> | Detailed<Char>;
export function addDetail(
  token: Token, flags?: string[], stack?: Detailed<Token>[], limit?: number
  ): DetailToken;
export function addDetail(token: Tokens, flags?: string[], stack?: Detailed<Token>[], limit: number = 100):
  DetailTokens {
  // This is lazy - fix this
  // istanbul ignore next
  switch (token.type) {
    case types.CHAR: return detail<Char>(token, ignoreCase(String.fromCharCode(token.value), flags), flags);
    case types.POSITION: return detail<Position>(token, [''], flags, 0, 0, token.value === '^', token.value === '$');
    case types.RANGE: return detail<Range>(token, getRange(token, flags, limit), flags);
    case types.SET: return setHandler(token, flags);
    case types.REPETITION: return repetitionHandler(token, flags, limit);
    case types.REFERENCE: return referenceHandler(token, flags, stack);
    case types.GROUP: return groupHandler(token, flags, stack);
    case types.ROOT: return rootHandler(token, flags);
    default:
      // @ts-expect-error
      // istanbul ignore next
      throw new Error(`Unexpected token type: ${token.type}`);
  }
}

function handleStack(oldStack: Token[], flags?: string[]) {
  return oldStack.reduce((t: DetailToken[], token: Token): DetailToken[] => [
    ...t,
    addDetail(token, flags, t),
  ], <DetailToken[]>[]);
}

function getStackPattern(stack: DetailToken[]) {
  let pattern: string[] | undefined = [''];
  for (const t of stack) {
    pattern = pattern && t.pattern ? R.xprod(pattern, t.pattern).map((x) => x.join('')) : undefined;
  }
  return pattern;
}

function groupHandler(token: Group, flags: string[] = [], outerStack: Detailed<Token>[] = []): DetailGroup {
  let reference = 1;
  for (const elem of outerStack) {
    // TODO: Fix this once capturing group bug is resolved
    // istanbul ignore next
    if (elem.token.type === types.GROUP && elem.token.remember) {
      reference += 1;
    }
  }

  if (token.stack) {
    const stack = handleStack(token.stack, flags);
    return {
      stack,
      reference: token.remember ? reference : undefined,
      ...detail(
        token,
        getStackPattern(stack),
        flags,
        R.sum(stack.map((x) => x.minChar)),
        R.sum(stack.map((x) => x.maxChar)),
        stack[0].leftEnd,
        stack[stack.length - 1].rightEnd,
      ),
    };
  } if (token.options) {
    const options = token.options.map((option) => handleStack(option, flags));
    let pattern: string[] | undefined = [];
    for (const option of options) {
      const newPattern = getStackPattern(option);
      if (!newPattern) {
        pattern = undefined;
        break;
      }
      pattern = pattern.concat(newPattern);
    }
    return {
      options,
      reference: token.remember ? reference : undefined,
      ...detail(
        token,
        pattern,
        flags,
        Math.min(...options.map((stack) => R.sum(stack.map((x) => x.minChar)))),
        Math.max(...options.map((stack) => R.sum(stack.map((x) => x.maxChar)))),
        // This is lazy - fix up later
        /* istanbul ignore next */
        options.every((stack) => stack[0].leftEnd),
        /* istanbul ignore next */
        options.every((stack) => stack[stack.length - 1].rightEnd),
      ),
    };
  }
  throw new Error('Group and root tokens should contain a stack or options parameter');
}

function rootHandler(token: Root, flags?: string[]): DetailRoot {
  if (token.stack) {
    const stack = handleStack(token.stack, flags);
    return {
      stack,
      ...detail(
        token,
        getStackPattern(stack),
        flags,
        R.sum(stack.map((x) => x.minChar)),
        R.sum(stack.map((x) => x.maxChar)),
        stack[0].leftEnd,
        stack[stack.length - 1].rightEnd,
      ),
    };
  } if (token.options) {
    const options = token.options.map((option) => handleStack(option, flags));
    let pattern: string[] | undefined = [];
    for (const option of options) {
      const newPattern = getStackPattern(option);
      if (!newPattern) {
        pattern = undefined;
        break;
      }
      pattern = pattern.concat(newPattern);
    }
    return {
      options,
      ...detail(
        token,
        pattern,
        flags,
        Math.min(...options.map((stack) => R.sum(stack.map((x) => x.minChar)))),
        Math.max(...options.map((stack) => R.sum(stack.map((x) => x.maxChar)))),
        options.every((stack) => stack[0].leftEnd),
        options.every((stack) => stack[stack.length - 1].rightEnd),
      ),
    };
  }
  throw new Error('Group and root tokens should contain a stack or options parameter');
}
