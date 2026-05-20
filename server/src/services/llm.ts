import OpenAI from 'openai';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      baseURL: 'https://api.deepseek.com',
    });
  }
  return client;
}

export interface JudgeResult {
  answer: 'yes' | 'no' | 'irrelevant';
  reply: string;
  unlockCards?: string[];
  newClue?: string;
}

export async function judgeQuestion(
  surface: string,
  truth: string,
  history: { role: 'player' | 'host'; content: string }[],
  question: string,
  confirmedClues: string[]
): Promise<JudgeResult> {
  const systemPrompt = `你是一个海龟汤游戏的主持人。你知道完整的故事真相。

## 汤面（玩家看到的谜面）
${surface}

## 汤底（完整真相，绝对保密）
${truth}

## 玩家已确认的线索
${confirmedClues.length > 0 ? confirmedClues.map((c, i) => `${i + 1}. ${c}`).join('\n') : '暂无'}

## 你的回答规则
1. 玩家会向你提问，你只能回答"是"、"否"或"不重要"
2. 根据汤底的真相来判断玩家的问题
3. 如果问题与真相相符，回答"是"
4. 如果问题与真相矛盾，回答"否"  
5. 如果问题与真相无关或不影响推理，回答"不重要"
6. 你需要给出有趣的、带有神秘感的回复，不要只说一个字

## 回复格式
你必须严格以 JSON 格式回复，不要包含其他内容：
{
  "answer": "yes" | "no" | "irrelevant",
  "reply": "你的完整回复（带有主持人风格的语言）",
  "newClue": "如果answer是yes，用一句简短的话总结这条新线索，否则为null"
}`;

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...history.map(h => ({
      role: (h.role === 'player' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: h.content,
    })),
    { role: 'user', content: question },
  ];

  const response = await getClient().chat.completions.create({
    model: 'deepseek-chat',
    messages,
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content || '';
  
  try {
    const result = JSON.parse(content);
    return {
      answer: result.answer || 'irrelevant',
      reply: result.reply || '让我想想...',
      unlockCards: result.unlockCards,
      newClue: result.newClue || undefined,
    };
  } catch {
    return {
      answer: 'irrelevant',
      reply: '嗯...让我想想这个问题...',
    };
  }
}
