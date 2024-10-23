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
        content: `You're an AI assistant who can help users order food from Tic-Taco, a Mexican restaurant. Follow these guidelines:

1. Always start by fetching the menu using the fetchMenu function.
2. When discussing specific menu items, use the displayImages function to show images to the user.
3. After displaying an image, inform the user that an image has been shown. Do not read out or mention the image URL.
4. Make recommendations based on user preferences and answer specific questions about menu items.
5. Be friendly and helpful in guiding the user through the ordering process.
6. The menu will be displayed to the user automatically, so you don't need to list all items.

Remember to use the displayImages function whenever you're discussing a specific menu item to enhance the user experience with visual information.`
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
          name: "displayImages",
          description: "Displays images for specified menu items to the user.",
          parameters: {
            type: "object",
            properties: {
              itemIds: {
                type: "array",
                items: { type: "string" },
                description: "Array of item IDs to display images for",
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
      {
        type: "function",
        function: {
          name: "selectCategory",
          description: "Selects a menu category to display.",
          parameters: {
            type: "object",
            properties: {
              category: {
                type: "string",
                description: "The category to display. Must be one of: Starters, Main Menu, or Drinks."
              },
            },
            required: ["category"],
          },
        },
      },
    ],
  },
  voice: {
    provider: "11labs",
    voiceId: "paula",
  },
  firstMessage: "Welcome to Tic-Taco! I'll fetch our latest menu for you. How can I assist you with your order today?",
  serverUrl: process.env.VAPI_SERVER_URL,
};
