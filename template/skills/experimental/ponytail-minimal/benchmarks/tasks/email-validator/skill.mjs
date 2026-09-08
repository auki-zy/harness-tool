// 按 ponytail-minimal 技能实现：一行正则 + 类型/空守卫
export const isEmail = (s) =>
  typeof s === 'string' && s.length > 0 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);
