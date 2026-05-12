export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface Quiz {
  questions: QuizQuestion[];
}

export interface ActionItem {
  task: string;
  assignee: string;
  deadline?: string | null;
  priority: "high" | "medium" | "low";
}

export interface SummaryResult {
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  topics: string[];
  sentiment: "productive" | "neutral" | "challenging";
}
