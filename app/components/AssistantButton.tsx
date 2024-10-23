import React from "react";
import { useVapiContext } from "~/contexts/VapiContext";
import { CALL_STATUS } from "~/hooks/useVapi";
import { Loader2, Mic, Square } from "lucide-react";
import { Button } from "~/components/ui/button";
import { getVapi, startVapiCall } from "~/lib/vapi.sdk";
import { useMenuContext } from "~/contexts/MenuContext";

const AssistantButton = () => {
  const { state, dispatch } = useVapiContext();
  const { callStatus, audioLevel } = state;
  const { menu } = useMenuContext();

  const toggleCall = async () => {
    const vapi = getVapi();
    if (callStatus === CALL_STATUS.ACTIVE) {
      dispatch({ type: 'SET_CALL_STATUS', payload: CALL_STATUS.INACTIVE });
      vapi?.stop();
    } else {
      dispatch({ type: 'SET_CALL_STATUS', payload: CALL_STATUS.LOADING });
      try {
        if (menu) {
          await startVapiCall(menu);
          // The call status will be updated by the event listener in VapiProvider
        } else {
          throw new Error("Menu is not available");
        }
      } catch (error) {
        console.error("Failed to start call:", error);
        dispatch({ type: 'SET_CALL_STATUS', payload: CALL_STATUS.INACTIVE });
        alert("Failed to start call. Please check your microphone permissions and try again.");
      }
    }
  };

  const color =
    callStatus === CALL_STATUS.ACTIVE
      ? "red"
      : callStatus === CALL_STATUS.LOADING
        ? "orange"
        : "green";

  const buttonStyle = {
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    color: "white",
    border: "none",
    boxShadow: `1px 1px ${10 + audioLevel * 40}px ${audioLevel * 10
      }px ${color}`,
    backgroundColor:
      callStatus === CALL_STATUS.ACTIVE
        ? "red"
        : callStatus === CALL_STATUS.LOADING
          ? "orange"
          : "green",
    cursor: "pointer",
  };

  return (
    <Button
      style={buttonStyle}
      className={`transition ease-in-out ${callStatus === CALL_STATUS.ACTIVE
        ? "bg-red-500 hover:bg-red-700"
        : callStatus === CALL_STATUS.LOADING
          ? "bg-orange-500 hover:bg-orange-700"
          : "bg-green-500 hover:bg-green-700"
        } flex items-center justify-center`}
      onClick={toggleCall}
    >
      {callStatus === CALL_STATUS.ACTIVE ? (
        <Square />
      ) : callStatus === CALL_STATUS.LOADING ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Mic />
      )}
    </Button>
  );
};

export { AssistantButton };
