const test = require('node:test');
const assert = require('node:assert/strict');
const logic = require('./game-logic.js');

test('scoring uses the specified chain multipliers and fever double', () => {
  assert.equal(logic.score(3), 300);
  assert.equal(logic.score(4), 400);
  assert.equal(logic.score(5), 750);
  assert.equal(logic.score(6), 900);
  assert.equal(logic.score(7), 1400);
  assert.equal(logic.score(9), 1800);
  assert.equal(logic.score(10), 3000);
  assert.equal(logic.score(12, true), 7200);
});

test('adjacency includes diagonals but rejects non-neighbors and self-links', () => {
  assert.equal(logic.adjacent(0, 1), true);
  assert.equal(logic.adjacent(0, 7), true);
  assert.equal(logic.adjacent(0, 8), false);
  assert.equal(logic.adjacent(5, 6), false);
  assert.equal(logic.adjacent(10, 10), false);
});

test('move detection accepts connected triples and rejects isolated matches', () => {
  const noMove = Array.from({ length: 36 }, (_, i) => i);
  noMove[0] = noMove[2] = noMove[4] = 0;
  assert.equal(logic.hasMove(noMove), false);
  const diagonal = Array.from({ length: 36 }, (_, i) => i);
  diagonal[0] = diagonal[7] = diagonal[14] = 3;
  assert.equal(logic.hasMove(diagonal), true);
});
