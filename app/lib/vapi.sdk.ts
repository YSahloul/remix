import Vapi from "@vapi-ai/web";
import { MenuType } from '~/types/menu.types';
import { createAssistant } from '~/assistants/assistant';

// Define VapiEventNames based on the vapi.d.ts file
export type VapiEventNames = 'call-end' | 'call-start' | 'volume-level' | 'speech-start' | 'speech-end' | 'message' | 'video' | 'error';

let vapiInstance: Vapi | null = null;

export function initializeVapi(token: string): Vapi | null {
  console.log("initializeVapi: Starting initialization");
  if (typeof window !== "undefined" && !vapiInstance) {
    console.log("initializeVapi: Creating new Vapi instance");
    vapiInstance = new Vapi(token);
    console.log("initializeVapi: Vapi instance created successfully");
  } else if (vapiInstance) {
    console.log("initializeVapi: Vapi instance already exists");
  } else {
    console.warn("initializeVapi: Window is undefined, cannot create Vapi instance");
  }
  return vapiInstance;
}

export function getVapi(): Vapi | null {
  return vapiInstance;
}

export async function startVapiCall(menu: MenuType) {
  const vapi = getVapi();
  if (!vapi) {
    console.error("Vapi instance not initialized");
    return null;
  }
  try {
    const assistant = createAssistant(menu);
    const response = await vapi.start(assistant);
    console.log("call started successfully", response);
    return response;
  } catch (error) {
    console.error("Failed to start call:", error);
    return null;
  }
}

export const vapi = {
  get instance() {
    return getVapi();
  },
  on<E extends VapiEventNames>(event: E, listener: (...args: any[]) => void) {
    const instance = this.instance;
    if (instance) {
      instance.on(event, listener);
    } else {
      console.warn(`Cannot add listener for '${event}'. Vapi instance is null.`);
    }
  },
  off<E extends VapiEventNames>(event: E, listener: (...args: any[]) => void) {
    const instance = this.instance;
    if (instance) {
      instance.off(event, listener);
    } else {
      console.warn(`Cannot remove listener for '${event}'. Vapi instance is null.`);
    }
  },
  send(message: Parameters<Vapi['send']>[0]) {
    const instance = this.instance;
    if (instance) {
      instance.send(message);
    } else {
      console.warn('Cannot send message. Vapi instance is null.');
    }
  },
  async start(menu: MenuType) {
    return startVapiCall(menu);
  },
  removeAllListeners(event?: VapiEventNames) {
    const instance = this.instance;
    if (instance) {
      instance.removeAllListeners(event);
    } else {
      console.warn('Cannot remove listeners. Vapi instance is null.');
    }
  },
  stop() {
    const instance = this.instance;
    if (instance) {
      instance.stop();
    } else {
      console.warn('Cannot stop call. Vapi instance is null.');
    }
  }
};
