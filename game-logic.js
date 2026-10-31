/* Shared, browser-independent rules used by the game and its unit tests. */
(function (root) {
  'use strict';
  function adjacent(a, b, width = 6) {
    return a !== b && Math.abs(Math.floor(a / width) - Math.floor(b / width)) <= 1 && Math.abs(a % width - b % width) <= 1;
  }
  function multiplier(count) {
    return count >= 10 ? 3 : count >= 7 ? 2 : count >= 5 ? 1.5 : 1;
  }
  function score(count, fever = false) {
    return Math.round(100 * count * multiplier(count) * (fever ? 2 : 1));
  }
  function hasMove(cells, width = 6) {
    const seen = new Set();
    for (let i = 0; i < cells.length; i++) {
      if (seen.has(i)) continue;
      const stack = [i]; seen.add(i); let size = 0;
      while (stack.length) {
        const point = stack.pop(); size++;
        for (let j = 0; j < cells.length; j++) {
          if (!seen.has(j) && cells[j] === cells[i] && adjacent(point, j, width)) {
            seen.add(j); stack.push(j);
          }
        }
      }
      if (size >= 3) return true;
    }
    return false;
  }
  const api = Object.freeze({ adjacent, multiplier, score, hasMove });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.WordChainLogic = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
