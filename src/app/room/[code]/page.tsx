"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import WaitingRoom from "@/components/room/WaitingRoom";
import TopicCard from "@/components/room/TopicCard";
import type { RoomStatus } from "@/types/database";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.code as string;

  const [status, setStatus] = useState<RoomStatus>("waiting");
  const [myTopic, setMyTopic] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const fetchRoomState = useCallback(async () => {
    const sessionToken = localStorage.getItem(`session_${roomCode}`);
    if (!sessionToken) return;

    const { data: room } = await supabase
      .from("rooms")
      .select("id, status")
      .eq("code", roomCode)
      .single();

    // 방이 삭제된 경우
    if (!room) {
      localStorage.removeItem(`session_${roomCode}`);
      localStorage.removeItem(`nickname_${roomCode}`);
      router.replace("/");
      return;
    }

    const newStatus = room.status as RoomStatus;
    setStatus(newStatus);

    // 플레이어 존재 확인 + is_host 변경 감지
    const { data: player } = await supabase
      .from("players")
      .select("assigned_topic, is_host")
      .eq("session_token", sessionToken)
      .eq("room_id", room.id)
      .single();

    // 플레이어가 삭제된 경우 (강퇴 등)
    if (!player) {
      localStorage.removeItem(`session_${roomCode}`);
      localStorage.removeItem(`nickname_${roomCode}`);
      router.replace("/");
      return;
    }

    // 방장 변경 감지
    setIsHost(player.is_host);

    if (newStatus === "playing" && player.assigned_topic) {
      setMyTopic(player.assigned_topic);
    }

    if (newStatus === "waiting") {
      setMyTopic(null);
    }
  }, [roomCode, supabase, router]);

  useEffect(() => {
    const sessionToken = localStorage.getItem(`session_${roomCode}`);
    const savedNickname = localStorage.getItem(`nickname_${roomCode}`);

    if (!sessionToken || !savedNickname) {
      router.replace("/");
      return;
    }

    setNickname(savedNickname);

    const load = async () => {
      const { data: room } = await supabase
        .from("rooms")
        .select("id, status")
        .eq("code", roomCode)
        .single();

      if (!room) { setError("존재하지 않는 방입니다"); setLoading(false); return; }

      setStatus(room.status as RoomStatus);

      const { data: player } = await supabase
        .from("players")
        .select("assigned_topic, is_host")
        .eq("session_token", sessionToken)
        .eq("room_id", room.id)
        .single();

      if (player) {
        setMyTopic(player.assigned_topic);
        setIsHost(player.is_host);
      }

      setLoading(false);
    };

    load();

    // 1초마다 방 상태 폴링
    const pollInterval = setInterval(fetchRoomState, 1000);

    return () => { clearInterval(pollInterval); };
  }, [roomCode, router, supabase, fetchRoomState]);

  if (loading) {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <p className="text-[var(--text-muted)]">접속 중...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-dvh flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => router.replace("/")}
            className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl
                       hover:bg-white/20 transition-all"
          >
            홈으로
          </button>
        </div>
      </main>
    );
  }

  if (status === "waiting") {
    return <WaitingRoom roomCode={roomCode} nickname={nickname} isHost={isHost} />;
  }

  if (status === "playing" && myTopic) {
    return <TopicCard topic={myTopic} nickname={nickname} isHost={isHost} roomCode={roomCode} />;
  }

  return (
    <main className="min-h-dvh flex items-center justify-center">
      <p className="text-[var(--text-muted)]">카드 배분 중...</p>
    </main>
  );
}
