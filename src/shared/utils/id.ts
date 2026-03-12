export const createId = (prefix: string): string => {
  const seed = Math.random().toString(36).slice(2, 8);
  const time = Date.now().toString(36);
  return `${prefix}_${time}_${seed}`;
};
