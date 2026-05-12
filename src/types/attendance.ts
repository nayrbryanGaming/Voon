export type AttendanceStatus = "PRESENT" | "LATE" | "ABSENT" | "EXCUSED";

export interface AttendanceRecord {
  id: string;
  meetingId: string;
  userId: string;
  status: AttendanceStatus;
  joinedAt?: Date;
  leftAt?: Date;
  duration?: number;
}
