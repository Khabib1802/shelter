/**
 * @template T
 * @param {T[]} array
 * @returns {T[]}
 */
const shuffleArray = (array) => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * @template T
 * @param {T[]} items
 * @param {number} totalCount
 * @returns {T[]}
 */
const buildExtendedArray = (items, totalCount) => {
  if (!items.length) return [];

  const result = [];
  for (let i = 0; i < totalCount; i++) {
    result.push(items[i % items.length]);
  }

  return result;
};

export { shuffleArray, buildExtendedArray };
