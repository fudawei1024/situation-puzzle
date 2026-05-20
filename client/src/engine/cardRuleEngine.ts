import type { ActionSubtype, Card, ElementSubtype } from '../types/index.ts';

const MAX_HAND_SIZE = 12;

/** Element + action subtype pairs that do not produce sensible questions. */
const INCOMPATIBLE_PAIRS = new Set<string>([
  'time+relation',
  'time+motive',
  'location+relation',
  'location+motive',
  'location+behavior',
  'item+relation',
]);

function isElementSubtype(subtype: Card['subtype']): subtype is ElementSubtype {
  return subtype === 'person' || subtype === 'location' || subtype === 'item' || subtype === 'time';
}

function isActionSubtype(subtype: Card['subtype']): subtype is ActionSubtype | 'why' | 'verify' {
  return (
    subtype === 'relation' ||
    subtype === 'behavior' ||
    subtype === 'motive' ||
    subtype === 'state' ||
    subtype === 'why' ||
    subtype === 'verify'
  );
}

function incompatibilityKey(elementSubtype: ElementSubtype, actionSubtype: ActionSubtype | 'why' | 'verify'): string {
  return `${elementSubtype}+${actionSubtype}`;
}

/**
 * Deterministic combo key for puzzle lookup.
 * Pass element card id first, action card id second (e.g. "victim+death_cause").
 */
export function generateComboKey(card1Id: string, card2Id: string): string {
  return `${card1Id}+${card2Id}`;
}

export function canCombine(elementCard: Card, actionCard: Card): boolean {
  if (elementCard.category !== 'element') return false;
  if (actionCard.category !== 'action' && actionCard.category !== 'special') return false;
  if (!isElementSubtype(elementCard.subtype)) return false;
  if (!isActionSubtype(actionCard.subtype)) return false;

  return !INCOMPATIBLE_PAIRS.has(incompatibilityKey(elementCard.subtype, actionCard.subtype));
}

export function getCompatibleActions(elementCard: Card, allCards: Card[]): Card[] {
  if (elementCard.category !== 'element') return [];

  return allCards.filter(
    (card) =>
      (card.category === 'action' || card.category === 'special') && canCombine(elementCard, card),
  );
}

export { MAX_HAND_SIZE };
