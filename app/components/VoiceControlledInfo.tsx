import React, { useEffect, useState } from 'react';
import { useVapiContext } from '~/contexts/VapiContext';
import { MessageTypeEnum, AssistantMessage, ToolCallsMessage, ToolCallResultMessage } from '~/types/conversation.type';

interface OrderItem {
  name: string;
  quantity: number;
  notes?: string;
}

export function VoiceControlledInfo() {
  const { state } = useVapiContext();
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [orderNotes, setOrderNotes] = useState<OrderItem[]>([]);

  useEffect(() => {
    // Listen for new messages from the AI
    const lastMessage = state.messages[state.messages.length - 1];
    if (lastMessage && lastMessage.type === MessageTypeEnum.ASSISTANT_MESSAGE) {
      const assistantMessage = lastMessage as AssistantMessage;
      setAiResponse(assistantMessage.content);
    } else if (lastMessage && lastMessage.type === MessageTypeEnum.TOOL_CALLS) {
      const toolCallsMessage = lastMessage as ToolCallsMessage;
      const updateOrderNotesCall = toolCallsMessage.toolCalls.find(
        call => call.function.name === "updateOrderNotes"
      );
      if (updateOrderNotesCall) {
        const args = updateOrderNotesCall.function.arguments;
        const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args;
        handleUpdateOrderNotes(parsedArgs);
      }
    } else if (lastMessage && lastMessage.type === MessageTypeEnum.TOOL_CALL_RESULT) {
      const toolCallResultMessage = lastMessage as ToolCallResultMessage;
      if (toolCallResultMessage.name === "updateOrderNotes") {
        // Optionally handle the result of updateOrderNotes if needed
      }
    }
  }, [state.messages]);

  const handleUpdateOrderNotes = (args: { action: string; item?: OrderItem }) => {
    setOrderNotes(prevNotes => {
      switch (args.action) {
        case "add":
          return [...prevNotes, args.item!];
        case "remove":
          return prevNotes.filter(item => item.name !== args.item!.name);
        case "update":
          return prevNotes.map(item => 
            item.name === args.item!.name ? { ...item, ...args.item } : item
          );
        case "clear":
          return [];
        default:
          return prevNotes;
      }
    });
  };

  return (
    <div className="voice-controlled-info bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">AI Assistant Info</h3>
      {aiResponse && (
        <p className="text-gray-700 mb-4">{aiResponse}</p>
      )}
      <div className="mt-2">
        <h4 className="text-md font-semibold mb-2">Current Order:</h4>
        {orderNotes.length > 0 ? (
          <ul className="list-disc pl-5">
            {orderNotes.map((item, index) => (
              <li key={index} className="mb-1">
                {item.quantity}x {item.name} {item.notes && `(${item.notes})`}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No items in the order yet.</p>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-600">
          Speech Active: {state.isSpeechActive ? 'Yes' : 'No'}
        </p>
        <p className="text-sm text-gray-600">
          Call Status: {state.callStatus}
        </p>
      </div>
    </div>
  );
}
