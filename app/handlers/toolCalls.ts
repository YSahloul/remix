import { ToolCallsPayload, ToolCallsMessageResponse, ToolCallResult, ToolCall } from "../types/vapi.types";
import { Bindings } from "../types/hono.types";
import { fetchMenu } from "../tools/fetchMenu";
import { getImageUrlsById } from "../data/images";

// Custom JSON serializer to handle BigInt
const jsonSerializer = (key: string, value: any) => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
};

export const toolCallsHandler = async (
  payload: ToolCallsPayload,
  bindings: Bindings
): Promise<ToolCallsMessageResponse> => {
  console.log("Handling tool calls:", JSON.stringify(payload, jsonSerializer, 2));

  const results: ToolCallResult[] = [];

  for (const toolCall of payload.toolCalls) {
    const result = await handleToolCall(toolCall, bindings);
    results.push(result);
  }

  return { results };
};

async function handleToolCall(toolCall: ToolCall, bindings: Bindings): Promise<ToolCallResult> {
  if (toolCall.type === 'function') {
    switch (toolCall.function.name) {
      case 'fetchMenu':
        try {
          const menu = await fetchMenu(bindings);
          console.log("Menu fetched successfully:", JSON.stringify(menu, null, 2));
          return {
            name: toolCall.function.name,
            toolCallId: toolCall.id,
            result: JSON.stringify(menu)
          };
        } catch (error) {
          console.error(`Error in fetchMenu:`, error);
          return {
            name: toolCall.function.name,
            toolCallId: toolCall.id,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
          };
        }

      case 'displayImages':
        try {
          let itemIds: string[] = [];
          if (typeof toolCall.function.arguments === 'string') {
            const args = JSON.parse(toolCall.function.arguments);
            itemIds = Array.isArray(args.itemIds) ? args.itemIds : [];
          } else if (typeof toolCall.function.arguments === 'object' && toolCall.function.arguments !== null) {
            itemIds = Array.isArray(toolCall.function.arguments.itemIds) ? toolCall.function.arguments.itemIds : [];
          }
          
          console.log("Displaying images for itemIds:", itemIds);
          const imageUrls = getImageUrlsById(itemIds);
          console.log("Retrieved image URLs:", imageUrls);
          return {
            name: toolCall.function.name,
            toolCallId: toolCall.id,
            result: JSON.stringify(imageUrls)
          };
        } catch (error) {
          console.error(`Error in displayImages:`, error);
          return {
            name: toolCall.function.name,
            toolCallId: toolCall.id,
            error: error instanceof Error ? error.message : 'Error displaying images'
          };
        }

      case 'createOrder':
        // ... existing createOrder case ...

      case 'selectCategory':
        try {
          let category: string;
          if (typeof toolCall.function.arguments === 'string') {
            const args = JSON.parse(toolCall.function.arguments);
            category = args.category;
          } else if (typeof toolCall.function.arguments === 'object' && toolCall.function.arguments !== null) {
            category = toolCall.function.arguments.category;
          } else {
            throw new Error('Invalid arguments for selectCategory');
          }

          console.log("Selecting category:", category);
          return {
            name: toolCall.function.name,
            toolCallId: toolCall.id,
            result: JSON.stringify({ category })
          };
        } catch (error) {
          console.error(`Error in selectCategory:`, error);
          return {
            name: toolCall.function.name,
            toolCallId: toolCall.id,
            error: error instanceof Error ? error.message : 'Error selecting category'
          };
        }

      case 'updateOrderNotes':
        try {
          let action: string;
          let item: { name: string; quantity: number; notes?: string } | undefined;

          if (typeof toolCall.function.arguments === 'string') {
            const args = JSON.parse(toolCall.function.arguments);
            action = args.action;
            item = args.item;
          } else if (typeof toolCall.function.arguments === 'object' && toolCall.function.arguments !== null) {
            action = toolCall.function.arguments.action;
            item = toolCall.function.arguments.item;
          } else {
            throw new Error('Invalid arguments for updateOrderNotes');
          }

          console.log("Updating order notes:", { action, item });
          
          // Here, you would typically update the order notes in your backend or database
          // For this example, we'll just return a success message
          const result = {
            success: true,
            message: `Order notes updated: ${action} ${item ? item.name : ''}`,
          };

          return {
            name: toolCall.function.name,
            toolCallId: toolCall.id,
            result: JSON.stringify(result)
          };
        } catch (error) {
          console.error(`Error in updateOrderNotes:`, error);
          return {
            name: toolCall.function.name,
            toolCallId: toolCall.id,
            error: error instanceof Error ? error.message : 'Error updating order notes'
          };
        }

      default:
        return {
          name: toolCall.function.name,
          toolCallId: toolCall.id,
          error: `Unsupported function: ${toolCall.function.name}`
        };
    }
  }
  
  return {
    name: toolCall.function.name,
    toolCallId: toolCall.id,
    error: `Unsupported tool call type: ${toolCall.type}`
  };
}
