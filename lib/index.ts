import tokenizer from 'ret';
import { addDetail } from './add-detail';

/**
 * Tokenizes a regular expression and adds
 * details
 * @param str Regular expression
 */
export const detailTokenizer = (str: string, flags?: string[]) => addDetail(tokenizer(str), flags);

/**
 * Tokenizes a regular expression and adds
 * details
 * @param regex Javascript RegExp object
 */
export const regexDetailTokenizer = (regex: RegExp) => detailTokenizer(regex.source, regex.flags.split(''));

export * from './types';
export * from './add-detail';

export { types } from 'ret';
