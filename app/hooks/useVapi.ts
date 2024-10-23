import { useCallback } from 'react';
import { assistant } from '~/assistants/assistant';
import { getVapi } from '~/lib/vapi.sdk';
import { useVapiContext } from '~/contexts/VapiContext';

export enum CALL_STATUS {
  INACTIVE = "inactive",
  ACTIVE = "active",
  LOADING = "loading",
}

export function useVapi() {
  const { state, dispatch } = useVapiContext();

  const start = useCallback(async () => {
    const vapi = getVapi();
    if (!vapi) {
      console.error("Vapi instance not initialized");
      return;
    }
    dispatch({ type: 'SET_CALL_STATUS', payload: CALL_STATUS.LOADING });
    try {
      const response = await vapi.start(assistant);
      console.log("call started successfully", response);
    } catch (error) {
      console.error("Failed to start call:", error);
      dispatch({ type: 'SET_CALL_STATUS', payload: CALL_STATUS.INACTIVE });
    }
  }, [dispatch]);

  const stop = useCallback(() => {
    const vapi = getVapi();
    if (!vapi) {
      console.error("Vapi instance not initialized");
      return;
    }
    dispatch({ type: 'SET_CALL_STATUS', payload: CALL_STATUS.LOADING });
    vapi.stop();
  }, [dispatch]);

  const toggleCall = useCallback(() => {
    if (state.callStatus === CALL_STATUS.ACTIVE) {
      stop();
    } else {
      start();
    }
  }, [state.callStatus, start, stop]);

  return {
    ...state,
    start,
    stop,
    toggleCall,
  };
}
