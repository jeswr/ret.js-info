# ret-extended
[![GitHub license](https://img.shields.io/github/license/jeswr/ret.js-info.svg)](https://github.com/jeswr/ret.js-info/blob/main/LICENSE)
[![npm version](https://img.shields.io/npm/v/ret-extended.svg)](https://www.npmjs.com/package/ret-extended)
[![build](https://img.shields.io/github/workflow/status/jeswr/ret.js-info/Node.js%20CI)](https://github.com/jeswr/ret.js-info/tree/main/)
[![Dependabot](https://badgen.net/badge/Dependabot/enabled/green?icon=dependabot)](https://dependabot.com/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Overview
This adds details to the tokens produced by the [ret](https://github.com/fent/ret.js) package. Namely it adds the following properties.

For all tokens the following properties are given:
```ts
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
```

In addition, remembered capturing groups are given a `reference` entry which is the value that backreferences should use to refer to that group.

## Usage
```ts
import { regexDetailTokenizer } from '../lib';

regexDetailTokenizer(/a-z/i) // Outputs detailed tokens
```

## License
©2021–present
[Jesse Wright](https://github.com/jeswr),
[MIT License](https://github.com/jeswr/useState/blob/master/LICENSE).
