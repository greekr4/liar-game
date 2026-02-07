import type { Assignment } from "@/types/database";

interface PlayerInput {
  id: string;
}

/** Fisher-Yates 셔플 */
function fisherYatesShuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 바보 모드: N명은 다른 단어(바보), 나머지는 정상 단어
 *
 * @param players - 플레이어 목록
 * @param wordA - 다수에게 할당할 단어
 * @param wordB - 바보에게 할당할 단어
 * @param foolCount - 바보 수
 */
export function assignWords(
  players: PlayerInput[],
  wordA: string,
  wordB: string,
  foolCount: number
): Assignment[] {
  const shuffled = fisherYatesShuffle(players);

  return shuffled.map((player, index) => ({
    player_id: player.id,
    role: index < foolCount ? "fool" : "normal",
    topic: index < foolCount ? wordB : wordA,
  }));
}
