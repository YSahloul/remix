import { ToolCallsPayload, ToolCallsMessageResponse, ToolCallResult, ToolCall } from "../types/vapi.types";
import { Bindings } from "../types/hono.types";
import { fetchMenu } from "../tools/fetchMenu";
import { fetchImages, MenuItemImage } from "../tools/fetchImages";

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
          console.log("Menu fetched successfully:", JSON.stringify(menu, jsonSerializer, 2));
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

      case 'fetchImages':
        try {
          // Remove JSON.parse and directly access the arguments
          const { itemIds } = toolCall.function.arguments as { itemIds: string[] };
          const images: MenuItemImage[] = await fetchImages(bindings, itemIds);
          console.log("Images fetched successfully:", JSON.stringify(images));
          return {
            name: toolCall.function.name,
            toolCallId: toolCall.id,
            result: JSON.stringify(images)
          };
        } catch (error) {
          console.error(`Error in fetchImages:`, error);
          return {
            name: toolCall.function.name,
            toolCallId: toolCall.id,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
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
