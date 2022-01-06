import { DetailGroup, DetailRepetition, DetailRoot, DetailSet, DetailToken, DetailTokens, Detailed } from './types'
import { Char, Position, Set, types, Tokens, Range, Repetition, Reference, Group, Root, reconstruct, Token, SetTokens } from 'ret';
import genex from 'genex'
import * as R from 'ramda';

function detail<T extends Tokens>(token: T, flags: string[], minChar: number = 1, maxChar: number = 1, leftEnd: boolean = false, rightEnd: boolean = false): Detailed<T> {
  const regex = new RegExp(reconstruct(token), flags.join(''));
  const pattern = genex(regex);
  return {
    minChar,
    maxChar,
    leftEnd,
    rightEnd,
    pattern,
    regex,
    fixed: pattern.count() === 1,
    token
  }
}

function setHandler(token: Set, flags: string[]): DetailSet {
  const set: (DetailSet | Detailed<Range> | Detailed<Char>)[] = token.set.map((tkn) => addDetail(tkn, flags))
  return {
    set,
    ...detail(token, flags, Math.min(...set.map((x) => x.minChar)), Math.max(...set.map((x) => x.maxChar)))
  }
}

function repetitionHandler(token: Repetition, flags: string[]): DetailRepetition {
  const value = addDetail(token.value, flags);
  return {
    value,
    ...detail(token, flags, value.minChar * token.min, value.maxChar * token.max)
  }
}

function referenceHandler(token: Reference, flags: string[], currentStack: Detailed<Token>[] = []) {
  const ref = currentStack[token.value - 1];
  return detail(token, flags, ref.minChar, ref.maxChar, ref.leftEnd, ref.rightEnd)
}

export function addDetail(token: Char, flags: string[], stack?: Detailed<Token>[]): Detailed<Char>;
export function addDetail(token: Position, flags: string[], stack?: Detailed<Token>[]): Detailed<Position>;
export function addDetail(token: Range, flags: string[], stack?: Detailed<Token>[]): Detailed<Range>;
export function addDetail(token: Reference, flags: string[], stack?: Detailed<Token>[]): Detailed<Reference>;
export function addDetail(token: Set, flags: string[], stack?: Detailed<Token>[]): DetailSet;
export function addDetail(token: Repetition, flags: string[], stack?: Detailed<Token>[]): DetailRepetition;
export function addDetail(token: Group, flags: string[], stack?: Detailed<Token>[]): DetailGroup;
export function addDetail(token: Root, flags: string[], stack?: Detailed<Token>[]): DetailRoot;
export function addDetail(token: Set | Range | Char, flags: string[], stack?: Detailed<Token>[]): DetailSet | Detailed<Range> | Detailed<Char>;
export function addDetail(token: Token, flags: string[], stack?: Detailed<Token>[]): DetailToken;
export function addDetail<T extends Tokens>(token: T, flags: string[], stack?: Detailed<Token>[]): DetailTokens {
  switch (token.type) {
    case types.CHAR: return detail<Char>(token, flags);
    case types.POSITION: return detail<Position>(token, flags, 0, 0, token.value === '^', token.value === '$');
    case types.RANGE: return detail<Range>(token, flags);
    case types.SET: return setHandler(token, flags);
    case types.REPETITION: return repetitionHandler(token, flags);
    case types.REFERENCE: return referenceHandler(token, flags, stack);
    case types.GROUP: return groupHandler(token, flags);
    case types.ROOT: return rootHandler(token, flags);
  }
}


function handleStack(oldStack: Token[], flags: string[]) {
  return oldStack.reduce((t: DetailToken[], token: Token): DetailToken[] => [
    ...t,
    addDetail(token, flags, t),
  ], <DetailToken[]>[]);
}

function groupHandler(token: Group, flags: string[]): DetailGroup {
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

function rootHandler(token: Root, flags: string[]): DetailRoot {
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
