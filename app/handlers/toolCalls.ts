import { ToolCallsPayload, ToolCallsMessageResponse, ToolCallResult, ToolCall } from "../types/vapi.types";
import { Bindings } from "../types/hono.types";
import { fetchMenu } from "../tools/fetchMenu";

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
  if (toolCall.type === 'function' && toolCall.function.name === 'fetchMenu') {
    try {
      const menu = await fetchMenu(bindings);
      console.log("Menu fetched successfully:", JSON.stringify(menu, jsonSerializer, 2));
      const result = {
        name: toolCall.function.name,
        toolCallId: toolCall.id,
        result: JSON.stringify(menu, jsonSerializer)
      };
      console.log("Returning tool call result:", JSON.stringify(result, jsonSerializer, 2));
      return result;
    } catch (error) {
      console.error(`Error in fetchMenu:`, error);
      return {
        name: toolCall.function.name,
        toolCallId: toolCall.id,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  return {
    name: toolCall.function.name,
    toolCallId: toolCall.id,
    error: `Unsupported function: ${toolCall.function.name}`
  };
}
