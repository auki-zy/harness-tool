// 按 ponytail-minimal：拆分后 reduce 求和（空串/NaN 自然计 0）
export const csvSum = (input) =>
  typeof input === 'string'
    ? input.split(/[,\n]+/).reduce((acc, t) => acc + (Number(t) || 0), 0)
    : 0;
