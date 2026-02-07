"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRoom, joinRoom } from "@/app/room/[code]/actions";

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<"home" | "create" | "join">("home");
  const [code, setCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!nickname.trim() || nickname.trim().length > 6) {
      setError("닉네임을 1~6자로 입력해주세요");
      return;
    }

    setLoading(true);
    setError("");

    const result = await createRoom();
    if (result.error) { setError(result.error); setLoading(false); return; }

    const roomCode = result.code!;
    const sessionToken = crypto.randomUUID();

    const joinResult = await joinRoom(roomCode, nickname.trim(), sessionToken, true);
    if (joinResult.error) { setError(joinResult.error); setLoading(false); return; }

    localStorage.setItem(`session_${roomCode}`, sessionToken);
    localStorage.setItem(`nickname_${roomCode}`, nickname.trim());
    router.push(`/room/${roomCode}`);
  };

  const handleJoin = async () => {
    if (code.length !== 4) { setError("4자리 코드를 입력해주세요"); return; }
    if (!nickname.trim() || nickname.trim().length > 6) {
      setError("닉네임을 1~6자로 입력해주세요");
      return;
    }

    setLoading(true);
    setError("");

    const sessionToken = crypto.randomUUID();
    const result = await joinRoom(code, nickname.trim(), sessionToken);

    if (result.error) { setError(result.error); setLoading(false); return; }

    localStorage.setItem(`session_${code}`, sessionToken);
    localStorage.setItem(`nickname_${code}`, nickname.trim());
    router.push(`/room/${code}`);
  };

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-8">
        {/* 타이틀 */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tight">
            <span className="text-[var(--accent)]">(구) 클러버</span>{" "}
            <span className="text-white">라이어 게임</span>
          </h1>
          <p className="text-[var(--text-muted)] text-sm">바보를 찾아라!</p>
        </div>

        {mode === "home" && (
          <div className="space-y-3">
            <button
              onClick={() => setMode("create")}
              className="w-full py-4 bg-[var(--accent)] text-white text-lg font-bold rounded-xl
                         btn-glow transition-all active:scale-[0.98]"
            >
              방 만들기
            </button>
            <button
              onClick={() => setMode("join")}
              className="w-full py-4 bg-white/10 border border-white/20 text-white text-lg font-semibold
                         rounded-xl hover:bg-white/20 transition-all active:scale-[0.98]"
            >
              방 입장하기
            </button>
          </div>
        )}

        {(mode === "create" || mode === "join") && (
          <div className="space-y-3 animate-pop-in">
            {mode === "join" && (
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-1.5">방 코드</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => { setCode(e.target.value.replace(/\D/g, "").slice(0, 4)); setError(""); }}
                  placeholder="4자리 숫자"
                  maxLength={4}
                  autoFocus
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl
                             text-white placeholder-white/40 outline-none text-center text-2xl
                             tracking-[0.5em] font-mono
                             focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30 transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-1.5">닉네임</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => { setNickname(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && (mode === "create" ? handleCreate() : handleJoin())}
                placeholder="닉네임 (최대 6자)"
                maxLength={6}
                autoFocus={mode === "create"}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl
                           text-white placeholder-white/40 outline-none text-center text-lg
                           focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30 transition-all"
              />
            </div>

            {error && <p className="text-red-400 text-sm text-center animate-pop-in">{error}</p>}

            <button
              onClick={mode === "create" ? handleCreate : handleJoin}
              disabled={loading}
              className="w-full py-4 bg-[var(--accent)] text-white text-lg font-bold rounded-xl
                         btn-glow disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {loading ? "처리 중..." : mode === "create" ? "방 만들기" : "입장하기"}
            </button>

            <button
              onClick={() => { setMode("home"); setError(""); setCode(""); setNickname(""); }}
              className="w-full py-2 text-[var(--text-muted)] text-sm hover:text-white transition-colors"
            >
              ← 뒤로
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
