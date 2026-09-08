// 基线：常规实现（循环 + 显式分支）
export function csvSum(input) {
  if (typeof input !== 'string') {
    return 0;
  }
  let total = 0;
  const lines = input.split('\n');
  for (const line of lines) {
    if (line.length === 0) {
      continue;
    }
    const cells = line.split(',');
    for (const cell of cells) {
      const t = cell.trim();
      if (t.length === 0) {
        continue;
      }
      const n = Number(t);
      if (Number.isNaN(n)) {
        continue;
      }
      total += n;
    }
  }
  return total;
}
