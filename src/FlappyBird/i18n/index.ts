// Lightweight i18n for Flappy Bird — no external library needed.
// Supports 'zh' (Chinese) and 'en' (English). Falls back to 'en'.

const translations = {
  zh: {
    subtitle: '🐦 飞 行 冒 险 🐦',
    selectChar: '选择角色',
    rule1: '👆 点击屏幕拍翅飞行',
    rule2: '🔰 穿过管道得 1 分',
    rule3: '⭐ 吃角色道具加 3 分',
    rule4: '👻 碰到幽灵扣 5 分',
    highRecord: '🏆 最高纪录: {n}',
    startBtn: '开始飞行!',
    scoreLabel: '得分',
    bestLabel: '最高',
    'medal.legend': '传奇',
    'medal.gold': '金牌',
    'medal.silver': '银牌',
    'medal.bronze': '铜牌',
    replayBtn: '再来一次',
    homeBtn: '返回首页',
    hudBest: 'Best: ',
    tapHint: 'Tap!',
    'char.guitarist.name': '吉他少年',
    'char.guitarist.desc': '均衡型',
    'char.coder.name': '咖啡女孩',
    'char.coder.desc': '轻飘型·简单',
    'char.hacker.name': '眼镜大叔',
    'char.hacker.desc': '重力型·困难',
    'char.ghost.name': '调皮幽灵',
    'char.ghost.desc': '灵动型·简单',
  },
  en: {
    subtitle: '🐦 Flying Adventure 🐦',
    selectChar: 'Choose Character',
    rule1: '👆 Tap to flap',
    rule2: '🔰 Pass pipes for 1 pt',
    rule3: '⭐ Grab bonus for 3 pts',
    rule4: '👻 Hit ghost –5 pts',
    highRecord: '🏆 Best: {n}',
    startBtn: 'Start!',
    scoreLabel: 'Score',
    bestLabel: 'Best',
    'medal.legend': 'Legend',
    'medal.gold': 'Gold',
    'medal.silver': 'Silver',
    'medal.bronze': 'Bronze',
    replayBtn: 'Play Again',
    homeBtn: 'Home',
    hudBest: 'Best: ',
    tapHint: 'Tap!',
    'char.guitarist.name': 'Guitar Boy',
    'char.guitarist.desc': 'Balanced',
    'char.coder.name': 'Coffee Girl',
    'char.coder.desc': 'Light · Easy',
    'char.hacker.name': 'Hacker Dude',
    'char.hacker.desc': 'Heavy · Hard',
    'char.ghost.name': 'Cheeky Ghost',
    'char.ghost.desc': 'Agile · Easy',
  },
} as const;

type Locale = keyof typeof translations;

function detectLocale(): Locale {
  const override = typeof localStorage !== 'undefined' ? localStorage.getItem('fb_locale') : null;
  if (override === 'en' || override === 'zh') return override;
  const lang = (typeof navigator !== 'undefined' ? navigator.language : 'en').toLowerCase();
  if (lang.startsWith('zh')) return 'zh';
  return 'en';
}

const locale = detectLocale();

/** Translate a key, optionally replacing {n} with a value. */
export function t(key: string, vars?: { n?: number | string }): string {
  const dict = translations[locale] as Record<string, string>;
  let str = dict[key] ?? (translations.en as Record<string, string>)[key] ?? key;
  if (vars?.n !== undefined) {
    str = str.replace('{n}', String(vars.n));
  }
  return str;
}

/** React hook — returns t() bound to the detected locale. */
export function useLocale() {
  return { t, locale };
}
