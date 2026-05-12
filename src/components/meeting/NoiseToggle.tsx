"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { toast } from "sonner";

export function NoiseToggle() {
  const [enabled, setEnabled] = useState(false);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    toast.info(next ? "Noise cancellation diaktifkan" : "Noise cancellation dimatikan");
  };

  return (
    <Button
      variant={enabled ? "default" : "outline"}
      size="sm"
      onClick={toggle}
      className="gap-2"
      title="Toggle noise cancellation"
    >
      {enabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
      <span className="text-xs">Noise Cancel</span>
    </Button>
  );
}
