import { useCallback } from 'react';
import { createAssistant } from '~/assistants/assistant';
import { getVapi } from '~/lib/vapi.sdk';
import { useVapiContext } from '~/contexts/VapiContext';
import { MenuType } from '~/types/menu.types';

export enum CALL_STATUS {
  INACTIVE = "inactive",
  ACTIVE = "active",
  LOADING = "loading",
}

export function useVapi() {
  const { state, dispatch } = useVapiContext();

  const start = useCallback(async (menu: MenuType) => {
    const vapi = getVapi();
    if (!vapi) {
      console.error("Vapi instance not initialized");
      return;
    }
    dispatch({ type: 'SET_CALL_STATUS', payload: CALL_STATUS.LOADING });
    try {
      const assistant = createAssistant(menu);
      const response = await vapi.start(assistant);
      console.log("call started successfully", response);
      dispatch({ type: 'SET_CALL_STATUS', payload: CALL_STATUS.ACTIVE });
      dispatch({ type: 'SET_MENU', payload: menu });
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
    dispatch({ type: 'SET_CALL_STATUS', payload: CALL_STATUS.INACTIVE });
  }, [dispatch]);

  const toggleCall = useCallback((menu: MenuType) => {
    if (state.callStatus === CALL_STATUS.ACTIVE) {
      stop();
    } else {
      start(menu);
    }
  }, [state.callStatus, start, stop]);

  return {
    ...state,
    start,
    stop,
    toggleCall,
  };
}
