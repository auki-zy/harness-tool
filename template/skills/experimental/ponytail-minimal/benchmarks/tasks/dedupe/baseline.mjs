// 基线：循环 + indexOf
export function dedupe(arr) {
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    let found = false;
    for (let j = 0; j < out.length; j++) {
      if (out[j] === item) {
        found = true;
        break;
      }
    }
    if (!found) {
      out.push(item);
    }
  }
  return out;
}
