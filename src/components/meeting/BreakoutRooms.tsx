"use client";

import { useState, useCallback } from "react";
import { Users, Plus, X, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface Room {
  id: string;
  name: string;
  participants: string[];
}

interface BreakoutRoomsProps {
  isHost: boolean;
  meetingId: string;
  participants: { identity: string; name: string }[];
}

export function BreakoutRooms({ isHost, meetingId, participants }: BreakoutRoomsProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [open, setOpen] = useState(false);
  const [roomCount, setRoomCount] = useState(2);

  const createRooms = useCallback(async () => {
    const newRooms: Room[] = Array.from({ length: roomCount }, (_, i) => ({
      id: `breakout-${meetingId}-${i + 1}`,
      name: `Kelompok ${i + 1}`,
      participants: [],
    }));

    // Auto-assign participants evenly
    participants.forEach((p, i) => {
      newRooms[i % roomCount].participants.push(p.name);
    });

    setRooms(newRooms);
    toast.success(`${roomCount} ruang breakout dibuat`);
  }, [roomCount, meetingId, participants]);

  const deleteRoom = (id: string) => {
    setRooms((r) => r.filter((room) => room.id !== id));
  };

  if (!isHost) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        Hanya host yang dapat mengelola breakout rooms
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm text-white">Breakout Rooms</span>
        <button
          onClick={() => setOpen(!open)}
          className="text-blue-400 text-xs hover:text-blue-300 transition-colors"
        >
          {open ? "Sembunyikan" : "Buat Ruang"}
        </button>
      </div>

      {open && rooms.length === 0 && (
        <div className="flex flex-col gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-400">Jumlah ruang</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRoomCount(Math.max(2, roomCount - 1))}
                className="w-6 h-6 rounded-lg bg-white/10 text-white text-sm flex items-center justify-center hover:bg-white/20"
              >
                -
              </button>
              <span className="text-white text-sm w-4 text-center">{roomCount}</span>
              <button
                onClick={() => setRoomCount(Math.min(8, roomCount + 1))}
                className="w-6 h-6 rounded-lg bg-white/10 text-white text-sm flex items-center justify-center hover:bg-white/20"
              >
                +
              </button>
            </div>
          </div>
          <button
            onClick={createRooms}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-xl font-semibold transition-colors"
          >
            Buat & Mulai
          </button>
        </div>
      )}

      {rooms.length > 0 && (
        <div className="flex flex-col gap-2">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-sm text-white font-medium">{room.name}</span>
                  <span className="text-xs text-gray-500">({room.participants.length})</span>
                </div>
                <button
                  onClick={() => deleteRoom(room.id)}
                  className="text-gray-600 hover:text-red-400 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {room.participants.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {room.participants.map((name) => (
                    <span key={name} className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                      {name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          <button
            onClick={() => setRooms([])}
            className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded-xl font-semibold transition-colors border border-red-500/20"
          >
            Akhiri Semua Ruang
          </button>
        </div>
      )}

      {rooms.length === 0 && !open && (
        <p className="text-xs text-gray-500 text-center py-2">Belum ada breakout room</p>
      )}
    </div>
  );
}
