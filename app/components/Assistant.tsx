import { useVapi } from "~/hooks/useVapi";
import { AssistantButton } from "./AssistantButton";
import { Display } from "./Display";

function Assistant() {
  const { toggleCall, callStatus, audioLevel } = useVapi();
  return (
    <>
      <div className="chat-history">
        <Display />
      </div>
      <div className="user-input">
        <AssistantButton
          audioLevel={audioLevel}
          callStatus={callStatus}
          toggleCall={toggleCall}
        ></AssistantButton>
      </div>
    </>
  );
}

export { Assistant };
