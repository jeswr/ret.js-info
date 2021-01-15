import * as R from 'ramda';
import {
  tokenizer, reconstruct, Tokens, types,
} from 'ret';
import { detailedTokens } from './types';

/**
 * Tokenizes a regular expression and adds
 * details
 * @param regex Javascript RegExp object
 */
export const regexDetailTokenizer = (regex: RegExp) => addDetail(tokenizer(regex.source));

/**
 * Tokenizes a regular expression and adds
 * details
 * @param str Regular expression
 */
export const detailTokenizer = (str: string) => addDetail(tokenizer(str));

/**
 * Takes a tokenized expression add adds details to each token
 * according to the 'detailedToken' type
 * @param token Tokenized regular expression
 * @param flags Flags associated with the tokenized expression
 */
export function addDetail(
  token: Tokens & { flags?: string[] },
  flags: string[] = (token.flags ??= []),
):detailedTokens {
  const regexString = reconstruct(token);
  const regex = new RegExp(regexString, flags.join(''));
  let min: number = 0;
  let max: number = 0;
  let stringOptions: string[] | undefined = [];
  let stack: detailedTokens[] | undefined;
  let set: detailedTokens[] | undefined;
  let options: detailedTokens[][] | undefined;
  let value: detailedTokens | undefined;
  let leftEnd: boolean = false;
  let rightEnd: boolean = false;

  switch (token.type) {
    case types.CHAR: {
      min = 1;
      max = 1;
      stringOptions = [String.fromCharCode(token.value)];
      break;
    }
    case types.POSITION: // Currently does not handle \b and \B
      leftEnd = token.value === '^';
      rightEnd = token.value === '$';
      min = 0;
      max = 0;
      // TODO: Break this after certain length
      stringOptions = [''];
      break;

    case types.RANGE:
      for (let i = token.from; i <= token.to; i += 1) {
        stringOptions.push(String.fromCharCode(i));
      }
      stringOptions = [
        ...stringOptions,
        ...(flags.includes('i') ? stringOptions : []).map((x) => x.toLowerCase()),
        ...(flags.includes('i') ? stringOptions : []).map((x) => x.toUpperCase()),
      ];
      min = 1;
      max = 1;
      break;

    case types.SET:
      set = token.set.map((token) => addDetail(token, flags));
      if (token.not !== true) {
        stringOptions = set.reduce(
          (t: string[] | undefined, { stringOptions: options }) => ((options && t)
            ? [...t, ...options]
            : undefined),
          [],
        );
      } else {
        stringOptions = undefined; // This can be improved
      }
      min = Math.min(...set.map((x) => x.minChar));
      max = Math.max(...set.map((x) => x.maxChar));
      break;

    case types.REPETITION:
      value = addDetail(token.value, flags);
      min = value.minChar * token.min; max = value.maxChar * token.max;
      if (value.stringOptions && token.max < Infinity) {
        for (let i = token.min; i <= token.max; i += 1) {
          stringOptions = stringOptions?.concat(...value.stringOptions.map((x) => x.repeat(i)));
        }
      }
      break;

    case types.GROUP:
    case types.ROOT:
      if (token.stack) {
        const temp = handleStack(token.stack, flags);
        min = temp.min; max = temp.max; stack = temp.stack; stringOptions = temp.stringOptions;
        leftEnd = temp.leftEnd;
        rightEnd = temp.rightEnd ?? false;
      } else if (token.options) {
        const temp = token.options.map((option) => handleStack(option, flags));
        min = Math.min(...temp.map((x) => x.min));
        max = Math.max(...temp.map((x) => x.max));
        options = temp.map((x) => x.stack);
        for (const t of temp) {
          stringOptions = (stringOptions && t.stringOptions)
            ? [...stringOptions, ...t.stringOptions]
            : undefined;
        }
        leftEnd = temp.every((x) => x.leftEnd);
        rightEnd = temp.every((x) => x.rightEnd);
      }
      break;

    default:
      throw new Error(`Invalid token ${token}`);
  }
  // Have flags for left and right being 'artificially' bounded
  return {
    type: token.type,
    minChar: min,
    maxChar: max,
    regexString,
    stringOptions: stringOptions ? R.uniq(stringOptions).sort() : undefined,
    regex,
    leftEnd,
    rightEnd,
    ...(set ? { set } : {}),
    ...(value ? { value } : {}),
    ...(stack ? { stack } : {}),
    ...(options ? { options } : {}),
    fixed: stringOptions?.length === 1,
    flags,
  } as detailedTokens;
}

export function handleStack(oldStack: Tokens[], flags: string[]) {
  const stack = oldStack.map((token) => addDetail(token, flags));
  const min = R.sum(stack.map((x) => x.minChar));
  const max = R.sum(stack.map((x) => x.maxChar));
  let stringOptions: string[] | undefined = ['']; let i = 0;
  for (const t of stack) {
    stringOptions = stringOptions && t.stringOptions ? R.xprod(stringOptions, t.stringOptions).map((x) => x.join('')) : undefined;
    if (t.type === types.GROUP && t.remember) {
      i += 1; // TODO: Check order
      t.reference = i;
    }
  }
  return {
    stack,
    min,
    max,
    stringOptions,
    leftEnd: stack[0].leftEnd,
    rightEnd: R.last(stack)?.rightEnd ?? false,
  };
}
