import Vapi from "@vapi-ai/web";

let vapiInstance: Vapi | null = null;

export function initializeVapi(token: string) {
  if (typeof window !== "undefined" && !vapiInstance) {
    vapiInstance = new Vapi(token);
  }
  return vapiInstance;
}

export function getVapi() {
  if (!vapiInstance) {
    console.warn("Vapi not initialized. Call initializeVapi() first.");
    return null;
  }
  return vapiInstance;
}

// Define our own event names type based on Vapi's methods
type VapiEventNames = Parameters<Vapi['on']>[0];

export const vapi = {
  get instance() {
    return getVapi();
  },
  on(event: VapiEventNames, callback: Parameters<Vapi['on']>[1]) {
    const instance = this.instance;
    if (instance) {
      instance.on(event, callback);
    } else {
      console.warn(`Cannot add listener for '${event}'. Vapi instance is null.`);
    }
  },
  off(event: VapiEventNames, callback: Parameters<Vapi['off']>[1]) {
    const instance = this.instance;
    if (instance) {
      instance.off(event, callback);
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
  }
};
