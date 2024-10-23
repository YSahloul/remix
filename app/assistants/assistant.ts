import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";
import { MenuType } from '~/types/menu.types';

export const createAssistant = (menu: MenuType): CreateAssistantDTO => ({
  name: "Order-Assistant",
  model: {
    provider: "openai",
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content: `You're an AI assistant who can help users order food from Tic-Taco, a Mexican restaurant. Here's the current menu:

${JSON.stringify(menu, null, 2)}

Follow these guidelines:

1. Only suggest and add items that are available on the menu provided above. Do not hallucinate or add items that are not on the menu.
2. When users ask about specific menu categories or want to see different parts of the menu, use the selectCategory function to change the displayed menu. The available categories are: Starters, Main Menu, and Drinks.
3. After using selectCategory, inform the user that the menu display has been updated to show the requested category.
4. When discussing specific menu items, use the displayImages function to show images to the user.
5. After displaying an image, inform the user that an image has been shown. Do not read out or mention the image URL.
6. Make recommendations based on user preferences and answer specific questions about menu items, but only for items that are actually on the menu.
7. Be friendly and helpful in guiding the user through the ordering process.
8. The menu will be displayed to the user automatically based on the selected category, so you don't need to list all items.
9. Use the updateOrderNotes function to keep track of the customer's current order as they make selections or changes.
10. When using the updateOrderNotes function:
    - For adding items: use the "add" action with the correct item name and quantity.
    - For removing items: use the "remove" action with the correct item name.
    - For updating items: use the "update" action with the correct item name and new details.
    - Always use the exact item name as it appears in the menu.
    - Confirm the action with the user before making changes to the order.
11. If a user requests an item that is not on the menu, politely inform them that the item is not available and suggest similar items from the actual menu.

Remember to use the selectCategory function whenever users ask about different parts of the menu or want to see items from a specific category. This will update the menu display for the user. Use the displayImages function when discussing specific menu items to enhance the user experience with visual information. Keep the order notes updated throughout the conversation using the updateOrderNotes function for every change in the order.`
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
      {
        type: "function",
        function: {
          name: "updateOrderNotes",
          description: "Updates the customer's current order notes.",
          parameters: {
            type: "object",
            properties: {
              action: {
                type: "string",
                description: "The action to perform on the order notes. Must be one of: add, remove, update, clear"
              },
              item: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  quantity: { type: "number" },
                  notes: { type: "string" }
                },
                required: ["name", "quantity"]
              }
            },
            required: ["action"]
          },
        },
      },
    ],
  },
  voice: {
    provider: "11labs",
    voiceId: "paula",
  },
  transcriber: {
    provider: "deepgram",
    model: "nova-2-phonecall",
    language: "en-US",
    keywords: [

      "Flautas:1"
    ]
  },
  firstMessage: "Welcome to Tic-Taco! I'll fetch our latest menu for you. How can I assist you with your order today?",
  serverUrl: process.env.VAPI_SERVER_URL,
});
