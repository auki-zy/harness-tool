// 基线：未用技能的"常规"实现（偏啰嗦）
export function isEmail(s) {
  if (typeof s !== 'string') {
    return false;
  }
  if (s.length === 0) {
    return false;
  }
  const parts = s.split('@');
  if (parts.length !== 2) {
    return false;
  }
  const local = parts[0];
  const domain = parts[1];
  if (local.length === 0) {
    return false;
  }
  if (domain.length === 0) {
    return false;
  }
  if (domain.indexOf('.') === -1) {
    return false;
  }
  const dot = domain.indexOf('.');
  if (dot === 0 || dot === domain.length - 1) {
    return false;
  }
  if (/\s/.test(s)) {
    return false;
  }
  return true;
}
