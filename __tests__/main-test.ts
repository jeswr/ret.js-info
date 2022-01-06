import { detailTokenizer, regexDetailTokenizer } from '../lib';

// TODO: move over remainder of tests from

describe('Testing RegExp Detailer', () => {
  describe('^ret$', () => {
    const t = detailTokenizer(/^ret$/.source);
    it('Should be fixed', () => {
      expect(t.fixed).toEqual(true);
    });
    it('Should have minChar = 3 and maxChar = 3', () => {
      expect(t.minChar).toEqual(3);
      expect(t.maxChar).toEqual(3);
    });
  });
  describe('^ret|tor$', () => {
    const t = detailTokenizer(/^ret|tor$/.source);
    it('Should not be fixed', () => {
      expect(t.fixed).toEqual(false);
    });
    it('Should have minChar = 3 and maxChar = 3', () => {
      expect(t.minChar).toEqual(3);
      expect(t.maxChar).toEqual(3);
    });
  });
  describe('^ret|torus$', () => {
    const t = detailTokenizer(/^ret|torus$/.source);
    it('Should not be fixed', () => {
      expect(t.fixed).toEqual(false);
    });
    it('Should have minChar = 3 and maxChar = 5', () => {
      expect(t.minChar).toEqual(3);
      expect(t.maxChar).toEqual(5);
    });
  });
  describe('^ret|toru(s{7})$ - 2 list of char token + repeat', () => {
    const t = detailTokenizer(/^ret|toru(s{7})$/.source);
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
    const t = detailTokenizer(/^[0-9]$/.source);
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
    const t = detailTokenizer(/^[0-0]$/.source);
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
    const t = detailTokenizer(/^[0-0a-a]$/.source);
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
  describe('^[0-0a-a]$/i', () => {
    const t = detailTokenizer(/^[0-0a-a]$/i.source, ['i']);
    it('Should be fixed', () => {
      expect(t.fixed).toEqual(false);
    });
    it('Should have minChar = 1 and maxChar = 1', () => {
      expect(t.minChar).toEqual(1);
      expect(t.maxChar).toEqual(1);
    });
    it('Should have options of \'0\', \'a\' and \'A\'', () => {
      expect(t.stringOptions).toEqual(['0', 'A', 'a']);
    });
  });
  describe('^[0-0A-A]$/i', () => {
    const t = detailTokenizer(/^[0-0A-A]$/i.source, ['i']);
    it('Should be fixed', () => {
      expect(t.fixed).toEqual(false);
    });
    it('Should have minChar = 1 and maxChar = 1', () => {
      expect(t.minChar).toEqual(1);
      expect(t.maxChar).toEqual(1);
    });
    it('Should have options of \'0\', \'a\' and \'A\'', () => {
      expect(t.stringOptions).toEqual(['0', 'A', 'a']);
    });
  });
  describe('[0-9]+$/i', () => {
    const t = detailTokenizer(/[0-9]+$/i.source);
    it('Should not be fixed', () => {
      expect(t.fixed).toEqual(false);
    });
    it('Should have minChar = 1 and maxChar = Infinity', () => {
      expect(t.minChar).toEqual(1);
      expect(t.maxChar).toEqual(Infinity);
    });
    it('Should have right end but not left end', () => {
      expect(t.leftEnd).toEqual(false);
      expect(t.rightEnd).toEqual(true);
    });
  });
  describe('/^[0-9]{1,10}$/i', () => {
    const t = detailTokenizer(/^[0-9]{1,10}$/i.source);
    it('Should not be fixed', () => {
      expect(t.fixed).toEqual(false);
    });
    it('Should have minChar = 1 and maxChar = 10', () => {
      expect(t.minChar).toEqual(1);
      expect(t.maxChar).toEqual(10);
    });
    it('Should have right end and left end', () => {
      expect(t.leftEnd).toEqual(true);
      expect(t.rightEnd).toEqual(true);
    });
  });
  describe('[0-9]*$/i', () => {
    const t = detailTokenizer(/[0-9]*$/i.source);
    it('Should not be fixed', () => {
      expect(t.fixed).toEqual(false);
    });
    it('Should have minChar = 0 and maxChar = Infinity', () => {
      expect(t.minChar).toEqual(0);
      expect(t.maxChar).toEqual(Infinity);
    });
    it('Should have right end but not left end', () => {
      expect(t.leftEnd).toEqual(false);
      expect(t.rightEnd).toEqual(true);
    });
  });
  describe('[^0]$/', () => {
    const t = detailTokenizer(/[^0-9]*$/.source);
    it('Should not be fixed', () => {
      expect(t.fixed).toEqual(false);
    });
    it('Should have minChar = 1 and maxChar = 1', () => {
      expect(t.minChar).toEqual(0);
      expect(t.maxChar).toEqual(Infinity);
    });
    it('Should have right end but not left end', () => {
      expect(t.leftEnd).toEqual(false);
      expect(t.rightEnd).toEqual(true);
    });
  });
  describe('^[^0]$/', () => {
    const t = detailTokenizer(/^[^0]$/.source);
    it('Should not be fixed', () => {
      expect(t.fixed).toEqual(false);
    });
    it('Should have minChar = 1 and maxChar = 1', () => {
      expect(t.minChar).toEqual(1);
      expect(t.maxChar).toEqual(1);
    });
    it('Should have right end and left end', () => {
      expect(t.leftEnd).toEqual(true);
      expect(t.rightEnd).toEqual(true);
    });
  });
  describe('^[^0-9]$/', () => {
    const t = detailTokenizer(/^[^0-9]$/.source);
    it('Should not be fixed', () => {
      expect(t.fixed).toEqual(false);
    });
    it('Should have minChar = 1 and maxChar = 1', () => {
      expect(t.minChar).toEqual(1);
      expect(t.maxChar).toEqual(1);
    });
    it('Should have right end and left end', () => {
      expect(t.leftEnd).toEqual(true);
      expect(t.rightEnd).toEqual(true);
    });
  });
  describe('^[^0-9]{1,10}$/', () => {
    const t = detailTokenizer(/^[^0-9]{1,10}$/.source);
    it('Should not be fixed', () => {
      expect(t.fixed).toEqual(false);
    });
    it('Should have minChar = 1 and maxChar = 10', () => {
      expect(t.minChar).toEqual(1);
      expect(t.maxChar).toEqual(10);
    });
    it('Should have right end and left end', () => {
      expect(t.leftEnd).toEqual(true);
      expect(t.rightEnd).toEqual(true);
    });
  });
  describe('[^0-9]{1,10}$/', () => {
    const t = detailTokenizer(/[^0-9]{1,10}$/.source);
    it('Should not be fixed', () => {
      expect(t.fixed).toEqual(false);
    });
    it('Should have minChar = 1 and maxChar = 10', () => {
      expect(t.minChar).toEqual(1);
      expect(t.maxChar).toEqual(10);
    });
    it('Should have right end and left end', () => {
      expect(t.leftEnd).toEqual(false);
      expect(t.rightEnd).toEqual(true);
    });
  });
  describe('<(\\w+)>\\w*<\\1>', () => {
    const t = detailTokenizer(/<(\w+)>\w*<\1>/.source);
    it('Should not be fixed', () => {
      expect(t.fixed).toEqual(false);
    });
    it('Should have minChar = 6 and maxChar = Infinity', () => {
      expect(t.minChar).toEqual(6);
      expect(t.maxChar).toEqual(Infinity);
    });
    it('Should have right end and left end', () => {
      expect(t.leftEnd).toEqual(false);
      expect(t.rightEnd).toEqual(false);
    });
  });
  describe('(<(\\w+)>\\w*<\\1>)\\1', () => {
    const t = detailTokenizer(/(<(\w+)>\w*<\1>)\1/.source);
    it('Should not be fixed', () => {
      expect(t.fixed).toEqual(false);
    });
    it('Should have minChar = 12 and maxChar = Infinity', () => {
      expect(t.minChar).toEqual(12);
      expect(t.maxChar).toEqual(Infinity);
    });
    it('Should have right end and left end', () => {
      expect(t.leftEnd).toEqual(false);
      expect(t.rightEnd).toEqual(false);
    });
  });
  describe('(<([a-z]+)>\\w*<\\1>)\\1', () => {
    const t = detailTokenizer(/(<([a-z]+)>\w*<\1>)\1/.source);
    it('Should not be fixed', () => {
      expect(t.fixed).toEqual(false);
    });
    it('Should have minChar = 12 and maxChar = Infinity', () => {
      expect(t.minChar).toEqual(12);
      expect(t.maxChar).toEqual(Infinity);
    });
    it('Should have right end and left end', () => {
      expect(t.leftEnd).toEqual(false);
      expect(t.rightEnd).toEqual(false);
    });
  });
  describe('(<([a-z]+)>\\w*<\\1>)\\1(a)', () => {
    const t = detailTokenizer(/(<([a-z]+)>\w*<\1>)\1(a)/.source);
    it('Should not be fixed', () => {
      expect(t.fixed).toEqual(false);
    });
    it('Should have minChar = 12 and maxChar = Infinity', () => {
      expect(t.minChar).toEqual(13);
      expect(t.maxChar).toEqual(Infinity);
    });
    it('Should have right end and left end', () => {
      expect(t.leftEnd).toEqual(false);
      expect(t.rightEnd).toEqual(false);
    });
  });
  describe('hey (there)', () => {
    const t = detailTokenizer(/hey (there)/.source);
    it('Should not be fixed', () => {
      expect(t.fixed).toEqual(true);
    });
    it('Should have minChar = 9 and maxChar = 9', () => {
      expect(t.minChar).toEqual(9);
      expect(t.maxChar).toEqual(9);
    });
    it('Should have right end and left end', () => {
      expect(t.leftEnd).toEqual(false);
      expect(t.rightEnd).toEqual(false);
    });
    console.log(t);
  });
});

it('Regex detail tokenizer is working correctly', () => {
  for (const r of [/[0-9]*$/i, /^ret$/, /^ret|tor$/, /^ret|torus$/, /^[0-9]{1,10}$/]) {
    expect(regexDetailTokenizer(r)).toEqual(detailTokenizer(r.source, r.flags.split('')));
  }
});
