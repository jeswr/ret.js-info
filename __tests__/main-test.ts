/* eslint-disable no-control-regex */
import { types } from 'ret';
import { addDetail, detailTokenizer, regexDetailTokenizer } from '../lib';

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
  describe('^(ret|tor)$', () => {
    const t = detailTokenizer(/^(ret|tor)$/.source);
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
      expect(t.pattern).toEqual(['ret', 'torusssssss']);
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
      expect(t.pattern).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
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
      expect(t.pattern).toEqual(['0']);
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
      expect(t.pattern).toEqual(['0', 'a']);
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
      expect(t.pattern).toEqual(['0', 'A', 'a']);
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
      expect(t.pattern).toEqual(['0', 'A', 'a']);
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
  // describe('(<(\\w+)>\\w*<\\2>)\\1', () => {
  //   const t = detailTokenizer(/(<(\w+)>\w*<\2>)\1/.source);
  //   it('Should not be fixed', () => {
  //     expect(t.fixed).toEqual(false);
  //   });
  //   it('Should have minChar = 12 and maxChar = Infinity', () => {
  //     expect(t.minChar).toEqual(12);
  //     expect(t.maxChar).toEqual(Infinity);
  //   });
  //   it('Should have right end and left end', () => {
  //     expect(t.leftEnd).toEqual(false);
  //     expect(t.rightEnd).toEqual(false);
  //   });
  // });
  // describe('(<([a-z]+)>\\w*<\\2>)\\1', () => {
  //   const t = detailTokenizer(/(<([a-z]+)>\w*<\2>)\1/.source);
  //   it('Should not be fixed', () => {
  //     expect(t.fixed).toEqual(false);
  //   });
  //   it('Should have minChar = 12 and maxChar = Infinity', () => {
  //     expect(t.maxChar).toEqual(Infinity);
  //   });
  //   it('Should have right end and left end', () => {
  //     expect(t.leftEnd).toEqual(false);
  //     expect(t.rightEnd).toEqual(false);
  //   });
  // });
  // describe('(<([a-z]+)>\\w*<\\2>)\\1(a)', () => {
  //   const t = detailTokenizer(/(<([a-z]+)>\w*<\2>)\1(a)/.source);
  //   it('Should not be fixed', () => {
  //     expect(t.fixed).toEqual(false);
  //   });
  //   it('Should have minChar = 12 and maxChar = Infinity', () => {
  //     expect(t.minChar).toEqual(13);
  //     expect(t.maxChar).toEqual(Infinity);
  //   });
  //   it('Should have right end and left end', () => {
  //     expect(t.leftEnd).toEqual(false);
  //     expect(t.rightEnd).toEqual(false);
  //   });
  // });
  describe('hey (there)', () => {
    const t = detailTokenizer(/hey (there)/.source);
    it('Should be fixed', () => {
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
  });
  describe('(hey (there))|(hey (ho))', () => {
    const t = detailTokenizer(/(hey (there))|(hey (ho))/.source);
    it('Should not be fixed', () => {
      expect(t.fixed).toEqual(false);
    });
    it('Should have minChar = 6 and maxChar = 9', () => {
      expect(t.minChar).toEqual(6);
      expect(t.maxChar).toEqual(9);
    });
    it('Should have right end and left end', () => {
      expect(t.leftEnd).toEqual(false);
      expect(t.rightEnd).toEqual(false);
    });
    it('Should have two options', () => {
      expect(t.pattern?.length).toEqual(2);
      expect(t.pattern).toEqual(['hey there', 'hey ho']);
    });
  });
  describe('[a-b]{2}/i', () => {
    const t = detailTokenizer(/[a-b]{2}/i.source, ['i']);
    it('Should not be fixed', () => {
      expect(t.fixed).toEqual(false);
    });
    it('Should have minChar = 2 and maxChar = 2', () => {
      expect(t.minChar).toEqual(2);
      expect(t.maxChar).toEqual(2);
    });
    it('Should have right end and left end', () => {
      expect(t.leftEnd).toEqual(false);
      expect(t.rightEnd).toEqual(false);
    });
    it('Should have 16 options', () => {
      expect(t.pattern?.length).toEqual(16);
      expect(t.pattern).toEqual([
        'AA', 'Aa', 'AB', 'Ab',
        'aA', 'aa', 'aB', 'ab',
        'BA', 'Ba', 'BB', 'Bb',
        'bA', 'ba', 'bB', 'bb',
      ]);
    });
  });
  describe('[a-b]{2,10}/i', () => {
    const t = detailTokenizer(/[a-b]{2,10}/i.source, ['i']);
    it('Should not be fixed', () => {
      expect(t.fixed).toEqual(false);
    });
    it('Should have minChar = 2 and maxChar = 2', () => {
      expect(t.minChar).toEqual(2);
      expect(t.maxChar).toEqual(10);
    });
    it('Should have right end and left end', () => {
      expect(t.leftEnd).toEqual(false);
      expect(t.rightEnd).toEqual(false);
    });
    it('Should have have options undefined when too long options', () => {
      expect(t.pattern).toEqual(undefined);
    });
  });
  describe('[\\x00-\\x96]', () => {
    const t = detailTokenizer(/[\x00-\x96]/.source);
    it('Should not be fixed', () => {
      expect(t.fixed).toEqual(false);
    });
    it('Should have minChar = 1 and maxChar = 1', () => {
      expect(t.minChar).toEqual(1);
      expect(t.maxChar).toEqual(1);
    });
    it('Should have right end and left end', () => {
      expect(t.leftEnd).toEqual(false);
      expect(t.rightEnd).toEqual(false);
    });
    it('Should have have options undefined when too long options', () => {
      expect(t.pattern).toEqual(undefined);
    });
  });
  describe('[\\x00-\\x96]|[\\x00-\\x96]', () => {
    const t = detailTokenizer(/[\x00-\x96]|[\x00-\x96]/.source);
    it('Should not be fixed', () => {
      expect(t.fixed).toEqual(false);
    });
    it('Should have minChar = 1 and maxChar = 1', () => {
      expect(t.minChar).toEqual(1);
      expect(t.maxChar).toEqual(1);
    });
    it('Should have right end and left end', () => {
      expect(t.leftEnd).toEqual(false);
      expect(t.rightEnd).toEqual(false);
    });
    it('Should have have options undefined when too long options', () => {
      expect(t.pattern).toEqual(undefined);
    });
  });
  describe('([\\x00-\\x96]|[\\x00-\\x96])|([\\x00-\\x96]|[\\x00-\\x96])', () => {
    const t = detailTokenizer(/([\x00-\x96]|[\x00-\x96])|([\x00-\x96]|[\x00-\x96])/.source);
    it('Should not be fixed', () => {
      expect(t.fixed).toEqual(false);
    });
    it('Should have minChar = 1 and maxChar = 1', () => {
      expect(t.minChar).toEqual(1);
      expect(t.maxChar).toEqual(1);
    });
    it('Should have right end and left end', () => {
      expect(t.leftEnd).toEqual(false);
      expect(t.rightEnd).toEqual(false);
    });
    it('Should have have options undefined when too long options', () => {
      expect(t.pattern).toEqual(undefined);
    });
  });
  describe('(?:[\\x00-\\x96]|[\\x00-\\x96])|([\\x00-\\x96]|[\\x00-\\x96])', () => {
    const t = detailTokenizer(/(?:[\x00-\x96]|[\x00-\x96])|([\x00-\x96]|[\x00-\x96])/.source);
    it('Should not be fixed', () => {
      expect(t.fixed).toEqual(false);
    });
    it('Should have minChar = 1 and maxChar = 1', () => {
      expect(t.minChar).toEqual(1);
      expect(t.maxChar).toEqual(1);
    });
    it('Should have right end and left end', () => {
      expect(t.leftEnd).toEqual(false);
      expect(t.rightEnd).toEqual(false);
    });
    it('Should have have options undefined when too long options', () => {
      expect(t.pattern).toEqual(undefined);
    });
  });
  describe('((?:a))', () => {
    const t = detailTokenizer(/((?:a))/.source);
    it('Should not be fixed', () => {
      expect(t.fixed).toEqual(true);
    });
    it('Should have minChar = 1 and maxChar = 1', () => {
      expect(t.minChar).toEqual(1);
      expect(t.maxChar).toEqual(1);
    });
    it('Should have right end and left end', () => {
      expect(t.leftEnd).toEqual(false);
      expect(t.rightEnd).toEqual(false);
    });
    it('Should have have options undefined when too long options', () => {
      expect(t.pattern).toEqual(['a']);
    });
  });
  describe('(?:a)', () => {
    const t = detailTokenizer(/(?:a)/.source);
    it('Should not be fixed', () => {
      expect(t.fixed).toEqual(true);
    });
    it('Should have minChar = 1 and maxChar = 1', () => {
      expect(t.minChar).toEqual(1);
      expect(t.maxChar).toEqual(1);
    });
    it('Should have right end and left end', () => {
      expect(t.leftEnd).toEqual(false);
      expect(t.rightEnd).toEqual(false);
    });
    it('Should have have options undefined when too long options', () => {
      expect(t.pattern).toEqual(['a']);
    });
  });
});

it('Regex detail tokenizer is working correctly', () => {
  for (const r of [/[0-9]*$/i, /^ret$/, /^ret|tor$/, /^ret|torus$/, /^[0-9]{1,10}$/]) {
    expect(regexDetailTokenizer(r)).toEqual(detailTokenizer(r.source, r.flags.split('')));
  }
});

it('Should handle errors', () => {
  expect(() => {
    addDetail({
      type: types.ROOT,
    });
  }).toThrowError('Group and root tokens should contain a stack or options parameter');
  expect(() => {
    addDetail({
      type: types.GROUP,
      remember: false,
    });
  }).toThrowError('Group and root tokens should contain a stack or options parameter');
  expect(() => {
    regexDetailTokenizer(/(a)\5/);
  }).toThrowError('Could not find reference');
});
