// MATPREP streak 计算 — 纯函数，可被 node 测试，也内联进 index.html
// 规则：streak = 从今天往回数的连续"达成"天数
//   - 练习日（周一~周六）：有练习记录=达成；该练却没记录=断点
//   - 休息日（周日, getDay()===0）：跳过，不计入也不算断
//   - 今天尚未练：不算断（从昨天起算，给今天留余地）

export function ymd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseYmd(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d); // 本地时区构造，避免 UTC 偏移
}

export function isRestDay(date) {
  return date.getDay() === 0; // 周日休息
}

// practiced: Set<'YYYY-MM-DD'> 或 {'YYYY-MM-DD': true}
export function computeStreak(practiced, todayStr) {
  const has = (k) => (practiced instanceof Set ? practiced.has(k) : !!practiced[k]);
  let count = 0;
  let first = true; // 第一天(今天)：没练不算断
  const d = parseYmd(todayStr);
  for (let i = 0; i < 400; i++) {        // 上限防死循环
    if (isRestDay(d)) {                   // 休息日：跳过，不计不断
      d.setDate(d.getDate() - 1);
      first = false;
      continue;
    }
    if (has(ymd(d))) {
      count++;
    } else if (!first) {
      break;                             // 练习日漏练 → 断
    }                                    // first 且没练 → 今天还没练，继续往回
    first = false;
    d.setDate(d.getDate() - 1);
  }
  return count;
}
