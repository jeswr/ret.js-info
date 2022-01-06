import { DetailGroup, DetailRepetition, DetailRoot, DetailSet, DetailToken, DetailTokens, Detailed } from './types'
import { Char, Position, Set, types, Tokens, Range, Repetition, Reference, Group, Root, reconstruct, Token, SetTokens } from 'ret';
import genex from 'genex'
import * as R from 'ramda';

function detail<T extends Tokens>(token: T, pattern?: string[], flags: string[] = [], minChar: number = 1, maxChar: number = 1, leftEnd: boolean = false, rightEnd: boolean = false): Detailed<T> {
  const regex = new RegExp(reconstruct(token), flags.join(''));
  return {
    minChar,
    maxChar,
    leftEnd,
    rightEnd,
    pattern,
    regex,
    fixed: pattern?.length === 1,
    token
  }
}

function setHandler(token: Set, flags?: string[]): DetailSet {
  const set: (DetailSet | Detailed<Range> | Detailed<Char>)[] = token.set.map((tkn) => addDetail(tkn, flags))
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
    ...detail(token, pattern, flags, Math.min(...set.map((x) => x.minChar)), Math.max(...set.map((x) => x.maxChar)))
  }
}

function repetitionHandler(token: Repetition, flags?: string[]): DetailRepetition {
  const value = addDetail(token.value, flags);
  let pattern: string[] = []
  if (value.pattern && token.max < Infinity) {
    for (let i = token.min; i <= token.max; i += 1) {
      pattern = pattern?.concat(...value.pattern.map((x) => x.repeat(i)));
    }
  }
  return {
    value,
    ...detail(token, pattern, flags, value.minChar * token.min, value.maxChar * token.max)
  }
}

function referenceHandler(token: Reference, flags?: string[], currentStack: Detailed<Token>[] = []) {
  const ref = currentStack[token.value - 1];
  return detail(token, ref.pattern, flags, ref.minChar, ref.maxChar, ref.leftEnd, ref.rightEnd)
}


/**
 * Takes a tokenized expression add adds details to each token
 * according to the 'detailedToken' type
 * @param token Tokenized regular expression
 * @param flags Flags associated with the tokenized expression
 */
export function addDetail(token: Char, flags?: string[], stack?: Detailed<Token>[]): Detailed<Char>;
export function addDetail(token: Position, flags?: string[], stack?: Detailed<Token>[]): Detailed<Position>;
export function addDetail(token: Range, flags?: string[], stack?: Detailed<Token>[]): Detailed<Range>;
export function addDetail(token: Reference, flags?: string[], stack?: Detailed<Token>[]): Detailed<Reference>;
export function addDetail(token: Set, flags?: string[], stack?: Detailed<Token>[]): DetailSet;
export function addDetail(token: Repetition, flags?: string[], stack?: Detailed<Token>[]): DetailRepetition;
export function addDetail(token: Group, flags?: string[], stack?: Detailed<Token>[]): DetailGroup;
export function addDetail(token: Root, flags?: string[], stack?: Detailed<Token>[]): DetailRoot;
export function addDetail(token: Set | Range | Char, flags?: string[], stack?: Detailed<Token>[]): DetailSet | Detailed<Range> | Detailed<Char>;
export function addDetail(token: Token, flags?: string[], stack?: Detailed<Token>[]): DetailToken;
export function addDetail(token: Tokens, flags?: string[], stack?: Detailed<Token>[]): DetailTokens {
  switch (token.type) {
    case types.CHAR: return detail<Char>(token, [String.fromCharCode(token.value)], flags);
    case types.POSITION: return detail<Position>(token, [
      ...stringOptions,
      ...(flags?.includes('i') ? stringOptions : []).map((x) => x.toLowerCase()),
      ...(flags?.includes('i') ? stringOptions : []).map((x) => x.toUpperCase()),
    ], flags, 0, 0, token.value === '^', token.value === '$');
    case types.RANGE: return detail<Range>(token, [], flags);
    case types.SET: return setHandler(token, flags);
    case types.REPETITION: return repetitionHandler(token, flags);
    case types.REFERENCE: return referenceHandler(token, flags, stack);
    case types.GROUP: return groupHandler(token, flags);
    case types.ROOT: return rootHandler(token, flags);
  }
}


function handleStack(oldStack: Token[], flags?: string[]) {
  return oldStack.reduce((t: DetailToken[], token: Token): DetailToken[] => [
    ...t,
    addDetail(token, flags, t),
  ], <DetailToken[]>[]);
}

function groupHandler(token: Group, flags?: string[]): DetailGroup {
  if (token.stack) {
    const stack = handleStack(token.stack, flags)
    let pattern: string[] | undefined = ['']; let i = 0;
    for (const t of stack) {
      pattern = pattern && t.pattern ? R.xprod(pattern, t.pattern).map((x) => x.join('')) : undefined;
      // TODO: See if this was necessayr
      // if (t.token.type === types.GROUP && t.token.remember) {
      //   i += 1; // TODO: Check order
      //   t.reference = i;
      // }
    }
    return {
      stack,
      ...detail(
        token,
        flags,
        pattern,
        R.sum(stack.map((x) => x.minChar)),
        R.sum(stack.map((x) => x.maxChar)),
        stack[0].leftEnd,
        R.last(stack)?.rightEnd ?? false,
      )
    };
  } else if (token.options) {
    const options = token.options.map((option) => handleStack(option, flags));
    return {
      options,
      ...detail(token, flags,
        Math.min(...options.map((stack) => R.sum(stack.map((x) => x.minChar)))),
        Math.max(...options.map((stack) => R.sum(stack.map((x) => x.maxChar)))),
        options.every((stack) => stack[0].leftEnd),
        options.every((stack) => R.last(stack)?.rightEnd ?? false),
      )
    }
  }
  throw new Error('Group and root tokens should contain a stack or options parameter');
}

function rootHandler(token: Root, flags?: string[]): DetailRoot {
  if (token.stack) {
    const stack = handleStack(token.stack, flags)
    return {
      stack,
      ...detail(
        token,
        flags, R.sum(stack.map((x) => x.minChar)),
        R.sum(stack.map((x) => x.maxChar)),
        stack[0].leftEnd,
        R.last(stack)?.rightEnd ?? false,
      )
    };
  } else if (token.options) {
    const options = token.options.map((option) => handleStack(option, flags));
    return {
      options,
      ...detail(token, flags,
        Math.min(...options.map((stack) => R.sum(stack.map((x) => x.minChar)))),
        Math.max(...options.map((stack) => R.sum(stack.map((x) => x.maxChar)))),
        options.every((stack) => stack[0].leftEnd),
        options.every((stack) => R.last(stack)?.rightEnd ?? false),
      )
    }
  }
  throw new Error('Group and root tokens should contain a stack or options parameter');
}
