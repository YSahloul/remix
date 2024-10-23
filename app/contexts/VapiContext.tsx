import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Message, TranscriptMessage } from '~/types/conversation.type';
import { getVapi, VapiEventNames } from '~/lib/vapi.sdk';
import { CALL_STATUS } from '~/hooks/useVapi';

type VapiState = {
  isSpeechActive: boolean;
  callStatus: CALL_STATUS;
  messages: Message[];
  activeTranscript: TranscriptMessage | null;
  audioLevel: number;
};

type VapiAction =
  | { type: 'SET_SPEECH_ACTIVE'; payload: boolean }
  | { type: 'SET_CALL_STATUS'; payload: CALL_STATUS }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_ACTIVE_TRANSCRIPT'; payload: TranscriptMessage | null }
  | { type: 'SET_AUDIO_LEVEL'; payload: number };

const initialState: VapiState = {
  isSpeechActive: false,
  callStatus: CALL_STATUS.INACTIVE,
  messages: [],
  activeTranscript: null,
  audioLevel: 0,
};

const VapiContext = createContext<{
  state: VapiState;
  dispatch: React.Dispatch<VapiAction>;
} | undefined>(undefined);

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
    default:
      return state;
  }
}

export function VapiProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(vapiReducer, initialState);
  console.log("VapiProvider initialized");

  useEffect(() => {
    const vapi = getVapi();
    console.log("Vapi instance in VapiProvider:", vapi);

    const eventListeners: Partial<Record<VapiEventNames, (...args: any[]) => void>> = {
      'speech-start': () => dispatch({ type: 'SET_SPEECH_ACTIVE', payload: true }),
      'speech-end': () => dispatch({ type: 'SET_SPEECH_ACTIVE', payload: false }),
      message: (message) => dispatch({ type: 'ADD_MESSAGE', payload: message }),
      'volume-level': (level) => dispatch({ type: 'SET_AUDIO_LEVEL', payload: level }),
      'call-start': () => {
        console.log("Call started");
        dispatch({ type: 'SET_CALL_STATUS', payload: CALL_STATUS.ACTIVE });
      },
      'call-end': () => {
        console.log("Call ended");
        dispatch({ type: 'SET_CALL_STATUS', payload: CALL_STATUS.INACTIVE });
      },
      error: (error) => {
        console.error('Vapi error:', error);
        dispatch({ type: 'SET_CALL_STATUS', payload: CALL_STATUS.INACTIVE });
      },
    };

    // Set up event listeners
    Object.entries(eventListeners).forEach(([event, listener]) => {
      if (listener) {
        vapi.on(event as VapiEventNames, listener);
      }
    });

    return () => {
      // Clean up event listeners
      Object.entries(eventListeners).forEach(([event, listener]) => {
        if (listener) {
          vapi.off(event as VapiEventNames, listener);
        }
      });
    };
  }, []);

  return (
    <VapiContext.Provider value={{ state, dispatch }}>
      {children}
    </VapiContext.Provider>
  );
}

export function useVapiContext() {
  const context = useContext(VapiContext);
  if (context === undefined) {
    throw new Error('useVapiContext must be used within a VapiProvider');
  }
  return context;
}
