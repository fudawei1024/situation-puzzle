import type { Card } from '../types';

/** 要素子类 + 动作子类 → 组合问句模板 */
export const COMBO_TEMPLATES: Record<string, string[]> = {
  // 人物 × 动作
  'person+relation': [
    '{element}和其他人认识吗？',
    '{element}与案件中的人有什么关系？',
    '{element}的人际关系是破案关键吗？',
  ],
  'person+behavior': [
    '{element}做了什么不寻常的事？',
    '{element}的行为有什么特别之处？',
    '{element}在案发前后有反常举动吗？',
  ],
  'person+motive': [
    '{element}的动机是什么？',
    '有人因{element}而犯罪吗？',
    '{element}与作案动机有关吗？',
  ],
  'person+state': [
    '{element}的死因或状态能确定吗？',
    '{element}的心理状态与案件有关吗？',
    '关于{element}有人隐瞒或说谎了吗？',
  ],

  // 地点 × 动作
  'location+relation': [
    '{element}与案件中的人有地理上的关联吗？',
    '有人因{element}而结识或反目吗？',
    '{element}是某人经常出没的地方吗？',
  ],
  'location+behavior': [
    '{element}发生了什么关键事件？',
    '有人在{element}做过什么？',
    '{element}有被蓄意布置或破坏过吗？',
  ],
  'location+motive': [
    '选择{element}与作案动机有关吗？',
    '{element}背后有利益或情感纠葛吗？',
    '有人刻意利用{element}达成目的吗？',
  ],
  'location+state': [
    '{element}的状态能说明什么？',
    '{element}与死亡方式或死因有关吗？',
    '关于{element}的描述是否真实？',
  ],

  // 物品 × 动作
  'item+relation': [
    '{element}属于谁？',
    '{element}能证明人与人之间的关系吗？',
    '谁接触过{element}？',
  ],
  'item+behavior': [
    '{element}被怎样使用过？',
    '有人对{element}做过手脚吗？',
    '{element}在案件中起到了什么作用？',
  ],
  'item+motive': [
    '{element}与作案动机有关吗？',
    '有人为得到或隐藏{element}而犯罪吗？',
    '{element}背后涉及利益纠纷吗？',
  ],
  'item+state': [
    '{element}能揭示死因或死亡方式吗？',
    '{element}的状态说明了什么？',
    '关于{element}的信息是否被篡改过？',
  ],

  // 时间 × 动作
  'time+relation': [
    '{element}谁在场？',
    '{element}人与人的关系有变化吗？',
    '{element}是否有人相遇或分别？',
  ],
  'time+behavior': [
    '{element}发生了什么？',
    '{element}有谁做了什么？',
    '{element}的关键行为是什么？',
  ],
  'time+motive': [
    '{element}的动机是什么？',
    '{element}有人因利益或情感而行动吗？',
    '{element}与作案动机有直接联系吗？',
  ],
  'time+state': [
    '{element}死者处于什么状态？',
    '{element}是否有人说了谎或精神失常？',
    '{element}能确定死因或死亡方式吗？',
  ],
};

function fillElement(template: string, elementName: string): string {
  return template.replace(/\{element\}/g, elementName);
}

function resolveComboKey(elementCard: Card, actionCard: Card): string | undefined {
  if (elementCard.category !== 'element' || actionCard.category !== 'action') {
    return undefined;
  }
  return `${elementCard.subtype}+${actionCard.subtype}`;
}

/**
 * 根据要素卡（及可选动作卡）生成 2–3 条自然中文问句。
 * 仅要素卡时返回其默认模板；组合时优先使用 COMBO_TEMPLATES，否则回退到动作卡模板。
 */
export function generateQuestions(
  elementCard: Card,
  actionCard?: Card
): string[] {
  if (!actionCard || elementCard.category === 'special' || actionCard.category === 'special') {
    return [...elementCard.questionTemplates];
  }

  const comboKey = resolveComboKey(elementCard, actionCard);
  if (comboKey) {
    const combo = COMBO_TEMPLATES[comboKey];
    if (combo && combo.length > 0) {
      return combo.map((t) => fillElement(t, elementCard.name));
    }
  }

  if (actionCard.questionTemplates.length > 0) {
    return actionCard.questionTemplates.map((t) => fillElement(t, elementCard.name));
  }

  return elementCard.questionTemplates.map((t) => fillElement(t, elementCard.name));
}
