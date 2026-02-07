"use server";

import { createClient } from "@/lib/supabase/server";
import { assignWords } from "@/lib/game/shuffle";
import { getRandomPair } from "@/lib/game/topics";
import { generateTopicPair } from "@/lib/openai/generate-topic";

export async function createRoom() {
  const supabase = await createClient();

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const { error } = await supabase.from("rooms").insert({ code });
    if (!error) return { code };
  }

  return { error: "방 생성에 실패했습니다" };
}

export async function joinRoom(
  roomCode: string,
  nickname: string,
  sessionToken: string,
  isHost: boolean = false
) {
  const supabase = await createClient();

  const { data: room } = await supabase
    .from("rooms")
    .select("id, status")
    .eq("code", roomCode)
    .single();

  if (!room) return { error: "존재하지 않는 방입니다" };
  if (room.status !== "waiting") return { error: "이미 게임이 진행 중입니다" };

  const { data: player, error } = await supabase
    .from("players")
    .insert({
      room_id: room.id,
      nickname,
      session_token: sessionToken,
      is_host: isHost,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return { error: "이미 사용 중인 닉네임입니다" };
    return { error: "입장 실패: " + error.message };
  }

  return { playerId: player.id };
}

export async function startGame(
  roomCode: string,
  foolCount: number,
  category?: string
) {
  const supabase = await createClient();

  const { data: room } = await supabase
    .from("rooms")
    .select("id, status")
    .eq("code", roomCode)
    .single();

  if (!room) return { error: "방을 찾을 수 없습니다" };
  if (room.status !== "waiting") return { error: "이미 진행 중입니다" };

  const { data: players } = await supabase
    .from("players")
    .select("id")
    .eq("room_id", room.id);

  if (!players || players.length === 0) return { error: "참여자가 없습니다" };

  if (foolCount >= players.length) {
    return { error: "바보 수가 전체 인원보다 적어야 합니다" };
  }

  let pair;
  if (category) {
    try {
      pair = await generateTopicPair(category);
    } catch {
      pair = getRandomPair();
    }
  } else {
    pair = getRandomPair();
  }

  const assignments = assignWords(players, pair.wordA, pair.wordB, foolCount);

  const { error } = await supabase.rpc("assign_roles", {
    p_room_id: room.id,
    p_topic: `${pair.wordA} / ${pair.wordB}`,
    p_assignments: assignments,
  });

  if (error) return { error: "게임 시작 실패: " + error.message };

  return { success: true };
}

export async function leaveRoom(roomCode: string, sessionToken: string) {
  const supabase = await createClient();

  const { data: room } = await supabase
    .from("rooms")
    .select("id")
    .eq("code", roomCode)
    .single();

  if (!room) return { error: "방을 찾을 수 없습니다" };

  const { data: me } = await supabase
    .from("players")
    .select("id, is_host")
    .eq("room_id", room.id)
    .eq("session_token", sessionToken)
    .single();

  if (!me) return { error: "플레이어를 찾을 수 없습니다" };

  // 방장이 나가는 경우: 다른 플레이어에게 방장 이전
  if (me.is_host) {
    const { data: nextHost } = await supabase
      .from("players")
      .select("id")
      .eq("room_id", room.id)
      .neq("id", me.id)
      .order("joined_at", { ascending: true })
      .limit(1)
      .single();

    if (nextHost) {
      await supabase
        .from("players")
        .update({ is_host: true })
        .eq("id", nextHost.id);
    }
  }

  // 플레이어 삭제
  await supabase.from("players").delete().eq("id", me.id);

  // 남은 플레이어가 없으면 방 삭제
  const { count } = await supabase
    .from("players")
    .select("id", { count: "exact", head: true })
    .eq("room_id", room.id);

  if (count === 0) {
    await supabase.from("rooms").delete().eq("id", room.id);
  }

  return { success: true };
}

export async function resetGame(roomCode: string) {
  const supabase = await createClient();

  const { data: room } = await supabase
    .from("rooms")
    .select("id")
    .eq("code", roomCode)
    .single();

  if (!room) return { error: "방을 찾을 수 없습니다" };

  const { error } = await supabase.rpc("reset_game", {
    p_room_id: room.id,
  });

  if (error) return { error: "초기화 실패" };

  return { success: true };
}
