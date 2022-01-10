import { types as retTypes } from 'ret';
import { types } from '../lib';

it('Should export ret types', () => {
  expect(types).toBe(retTypes);
});
