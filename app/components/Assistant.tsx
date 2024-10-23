import React, { useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { OrbAssistant } from "./OrbAssistant";
import { Display } from "./Display";
import { useVapiContext } from '~/contexts/VapiContext';
import { useMenuContext } from '~/contexts/MenuContext';
import { createAssistant } from '~/assistants/assistant';
import { vapi } from '~/lib/vapi.sdk';

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
    </div>
  );
}

export function Assistant() {
  const { state } = useVapiContext();
  const { menu } = useMenuContext();
  const [isCallActive, setIsCallActive] = useState(false);

  useEffect(() => {
    if (menu && !isCallActive) {
      console.log("Assistant: Initializing assistant with menu", menu);
      const assistant = createAssistant(menu);
      vapi.instance?.start(assistant);
      setIsCallActive(true);
    }
  }, [menu, isCallActive]);

  console.log("Assistant: Rendering Assistant component");

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="flex flex-col h-screen">
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            <Display />
            <OrbAssistant />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}