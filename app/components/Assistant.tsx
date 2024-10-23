import React from "react";
import { AssistantButton } from "./AssistantButton";
import { Display } from "./Display";

function Assistant() {
  return (
    <>
      <div className="chat-history">
        <Display />
      </div>
      <div className="user-input">
        <AssistantButton />
      </div>
    </>
  );
}

export { Assistant };
