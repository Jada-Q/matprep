import assert from 'node:assert/strict';
import { computeStreak, isRestDay, parseYmd } from './streak.mjs';

let pass = 0, fail = 0;
function t(name, fn) {
  try { fn(); pass++; console.log(`  ✓ ${name}`); }
  catch (e) { fail++; console.log(`  ✗ ${name}\n     ${e.message}`); }
}
const S = (...keys) => new Set(keys);

// 基准校验：确保我用的日期星期对（2026-06-07 必须是周日）
t('基准: 2026-06-07 是周日(休息日)', () => {
  assert.equal(isRestDay(parseYmd('2026-06-07')), true);
  assert.equal(isRestDay(parseYmd('2026-06-09')), false); // 周二
});

// 1. 空记录 → 0
t('case1 空记录 → 0', () => {
  assert.equal(computeStreak(S(), '2026-06-09'), 0);
});

// 2. 只今天练 → 1
t('case2 只今天练 → 1', () => {
  assert.equal(computeStreak(S('2026-06-09'), '2026-06-09'), 1);
});

// 3. 连续 3 个练习日都练 → 3（06-08一/09二/10三，避开周日）
t('case3 连续3练习日 → 3', () => {
  assert.equal(computeStreak(S('2026-06-08', '2026-06-09', '2026-06-10'), '2026-06-10'), 3);
});

// 4. 休息日不算断：周六练+周一练，周日(休息)无记录 → 2  ← 最易错
t('case4 休息日不断: 周六+周一 → 2', () => {
  assert.equal(computeStreak(S('2026-06-06', '2026-06-08'), '2026-06-08'), 2);
});

// 5. 今天还没练、昨天练了 → 1（今天不算断）
t('case5 今天没练昨天练了 → 1', () => {
  assert.equal(computeStreak(S('2026-06-08'), '2026-06-09'), 1);
});

// 6. 跨周日的更长连续：周五+周六+周一，周日跳过 → 3
t('case6 跨周日连续 周五六+周一 → 3', () => {
  assert.equal(computeStreak(S('2026-06-05', '2026-06-06', '2026-06-08'), '2026-06-08'), 3);
});

// 7. 漏练后断：前天练、昨天该练却漏、今天练 → 只到今天 = 1
t('case7 中间漏练 → 断, 只算今天 = 1', () => {
  // today=06-10(三)练, 06-09(二)漏, 06-08(一)练 → 漏练日断 → 1
  assert.equal(computeStreak(S('2026-06-08', '2026-06-10'), '2026-06-10'), 1);
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
