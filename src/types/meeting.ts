export type MeetingStatus = "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED";
export type ParticipantRole = "HOST" | "CO_HOST" | "PRESENTER" | "ATTENDEE";
export type AttendanceStatus = "PRESENT" | "LATE" | "ABSENT" | "EXCUSED";
export type UserRole = "STUDENT" | "LECTURER" | "ADMIN";

export interface Meeting {
  id: string;
  title: string;
  description?: string | null;
  roomId: string;
  hostId: string;
  startTime: Date;
  endTime?: Date | null;
  duration?: number | null;
  status: MeetingStatus;
  isRecorded: boolean;
  recordingUrl?: string | null;
  maxParticipants?: number | null;
  isPublic: boolean;
  inviteCode: string;
  createdAt: Date;
}

export interface MeetingSummary {
  id: string;
  meetingId: string;
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  topics: string[];
  sentiment?: string | null;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: Date;
  type?: "text" | "reaction" | "raise-hand";
}
