import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateStockPercentage,
  parseStockInput,
  stockInputValueFromChange,
} from '../src/utils/inventory.ts';

test('stock input keeps the value typed by the user instead of reintroducing zero', () => {
  assert.equal(stockInputValueFromChange('8'), '8');
  assert.equal(stockInputValueFromChange('80'), '80');
  assert.equal(parseStockInput('80'), 80);
});

test('stock percentages use the total stock as the denominator', () => {
  const totalStock = 20 + 80;

  assert.equal(calculateStockPercentage(20, totalStock), 20);
  assert.equal(calculateStockPercentage(80, totalStock), 80);
});

test('stock percentage is zero when there is no stock', () => {
  assert.equal(calculateStockPercentage(0, 0), 0);
});
