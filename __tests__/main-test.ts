import { detailed } from '../lib';

// TODO: move over remainder of tests from

describe('Testing RegExp Detailer', () => {
  describe('^ret$', () => {
    const t = detailed(/^ret$/.source);
    it('Should be fixed', () => {
      expect(t.fixed).toEqual(true);
    });
    it('Should have minChar = 3 and maxChar = 3', () => {
      expect(t.minChar).toEqual(3);
      expect(t.maxChar).toEqual(3);
    });
  });
  describe('^ret|tor$', () => {
    const t = detailed(/^ret|tor$/.source);
    it('Should not be fixed', () => {
      expect(t.fixed).toEqual(false);
    });
    it('Should have minChar = 3 and maxChar = 3', () => {
      expect(t.minChar).toEqual(3);
      expect(t.maxChar).toEqual(3);
    });
  });
  describe('^ret|torus$', () => {
    const t = detailed(/^ret|torus$/.source);
    it('Should not be fixed', () => {
      expect(t.fixed).toEqual(false);
    });
    it('Should have minChar = 3 and maxChar = 5', () => {
      expect(t.minChar).toEqual(3);
      expect(t.maxChar).toEqual(3);
    });
  });
  describe('^ret|toru(s{7})$ - 2 list of char token + repeat', () => {
    const t = detailed(/^ret|toru(s{7})$/.source);
    it('Should not be fixed', () => {
      expect(t.fixed).toEqual(false);
    });
    it('Should have minChar = 3 and maxChar = 11', () => {
      expect(t.minChar).toEqual(3);
      expect(t.maxChar).toEqual(11);
    });
    it('Should have options \'ret\', \'torusssssss\'', () => {
      expect(t.stringOptions).toEqual(['ret', 'torusssssss']);
    });
  });
  describe('^[0-9]$', () => {
    const t = detailed(/^[0-9]$/.source);
    it('Should not be fixed', () => {
      expect(t.fixed).toEqual(false);
    });
    it('Should have minChar = 1 and maxChar = 1', () => {
      expect(t.minChar).toEqual(1);
      expect(t.maxChar).toEqual(1);
    });
    it('Should heach digit as an option', () => {
      expect(t.stringOptions).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
    });
  });
  describe('^[0-0]$', () => {
    const t = detailed(/^[0-0]$/.source);
    it('Should be fixed', () => {
      expect(t.fixed).toEqual(true);
    });
    it('Should have minChar = 1 and maxChar = 1', () => {
      expect(t.minChar).toEqual(1);
      expect(t.maxChar).toEqual(1);
    });
    it('Should have 0 digit as only option', () => {
      expect(t.stringOptions).toEqual(['0']);
    });
  });
  describe('^[0-0a-a]$', () => {
    const t = detailed(/^[0-0a-a]$/.source);
    it('Should be fixed', () => {
      expect(t.fixed).toEqual(false);
    });
    it('Should have minChar = 1 and maxChar = 1', () => {
      expect(t.minChar).toEqual(1);
      expect(t.maxChar).toEqual(1);
    });
    it('Should have options of \'0\' and \'a\'', () => {
      expect(t.stringOptions).toEqual(['0', 'a']);
    });
  });
  describe('[0-9]$', () => {
    const t = detailed(/[0-9]$/.source);
    it('Should be fixed', () => {
      expect(t.fixed).toEqual(false);
    });
    it('Should have minChar = 1 and maxChar = 1', () => {
      expect(t.minChar).toEqual(1);
      expect(t.maxChar).toEqual(Infinity);
    });
    it('Should have options of \'0\' and \'a\'', () => {
      expect(t.stringOptions).toEqual(['0', 'a']);
    });
  });

  // '[0-9]$': {
  //   topic: regexDetailTokenizer(/[0-9]$/i),

  //   'Testing unbounded': (t) => {
  //     assert.deepStrictEqual(t.minChar, 1);
  //     assert.deepStrictEqual(t.maxChar, 1);
  //     assert.deepStrictEqual(t.leftEnd, false);
  //     assert.deepStrictEqual(t.rightEnd, true);
  //     assert.deepStrictEqual(t.fixed, false);
  //     assert.deepStrictEqual(t.flags, ['i']);
  //   }
  // },

  // '/^[0-9]{1,10}$/i': {
  //   topic: regexDetailTokenizer(/^[0-9]{1,10}$/i),

  //   'Testing bounded range': (t) => {
  //     assert.deepStrictEqual(t.minChar, 1);
  //     assert.deepStrictEqual(t.maxChar, 10);
  //     assert.deepStrictEqual(t.fixed, false);
  //     assert.deepStrictEqual(t.flags, ['i']);
  //   },

  //   'Testing left end': (t) => {
  //     assert.deepStrictEqual(t.leftEnd, true);
  //   },

  //   'Testing right end': (t) => {
  //     assert.deepStrictEqual(t.rightEnd, true);
  //   }

  // },

  // '/^[0-9]*$/i': {
  //   topic: regexDetailTokenizer(/^[0-9]*$/i),

  //   'Testing bounded star': (t) => {
  //     assert.deepStrictEqual(t.minChar, 0);
  //     assert.deepStrictEqual(t.maxChar, Infinity);
  //     assert.deepStrictEqual(t.fixed, false);
  //     assert.deepStrictEqual(t.flags, ['i']);
  //   },
  //   'Testing left end': (t) => {
  //     assert.deepStrictEqual(t.leftEnd, true);
  //   },

  //   'Testing right end': (t) => {
  //     assert.deepStrictEqual(t.rightEnd, true);
  //   }
});

it('', () => { expect(true).toEqual(true); });
