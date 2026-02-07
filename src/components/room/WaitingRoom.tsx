"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { startGame, leaveRoom } from "@/app/room/[code]/actions";
import CategorySelector from "@/components/room/CategorySelector";

interface PlayerData {
  id: string;
  nickname: string;
  is_host: boolean;
}

interface WaitingRoomProps {
  roomCode: string;
  nickname: string;
  isHost: boolean;
}

export default function WaitingRoom({ roomCode, nickname, isHost }: WaitingRoomProps) {
  const router = useRouter();
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [foolCount, setFoolCount] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const fetchPlayers = useCallback(async () => {
    const { data: room } = await supabase
      .from("rooms")
      .select("id")
      .eq("code", roomCode)
      .single();

    if (!room) return;

    const { data } = await supabase
      .from("players")
      .select("id, nickname, is_host")
      .eq("room_id", room.id)
      .order("joined_at", { ascending: true });

    if (data) setPlayers(data);
  }, [roomCode, supabase]);

  useEffect(() => {
    fetchPlayers();

    // 1초마다 참여자 목록 폴링
    const pollInterval = setInterval(fetchPlayers, 1000);

    return () => { clearInterval(pollInterval); };
  }, [fetchPlayers]);

  const handleStart = async () => {
    setLoading(true);
    setError("");
    const result = await startGame(roomCode, foolCount, selectedCategory || undefined);
    if (result.error) { setError(result.error); setLoading(false); }
  };

  const handleLeave = async () => {
    if (isHost && players.length > 1) {
      const ok = confirm("방장을 나가면 다른 플레이어에게 방장이 넘어갑니다. 나가시겠습니까?");
      if (!ok) return;
    }

    setLeaving(true);
    const sessionToken = localStorage.getItem(`session_${roomCode}`);
    if (!sessionToken) return;

    await leaveRoom(roomCode, sessionToken);
    localStorage.removeItem(`session_${roomCode}`);
    localStorage.removeItem(`nickname_${roomCode}`);
    router.replace("/");
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };

  const maxFools = Math.max(1, players.length - 1);

  const avatarColors = [
    "bg-indigo-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500",
    "bg-cyan-500", "bg-purple-500", "bg-orange-500", "bg-teal-500",
    "bg-pink-500", "bg-lime-500",
  ];

  return (
    <main className="min-h-dvh flex flex-col items-center px-6 py-8">
      {/* 상단 바: 타이틀 + 나가기 */}
      <div className="w-full max-w-xs flex items-center justify-between mb-4">
        <h1 className="text-2xl font-black tracking-tight">
          <span className="text-[var(--accent)]">(구) 클러버</span>{" "}
          <span className="text-white">라이어 게임</span>
        </h1>
        <button
          onClick={handleLeave}
          disabled={leaving}
          className="px-3 py-1.5 text-xs bg-white/10 border border-white/20 text-white/70
                     rounded-lg hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400
                     transition-all active:scale-95 disabled:opacity-50"
        >
          {leaving ? "나가는 중..." : "나가기"}
        </button>
      </div>

      {/* 방 코드 */}
      <button
        onClick={copyCode}
        className="mb-6 px-6 py-2 bg-white/5 border border-white/10 rounded-full
                   flex items-center gap-2 hover:bg-white/10 transition-all"
      >
        <span className="text-[var(--text-muted)] text-xs">코드</span>
        <span className="text-white font-mono font-bold text-xl tracking-widest">{roomCode}</span>
        <span className="text-[var(--text-muted)] text-xs">{copied ? "✓" : "복사"}</span>
      </button>

      {/* 참여자 그리드 */}
      <div className="w-full max-w-xs mb-6">
        <div className="grid grid-cols-3 gap-3">
          {players.map((player, i) => (
            <div
              key={player.id}
              className="animate-pop-in flex flex-col items-center gap-1.5"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div
                className={`w-14 h-14 rounded-full ${avatarColors[i % avatarColors.length]}
                            flex items-center justify-center text-white font-bold text-lg
                            shadow-lg relative`}
              >
                {player.nickname.slice(0, 1)}
                {player.is_host && (
                  <span className="absolute -top-1 -right-1 text-sm">👑</span>
                )}
              </div>
              <span className="text-xs text-white/80 truncate max-w-[60px]">
                {player.nickname}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 인원 카운터 */}
      <p className="text-[var(--text-muted)] text-sm mb-6">
        <span className="text-white font-bold text-lg">{players.length}</span>명 참여 중
      </p>

      {/* 방장 설정 */}
      {isHost && (
        <div className="w-full max-w-xs space-y-4 mb-6">
          {/* 카테고리 선택 */}
          <CategorySelector
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
          />

          {/* 바보 수 설정 */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
            <label className="block text-sm text-[var(--text-muted)] mb-3">
              바보 수: <span className="text-white font-bold text-lg">{foolCount}</span>명
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFoolCount(Math.max(1, foolCount - 1))}
                className="w-10 h-10 bg-white/10 rounded-full text-white text-xl
                           hover:bg-white/20 transition-all active:scale-90"
              >
                −
              </button>
              <input
                type="range"
                min={1}
                max={maxFools}
                value={foolCount}
                onChange={(e) => setFoolCount(Number(e.target.value))}
                className="flex-1 accent-[var(--accent)]"
              />
              <button
                onClick={() => setFoolCount(Math.min(maxFools, foolCount + 1))}
                className="w-10 h-10 bg-white/10 rounded-full text-white text-xl
                           hover:bg-white/20 transition-all active:scale-90"
              >
                +
              </button>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-2 text-center">
              {players.length - foolCount}명은 같은 단어, {foolCount}명은 다른 단어
            </p>
          </div>

          {error && <p className="text-red-400 text-sm text-center animate-pop-in">{error}</p>}

          <button
            onClick={handleStart}
            disabled={loading || players.length < 1}
            className="w-full py-4 bg-[var(--accent)] text-white text-lg font-bold rounded-xl
                       btn-glow animate-pulse-glow disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {loading ? (selectedCategory ? "AI 주제 생성 중..." : "시작 중...") : "게임 시작!"}
          </button>
        </div>
      )}

      {!isHost && (
        <div className="w-full max-w-xs py-4 bg-white/5 border border-white/10
                        rounded-xl text-center text-[var(--text-muted)]">
          방장이 게임을 시작할 때까지 대기 중...
        </div>
      )}
    </main>
  );
}
