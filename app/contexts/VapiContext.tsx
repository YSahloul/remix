import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { Message, TranscriptMessage } from '~/types/conversation.type';
import { vapi } from '~/lib/vapi.sdk';
import { CALL_STATUS } from '~/hooks/useVapi';
import { MenuType } from '~/types/menu.types';

type VapiState = {
  isSpeechActive: boolean;
  callStatus: CALL_STATUS;
  messages: Message[];
  activeTranscript: TranscriptMessage | null;
  audioLevel: number;
  menu: MenuType | null;
};

type VapiAction =
  | { type: 'SET_SPEECH_ACTIVE'; payload: boolean }
  | { type: 'SET_CALL_STATUS'; payload: CALL_STATUS }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_ACTIVE_TRANSCRIPT'; payload: TranscriptMessage | null }
  | { type: 'SET_AUDIO_LEVEL'; payload: number }
  | { type: 'SET_MENU'; payload: MenuType };

const initialState: VapiState = {
  isSpeechActive: false,
  callStatus: CALL_STATUS.INACTIVE,
  messages: [],
  activeTranscript: null,
  audioLevel: 0,
  menu: null,
};

function vapiReducer(state: VapiState, action: VapiAction): VapiState {
  switch (action.type) {
    case 'SET_SPEECH_ACTIVE':
      return { ...state, isSpeechActive: action.payload };
    case 'SET_CALL_STATUS':
      return { ...state, callStatus: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_ACTIVE_TRANSCRIPT':
      return { ...state, activeTranscript: action.payload };
    case 'SET_AUDIO_LEVEL':
      return { ...state, audioLevel: action.payload };
    case 'SET_MENU':
      return { ...state, menu: action.payload };
    default:
      return state;
  }
}

const VapiContext = createContext<{
  state: VapiState;
  dispatch: React.Dispatch<VapiAction>;
} | undefined>(undefined);

export const VapiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(vapiReducer, initialState);

  useEffect(() => {
    vapi.on('volume-level', (level: number) => {
      dispatch({ type: 'SET_AUDIO_LEVEL', payload: level });
    });
    vapi.on('speech-start', () => dispatch({ type: 'SET_SPEECH_ACTIVE', payload: true }));
    vapi.on('speech-end', () => dispatch({ type: 'SET_SPEECH_ACTIVE', payload: false }));
    vapi.on('message', (message) => dispatch({ type: 'ADD_MESSAGE', payload: message }));

    return () => {
      vapi.removeAllListeners('volume-level');
      vapi.removeAllListeners('speech-start');
      vapi.removeAllListeners('speech-end');
      vapi.removeAllListeners('message');
    };
  }, []);

  const contextValue = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <VapiContext.Provider value={contextValue}>
      {children}
    </VapiContext.Provider>
  );
};

export function useVapiContext() {
  const context = useContext(VapiContext);
  if (context === undefined) {
    throw new Error('useVapiContext must be used within a VapiProvider');
  }
  return context;
}
