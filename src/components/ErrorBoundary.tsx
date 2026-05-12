"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[Voon ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] rounded-2xl bg-red-500/10 border border-red-500/20 p-8 text-center">
          <AlertTriangle className="w-8 h-8 text-red-400 mb-3" />
          <h3 className="text-white font-semibold mb-1">Terjadi kesalahan</h3>
          <p className="text-gray-500 text-sm mb-4">
            {this.state.error?.message ?? "Unknown error"}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl text-sm transition-colors border border-red-500/20"
          >
            Coba Lagi
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
