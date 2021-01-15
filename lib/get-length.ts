import { Tokens, types } from 'ret';
import { CountRange } from './types';

function handleStack(tokens: Tokens[]) {
  const referencable: CountRange[] = [];
  let min = 0;
  let max = 0;
  for (const token of tokens) {
    const count = token.type === types.REFERENCE
      ? referencable[token.value]
      : getLength(token);
    if (token.type === types.GROUP && token.remember) {
      referencable.push(count);
    }
    min += count.min;
    max += count.max;
  }
  return { min, max };
}

/**
 * Returns the minimum and maximum possible length of
 * the result of a token
 * @param {Tokens} token Tokenized regular expression
 * @return {{ min: number, max: number }} The minimum and maximum
 * possible length of the resultant token
 */
export function getLength(
  token: Tokens,
): CountRange {
  switch (token.type) {
    case types.CHAR:
      return { min: 1, max: 1 };
    case types.POSITION:
      return { min: 0, max: 0 };
    case types.RANGE:
      return { min: 1, max: 1 };
    case types.SET:
      return { min: 1, max: 1 };
    case types.REPETITION: {
      const { min, max } = getLength(token.value);
      return { min: min * token.min, max: max * token.max };
    }
    case types.GROUP:
    case types.ROOT: {
      if (token.options) {
        let tempMin = Infinity;
        let tempMax = 0;
        for (const option of token.options) {
          const { min, max } = handleStack(option);
          tempMin = Math.min(tempMin, min);
          tempMax = Math.max(tempMax, max);
        }
        return { min: tempMin, max: tempMax };
      } if (token.stack) {
        return handleStack(token.stack);
      }
      throw new Error('Group/Root token should contain options or stack');
    }
    default:
      throw new Error(`Invalid token ${token}`);
  }
}
