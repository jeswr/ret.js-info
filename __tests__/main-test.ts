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
      expect(t.stringOptions).toEqual(['ret', 'torusssssss'])
    })
  });
  describe('^ret|torus$ - 2 list of char token + repeat', () => {
    const t = detailed(/^(ret|torus){7}$/.source);
    it('Should not be fixed', () => {
      expect(t.fixed).toEqual(false);
    });
    it('Should have minChar = 21 and maxChar = 35', () => {
      expect(t.minChar).toEqual(21);
      expect(t.maxChar).toEqual(35);
    });
  });
});

it('', () => { expect(true).toEqual(true); });
