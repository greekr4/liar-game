-- ================================================
-- (구) 클러버 라이어 게임 (바보 모드) - Supabase 스키마
-- Supabase SQL Editor에서 전체 복사 후 실행
-- ================================================

-- 1. 방 상태 Enum
CREATE TYPE room_status AS ENUM ('waiting', 'playing');

-- 2. rooms 테이블
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  status room_status DEFAULT 'waiting',
  current_topic TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rooms_code ON rooms(code);

-- 3. players 테이블
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  session_token TEXT NOT NULL,
  role TEXT CHECK (role IN ('normal', 'fool')),
  assigned_topic TEXT,
  is_host BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(room_id, nickname)
);

CREATE INDEX idx_players_room_id ON players(room_id);
CREATE INDEX idx_players_session ON players(session_token);

-- 4. RLS 비활성화 (개발용)
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE players DISABLE ROW LEVEL SECURITY;

-- 5. Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE rooms, players;

-- 6. 원자적 역할 할당 RPC 함수
CREATE OR REPLACE FUNCTION assign_roles(
  p_room_id UUID,
  p_topic TEXT,
  p_assignments JSONB
)
RETURNS void AS $$
DECLARE
  assignment JSONB;
BEGIN
  UPDATE rooms SET status = 'playing', current_topic = p_topic
  WHERE id = p_room_id;

  FOR assignment IN SELECT * FROM jsonb_array_elements(p_assignments)
  LOOP
    UPDATE players
    SET role = assignment->>'role',
        assigned_topic = assignment->>'topic'
    WHERE id = (assignment->>'player_id')::UUID
      AND room_id = p_room_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 7. 게임 초기화 RPC 함수
CREATE OR REPLACE FUNCTION reset_game(p_room_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE rooms SET status = 'waiting', current_topic = NULL
  WHERE id = p_room_id;

  UPDATE players
  SET role = NULL, assigned_topic = NULL
  WHERE room_id = p_room_id;
END;
$$ LANGUAGE plpgsql;

-- 8. 오래된 방 정리 함수 (필요 시 수동 호출)
CREATE OR REPLACE FUNCTION cleanup_old_rooms()
RETURNS void AS $$
BEGIN
  DELETE FROM rooms WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;
