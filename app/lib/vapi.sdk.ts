import Vapi from "@vapi-ai/web";
import { assistant } from "~/assistants/assistant";

let vapiInstance: Vapi | null = null;

// Use the correct VapiEventNames from the Vapi class
export type VapiEventNames =
  | 'call-end'
  | 'call-start'
  | 'volume-level'
  | 'speech-start'
  | 'speech-end'
  | 'message'
  | 'video'
  | 'error';

export function initializeVapi(token: string): Promise<Vapi> {
  console.log("initializeVapi called with token:", token);
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined") {
      console.log("Window is defined, creating Vapi instance");
      try {
        vapiInstance = new Vapi(token);
        console.log("Vapi instance created successfully");
        
        // Set up event listeners for debugging
        vapiInstance.on('error', (error) => console.error('Vapi error:', error));
        vapiInstance.on('call-end', () => console.log('Call ended'));
        vapiInstance.on('call-start', () => console.log('Call started'));
        
        resolve(vapiInstance);
      } catch (error) {
        console.error("Error creating Vapi instance:", error);
        reject(error);
      }
    } else {
      console.error("Window is undefined. Cannot initialize Vapi.");
      reject(new Error("Window is undefined. Cannot initialize Vapi."));
    }
  });
}

export function getVapi() {
  if (!vapiInstance) {
    throw new Error("Vapi not initialized. Call initializeVapi() first.");
  }
  return vapiInstance;
}

export async function startVapiCall() {
  const vapi = getVapi();
  try {
    console.log("Starting Vapi call with assistant:", assistant);
    await vapi.start(assistant);
    console.log("Vapi call started successfully");
  } catch (error) {
    console.error("Error starting Vapi call:", error);
    throw error;
  }
}

export const vapi = {
  get instance() {
    return getVapi();
  },
  on(event: VapiEventNames, callback: (...args: any[]) => void) {
    const instance = this.instance;
    if (instance) {
      instance.on(event, callback);
    } else {
      console.warn(`Cannot add listener for '${event}'. Vapi instance is null.`);
    }
  },
  off(event: VapiEventNames, callback: (...args: any[]) => void) {
    const instance = this.instance;
    if (instance) {
      instance.off(event, callback);
    } else {
      console.warn(`Cannot remove listener for '${event}'. Vapi instance is null.`);
    }
  },
  send(message: string) {
    const instance = this.instance;
    if (instance) {
      instance.send({ type: 'say', message });
    } else {
      console.warn('Cannot send message. Vapi instance is null.');
    }
  }
};
