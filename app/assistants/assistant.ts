import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";

export const assistant: CreateAssistantDTO = {
  name: "Order-Assistant",
  model: {
    provider: "openai",
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content: "You're an AI assistant who can help users order food from Tic-Taco, a Mexican restaurant. You can fetch the menu, suggest items, and help place orders. Be friendly and helpful in guiding the user through the ordering process."
      }
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "fetchMenu",
          description: "Fetches the restaurant menu from Square.",
          parameters: {
            type: "object",
            properties: {},
            required: [],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "fetchImages",
          description: "Fetches images for specified menu items.",
          parameters: {
            type: "object",
            properties: {
              itemIds: {
                type: "array",
                items: { type: "string" },
                description: "Array of item IDs to fetch images for",
              },
            },
            required: ["itemIds"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "createOrder",
          description: "Creates an order with the specified items.",
          parameters: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    catalogObjectId: { type: "string" },
                    quantity: { type: "string" },
                  },
                  required: ["catalogObjectId", "quantity"],
                },
              },
            },
            required: ["items"],
          },
        },
      },
    ],
  },
  voice: {
    provider: "11labs",
    voiceId: "paula",
  },
  firstMessage: "Welcome to our restaurant! How can I assist you with your order today?",
  serverUrl: process.env.VAPI_SERVER_URL,
};
