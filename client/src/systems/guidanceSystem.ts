import type { Card } from '../types/index.ts';
import { getCardHint } from './hintSystem.ts';
import { ALL_CARDS } from '../data/cards.ts';

export interface GuidanceAction {
  type: 'hint_message' | 'highlight_card' | 'repeat_warning';
  message?: string;
  cardId?: string;
}

const HINT_MESSAGES_STREAK_3: string[] = [
  '侦探，这条路似乎走不通。试试换个角度——人物关系或案发时间往往藏着关键。',
  '别灰心！海龟汤的精髓在于排除法。关注一下地点或物品相关的卡牌吧。',
  '主持人悄悄提示：有时「为什么」和「行为」类卡牌能打开新局面。',
];

const HINT_MESSAGES_STREAK_5: string[] = [
  '连续几次偏离主线了。不妨看看手牌里还没用过的要素卡？',
  '推理陷入迷雾？试试把人物与动机、行为类卡牌组合提问。',
];

const REPEAT_WARNINGS: string[] = [
  '侦探，这些问题似乎与本案无关。请重新审视汤面，聚焦核心矛盾。',
  '温馨提示：连续无关提问会浪费宝贵的时间。建议回到推理板整理线索。',
];

export function getGuidanceMessage(streak: number): string {
  if (streak >= 7) {
    return REPEAT_WARNINGS[streak % REPEAT_WARNINGS.length];
  }
  if (streak >= 5) {
    return HINT_MESSAGES_STREAK_5[streak % HINT_MESSAGES_STREAK_5.length];
  }
  if (streak >= 3) {
    return HINT_MESSAGES_STREAK_3[streak % HINT_MESSAGES_STREAK_3.length];
  }
  return HINT_MESSAGES_STREAK_3[0];
}

function pickHighlightCardId(hand: Card[]): string | undefined {
  const hint = getCardHint(hand, ALL_CARDS);
  if (hint && hand.some((c) => c.id === hint.id)) return hint.id;
  if (hand.length > 0) return hand[Math.floor(Math.random() * hand.length)].id;
  return undefined;
}

export function checkGuidance(
  irrelevantStreak: number,
  questionCount: number,
  hand?: Card[]
): GuidanceAction | null {
  if (irrelevantStreak >= 7) {
    return {
      type: 'repeat_warning',
      message: getGuidanceMessage(irrelevantStreak),
    };
  }

  if (irrelevantStreak >= 5) {
    const cardId = hand ? pickHighlightCardId(hand) : undefined;
    return {
      type: 'highlight_card',
      message: getGuidanceMessage(irrelevantStreak),
      cardId,
    };
  }

  if (irrelevantStreak >= 3) {
    return {
      type: 'hint_message',
      message: getGuidanceMessage(irrelevantStreak),
    };
  }

  if (questionCount > 0 && questionCount % 12 === 0) {
    return {
      type: 'hint_message',
      message: '你已经问了不少问题。如果卡住了，打开推理板整理一下线索吧。',
    };
  }

  return null;
}
