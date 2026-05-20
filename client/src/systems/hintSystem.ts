import { canCombine } from '../engine/cardRuleEngine.ts';
import type { Card } from '../types/index.ts';

function isElementCard(card: Card): boolean {
  return card.category === 'element';
}

function isActionCard(card: Card): boolean {
  return card.category === 'action' || card.category === 'special';
}

export function getCardHint(hand: Card[], allCards: Card[]): Card | null {
  const handIds = new Set(hand.map((c) => c.id));
  const candidates = allCards.filter(
    (c) =>
      !handIds.has(c.id) &&
      (c.rarity === 'rare' || c.rarity === 'epic')
  );
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function getComboHint(hand: Card[]): [Card, Card] | null {
  const elements = hand.filter(isElementCard);
  const actions = hand.filter(isActionCard);

  for (const el of elements) {
    for (const act of actions) {
      if (canCombine(el, act)) {
        return [el, act];
      }
    }
  }
  return null;
}
