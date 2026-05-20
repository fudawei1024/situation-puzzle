import type { StorySlide } from '../types/index.ts';

/**
 * Cinematic story slides for each puzzle.
 * Each slide: one focused visual + narration text + atmosphere.
 * Designed as clean movie storyboard frames, NOT scattered emoji soup.
 */
export const PUZZLE_SCENES: Record<string, StorySlide[]> = {
  'classic-hiccup': [
    {
      text: '深夜，一个男人推开了酒吧的门。',
      background: 'linear-gradient(180deg, #05050f 0%, #0f0a1a 50%, #1a1020 100%)',
      mood: '昏暗的街灯，远处隐约传来爵士乐声',
      elements: [
        { emoji: '🚶', size: 6, x: 50, y: 45, animation: 'scene-center-in', delay: 400 },
      ],
    },
    {
      text: '他走到吧台前，向酒保要了一杯水。',
      background: 'linear-gradient(180deg, #0f0a15 0%, #1a1020 50%, #201518 100%)',
      mood: '吧台上的灯光微微晃动',
      elements: [
        { emoji: '💧', size: 7, x: 50, y: 42, animation: 'scene-center-in', delay: 400 },
      ],
    },
    {
      text: '酒保看了他一眼……\n突然从柜台下掏出一把枪，指着他！',
      background: 'linear-gradient(180deg, #150505 0%, #200a0a 50%, #1a0505 100%)',
      mood: '空气瞬间凝固',
      elements: [
        { emoji: '🔫', size: 8, x: 50, y: 40, animation: 'scene-dramatic-in', delay: 600 },
      ],
    },
    {
      text: '男人平静地说了一声"谢谢"，\n然后转身离开了酒吧。',
      background: 'linear-gradient(180deg, #05050f 0%, #0a0a18 50%, #0f0a15 100%)',
      mood: '门轻轻关上，一切归于平静',
      elements: [
        { emoji: '🙏', size: 6, x: 50, y: 42, animation: 'scene-center-in', delay: 400 },
      ],
    },
    {
      text: '请问，究竟发生了什么？',
      background: 'linear-gradient(180deg, #020208 0%, #08081a 50%, #020208 100%)',
      mood: '真相隐藏在最不起眼的细节中',
      elements: [
        { emoji: '❓', size: 8, x: 50, y: 40, animation: 'scene-mystery-pulse', delay: 300 },
      ],
    },
  ],
};

export function getPuzzleScenes(puzzleId: string, surfaceText: string): StorySlide[] {
  if (PUZZLE_SCENES[puzzleId]) {
    return PUZZLE_SCENES[puzzleId];
  }

  const sentences = surfaceText
    .replace(/([。！？])/g, '$1|')
    .split('|')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const icons = ['📖', '🔎', '💡', '🌙', '⚡', '🗝️', '🎭', '📌'];

  return sentences.map((text, i) => ({
    text,
    background: `linear-gradient(180deg, hsl(${220 + i * 12}, 25%, 4%) 0%, hsl(${230 + i * 8}, 20%, 8%) 100%)`,
    mood: i === sentences.length - 1 ? '等待你的推理……' : undefined,
    elements: [
      {
        emoji: i === sentences.length - 1 ? '❓' : icons[i % icons.length],
        size: 6,
        x: 50,
        y: 42,
        animation: 'scene-center-in',
        delay: 400,
      },
    ],
  }));
}
