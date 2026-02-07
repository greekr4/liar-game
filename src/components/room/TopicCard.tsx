"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { resetGame, leaveRoom } from "@/app/room/[code]/actions";

interface TopicCardProps {
  topic: string;
  nickname: string;
  isHost: boolean;
  roomCode: string;
}

export default function TopicCard({ topic, nickname, isHost, roomCode }: TopicCardProps) {
  const router = useRouter();
  const [flipped, setFlipped] = useState(false);
  const [autoCloseTimer, setAutoCloseTimer] = useState(5);
  const [resetting, setResetting] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const handleFlip = useCallback(() => {
    if (!flipped) {
      setFlipped(true);
      setAutoCloseTimer(5);
    } else {
      setFlipped(false);
    }
  }, [flipped]);

  useEffect(() => {
    if (!flipped) return;

    const interval = setInterval(() => {
      setAutoCloseTimer((prev) => {
        if (prev <= 1) {
          setFlipped(false);
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [flipped]);

  const handleReset = async () => {
    setResetting(true);
    await resetGame(roomCode);
  };

  const handleLeave = async () => {
    if (isHost) {
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

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 py-8">
      {/* 상단: 닉네임 + 나가기 */}
      <div className="w-full max-w-[320px] flex items-center justify-between mb-6">
        <p className="text-[var(--text-muted)] text-sm">
          <span className="text-white font-semibold">{nickname}</span>님의 카드
        </p>
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

      {/* 카드 */}
      <div className="card-container w-[80vw] max-w-[320px] aspect-[3/4]">
        <div
          className={`card-inner w-full h-full cursor-pointer ${flipped ? "flipped" : ""}`}
          onClick={handleFlip}
        >
          {/* 앞면 (닫힌 상태) */}
          <div className="card-front bg-[var(--card-closed)] border-2 border-white/10 shadow-2xl shadow-black/30">
            <div className="text-6xl mb-4">🃏</div>
            <p className="text-white/60 text-sm">터치하여 확인</p>
          </div>

          {/* 뒷면 (열린 상태) — 단어만 표시 */}
          <div className="card-back bg-gradient-to-br from-indigo-600 to-violet-900
                          border-2 border-indigo-400/30 shadow-2xl shadow-indigo-900/50">
            <div className="text-center space-y-4">
              <p className="text-indigo-200/60 text-sm uppercase tracking-widest">
                당신의 단어
              </p>
              <div className="w-16 h-0.5 bg-white/20 mx-auto" />
              <p className="text-white text-4xl font-black">{topic}</p>
            </div>

            <div className="absolute bottom-6 left-0 right-0 text-center">
              <p className="text-white/40 text-xs">{autoCloseTimer}초 후 자동 닫힘</p>
            </div>
          </div>
        </div>
      </div>

      {/* 안내 */}
      <p className="text-[var(--text-muted)] text-xs mt-6">
        {flipped ? "카드를 터치하면 닫힙니다" : "카드를 터치하면 단어를 확인할 수 있습니다"}
      </p>

      {/* 다시 하기 (방장만) */}
      {isHost && (
        <button
          onClick={handleReset}
          disabled={resetting}
          className="mt-8 px-8 py-3 bg-white/10 border border-white/20 text-white
                     rounded-xl hover:bg-white/20 transition-all active:scale-[0.98]
                     disabled:opacity-50"
        >
          {resetting ? "초기화 중..." : "다시 하기"}
        </button>
      )}
    </main>
  );
}
