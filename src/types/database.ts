export type RoomStatus = "waiting" | "playing";

export interface Room {
  id: string;
  code: string;
  status: RoomStatus;
  current_topic: string | null;
  created_at: string;
}

export interface Player {
  id: string;
  room_id: string;
  nickname: string;
  session_token: string;
  role: "normal" | "fool" | null;
  assigned_topic: string | null;
  is_host: boolean;
  joined_at: string;
}

export interface Assignment {
  player_id: string;
  role: "normal" | "fool";
  topic: string;
}
