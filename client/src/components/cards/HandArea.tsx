import { useEffect, useState, useRef, useCallback } from 'react';
import { generateQuestions } from '../../data/cardTemplates.ts';
import { useGameStore } from '../../engine/gameStore.ts';
import type { Card } from '../../types/index.ts';

const FILTER_TABS: { key: string; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'person', label: '👤 人物' },
  { key: 'location', label: '📍 地点' },
  { key: 'item', label: '🔑 物品' },
  { key: 'time', label: '🕐 时间' },
  { key: 'relation', label: '🔗 关系' },
  { key: 'behavior', label: '⚙️ 行为' },
  { key: 'motive', label: '💔 动机' },
  { key: 'state', label: '🔍 状态' },
];

function rarityStyle(rarity: Card['rarity']): { border: string; glow: string } {
  if (rarity === 'epic') return { border: 'border-purple-400', glow: '0 0 12px rgba(168, 85, 247, 0.4)' };
  if (rarity === 'rare') return { border: 'border-blue-400', glow: '0 0 10px rgba(96, 165, 250, 0.3)' };
  return { border: 'border-white/30', glow: 'none' };
}

const DOUBLE_CLICK_MS = 350;

interface HandAreaProps {
  freeInputOpen: boolean;
  onToggleFreeInput: () => void;
}

export function HandArea({ freeInputOpen, onToggleFreeInput }: HandAreaProps) {
  const hand = useGameStore((s) => s.hand);
  const cardFilter = useGameStore((s) => s.cardFilter);
  const selectedElement = useGameStore((s) => s.selectedElement);
  const selectedAction = useGameStore((s) => s.selectedAction);
  const highlightedCardId = useGameStore((s) => s.highlightedCardId);

  const setCardFilter = useGameStore((s) => s.setCardFilter);
  const selectCard = useGameStore((s) => s.selectCard);
  const setCurrentQuestion = useGameStore((s) => s.setCurrentQuestion);

  const [entered, setEntered] = useState(false);
  const lastClickRef = useRef<{ id: string; time: number } | null>(null);

  useEffect(() => {
    if (hand.length > 0 && !entered) {
      const t = setTimeout(() => setEntered(true), 100);
      return () => clearTimeout(t);
    }
  }, [hand, entered]);

  const filteredHand =
    cardFilter === 'all' ? hand : hand.filter((c) => c.subtype === cardFilter);

  // Generate question when element+action are both selected
  // OR when only element is selected (single-card question)
  useEffect(() => {
    if (selectedElement && selectedAction) {
      const alternatives = generateQuestions(selectedElement, selectedAction);
      if (alternatives.length > 0) {
        setCurrentQuestion(alternatives[0], alternatives);
      }
    } else if (selectedElement && !selectedAction) {
      const alternatives = generateQuestions(selectedElement);
      if (alternatives.length > 0) {
        setCurrentQuestion(alternatives[0], alternatives);
      }
    }
  }, [selectedElement, selectedAction, setCurrentQuestion]);

  const handleCardClick = useCallback(
    (card: Card) => {
      const now = Date.now();
      const last = lastClickRef.current;

      // Double-click: immediately generate and set question for element card
      if (
        last &&
        last.id === card.id &&
        now - last.time < DOUBLE_CLICK_MS &&
        card.category === 'element'
      ) {
        lastClickRef.current = null;
        // Select element, clear action, generate default question
        selectCard(card);
        const alternatives = generateQuestions(card);
        if (alternatives.length > 0) {
          setCurrentQuestion(alternatives[0], alternatives);
        }
        return;
      }

      lastClickRef.current = { id: card.id, time: now };
      selectCard(card);
    },
    [selectCard, setCurrentQuestion]
  );

  const isSelected = (card: Card) =>
    selectedElement?.id === card.id || selectedAction?.id === card.id;

  const isElement = (card: Card) => card.category === 'element';
  const isAction = (card: Card) => card.category === 'action' || card.category === 'special';

  // Show which cards are selectable based on current state
  const isSelectable = (card: Card) => {
    if (!selectedElement) {
      return isElement(card);
    }
    // Element already selected: action cards are next, or can switch element
    return true;
  };

  return (
    <div className="shrink-0 border-t border-white/10 bg-gradient-to-t from-[#08080e] to-[#0a0a10]/95" style={{ minHeight: 130 }}>
      {/* Selection hint */}
      <div className="px-3 pt-1.5 pb-0.5">
        {!selectedElement && (
          <p className="text-center text-[10px] text-amber-400/50 animate-pulse">
            👆 点击一张要素卡（人物/地点/物品）开始提问
          </p>
        )}
        {selectedElement && !selectedAction && (
          <p className="text-center text-[10px] text-amber-400/50">
            ✅ 已选「{selectedElement.name}」— 再选一张动作卡组合，或直接发送默认问题
          </p>
        )}
        {selectedElement && selectedAction && (
          <p className="text-center text-[10px] text-emerald-400/50">
            ✅ 已组合「{selectedElement.name}」+「{selectedAction.name}」— 点击发送！
          </p>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-0.5 overflow-x-auto px-2 py-1 scrollbar-none">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setCardFilter(tab.key)}
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs transition-all duration-200 ${
              cardFilter === tab.key
                ? 'bg-amber-500/25 text-amber-200 ring-1 ring-amber-400/40 scale-105'
                : 'text-white/40 hover:bg-white/10 hover:text-white/70'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="flex items-end gap-2 overflow-x-auto px-3 pb-4 pt-1 scrollbar-none">
        {filteredHand.length === 0 && (
          <p className="w-full text-center text-xs text-white/20 py-6">
            当前分类下没有卡牌
          </p>
        )}

        {filteredHand.map((card, idx) => {
          const selected = isSelected(card);
          const highlighted = highlightedCardId === card.id;
          const rarity = rarityStyle(card.rarity);
          const selectable = isSelectable(card);
          const dimmed = !selectable && !selected;

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleCardClick(card)}
              className={`card-enter relative shrink-0 flex flex-col items-center justify-between rounded-xl border-2 p-1.5 transition-all duration-200 ${
                rarity.border
              } ${selected ? 'card-selected -translate-y-2 border-amber-400 scale-110' : 'card-glow hover:-translate-y-1 hover:scale-105'} ${
                highlighted ? 'animate-pulse ring-2 ring-amber-300/80' : ''
              } ${dimmed ? 'opacity-40' : ''}`}
              style={{
                width: 62,
                height: 88,
                backgroundColor: `${card.color}55`,
                boxShadow: selected ? undefined : rarity.glow,
                animationDelay: entered ? '0ms' : `${idx * 60}ms`,
              }}
            >
              <span className="text-2xl leading-none drop-shadow-md">{card.icon}</span>
              <span className="w-full truncate text-center text-[10px] font-medium text-white/90">
                {card.name}
              </span>
              {/* Category label */}
              <span className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] ${
                isElement(card) ? 'text-sky-300/50' : isAction(card) ? 'text-orange-300/50' : 'text-yellow-300/50'
              }`}>
                {isElement(card) ? '要素' : isAction(card) ? '动作' : '特殊'}
              </span>
              {card.rarity !== 'common' && (
                <div
                  className="absolute -top-1 -right-1 h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: card.rarity === 'epic' ? '#a855f7' : '#60a5fa',
                    boxShadow: `0 0 6px ${card.rarity === 'epic' ? 'rgba(168,85,247,0.6)' : 'rgba(96,165,250,0.5)'}`,
                  }}
                />
              )}
            </button>
          );
        })}

        {/* Free input toggle */}
        <button
          type="button"
          onClick={onToggleFreeInput}
          className={`flex h-[88px] w-[54px] shrink-0 flex-col items-center justify-center rounded-xl border-2 border-dashed text-xl transition-all duration-200 ${
            freeInputOpen
              ? 'border-indigo-400/50 bg-indigo-500/20 text-indigo-200'
              : 'border-white/15 bg-white/5 text-white/40 hover:border-white/30 hover:bg-white/10 hover:text-white/70'
          }`}
          aria-label="键盘输入"
        >
          ⌨️
          <span className="mt-1 text-[9px]">自由</span>
        </button>
      </div>
    </div>
  );
}
