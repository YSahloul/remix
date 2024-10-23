import React from "react";
import { useVapi } from "~/hooks/useVapi";
import { AssistantButton } from "./AssistantButton";
import { Display } from "./Display";
import { CategorizedMenu, MenuItem } from "~/types/menu.types";

interface AssistantProps {
  initialMenu?: CategorizedMenu;
}

function Assistant({ initialMenu }: AssistantProps) {
  const { toggleCall, callStatus, audioLevel } = useVapi();

  return (
    <>
      <div className="chat-history">
        <Display initialMenu={initialMenu} />
      </div>
      <div className="user-input">
        <AssistantButton
          audioLevel={audioLevel}
          callStatus={callStatus}
          toggleCall={toggleCall}
        />
      </div>
    </>
  );
}

export { Assistant };
