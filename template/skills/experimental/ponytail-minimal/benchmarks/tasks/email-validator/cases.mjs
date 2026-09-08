// 固定用例（期望值由需求推导）
export const cases = [
  ['', false],
  ['a@b', false],
  ['a@b.c', true],
  ['a@b.c.d', true],
  ['@b.c', false],
  ['a@.c', false],
  ['a@c.', false],
  ['a b@c.d', false],
  ['a@@c.d', false],
  ['a@b..c', true],
  [null, false],
  [123, false],
];
