// hooks/useVapi.ts
import { useEffect, useRef, useState, useCallback } from "react";
import Vapi from "@vapi-ai/web";

const useVapi = (onTranscript: (text: string) => void) => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [liveText, setLiveText] = useState("");
  const vapiRef = useRef<any>(null);

  useEffect(() => {
    const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!);
    vapiRef.current = vapi;

    vapi.on("call-start", () => setIsSessionActive(true));

    vapi.on("call-end", () => {
      setIsSessionActive(false);
      setLiveText("");
      setVolumeLevel(0);
    });

    vapi.on("volume-level", (vol: number) => setVolumeLevel(vol));

    // This fires every time user or AI says something
    vapi.on("message", (msg: any) => {
      if (
        msg.type === "transcript" &&
        msg.role === "user" &&
        msg.transcriptType === "final"
      ) {
        // Final transcript → send to your AI engine
        onTranscript(msg.transcript);
        setLiveText("");
      }

      if (
        msg.type === "transcript" &&
        msg.role === "user" &&
        msg.transcriptType === "partial"
      ) {
        // Partial → show live on screen
        setLiveText(msg.transcript);
      }
    });

    return () => {
      vapi.stop();
    };
  }, []);

  const startCall = useCallback(() => {
    vapiRef.current?.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!);
  }, []);

  const stopCall = useCallback(() => {
    vapiRef.current?.stop();
  }, []);

  const toggleCall = () => {
    isSessionActive ? stopCall() : startCall();
  };

  return { isSessionActive, volumeLevel, liveText, toggleCall };
};

export default useVapi;