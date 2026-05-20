import { getCardById } from '../data/cards.ts';
import { checkGuidance } from '../systems/guidanceSystem.ts';
import type { JudgeResponse } from '../types/index.ts';
import { useGameStore } from './gameStore.ts';

export function applyJudgeResponse(response: JudgeResponse & { sessionId: string }): void {
  const store = useGameStore.getState();
  store.setSessionId(response.sessionId);

  const newQuestionCount = store.questionCount + 1;
  const newStreak =
    response.answer === 'irrelevant' ? store.irrelevantStreak + 1 : 0;

  useGameStore.setState({
    questionCount: newQuestionCount,
    irrelevantStreak: newStreak,
  });

  store.addMessage({
    id: crypto.randomUUID(),
    role: 'host',
    content: response.reply,
    answerType: response.answer,
    timestamp: Date.now(),
  });

  if (response.unlockCards) {
    for (const cardId of response.unlockCards) {
      const card = getCardById(cardId);
      if (card) store.addCardToHand(card);
    }
  }

  if (response.newClue) {
    store.addClueNote({
      id: crypto.randomUUID(),
      content: response.newClue,
      source: 'host',
      x: Math.random() * 55 + 15,
      y: Math.random() * 55 + 15,
      rotation: (Math.random() - 0.5) * 24,
      isHighlighted: true,
    });
  }

  const updatedHand = useGameStore.getState().hand;
  const guidance = checkGuidance(newStreak, newQuestionCount, updatedHand);
  if (!guidance) return;

  if (guidance.type === 'hint_message' || guidance.type === 'repeat_warning') {
    store.addMessage({
      id: crypto.randomUUID(),
      role: 'host',
      content: guidance.message ?? '',
      timestamp: Date.now(),
    });
    return;
  }

  if (guidance.type === 'highlight_card' && guidance.cardId) {
    if (guidance.message) {
      store.addMessage({
        id: crypto.randomUUID(),
        role: 'host',
        content: guidance.message,
        timestamp: Date.now(),
      });
    }
    store.setHighlightedCard(guidance.cardId);
    window.setTimeout(() => {
      if (useGameStore.getState().highlightedCardId === guidance.cardId) {
        store.setHighlightedCard(null);
      }
    }, 3000);
  }
}
