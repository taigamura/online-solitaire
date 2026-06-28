// Pure game logic: no React, no browser globals.
// Fisher–Yates shuffle, behaviour-preserving extraction of the in-tree logic.
// `rng` is injectable so tests can supply a deterministic stub.

export function shuffle(cards, rng = Math.random) {
  const result = [...cards];
  let currentIndex = result.length;

  while (currentIndex !== 0) {
    const randomIndex = Math.floor(rng() * currentIndex);
    currentIndex--;
    [result[currentIndex], result[randomIndex]] = [result[randomIndex], result[currentIndex]];
  }

  return result;
}
