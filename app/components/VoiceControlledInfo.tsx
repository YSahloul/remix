import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useVapiContext } from '~/contexts/VapiContext';
import { MessageTypeEnum, ToolCallsMessage, ToolCallResultMessage } from '~/types/conversation.type';

interface OrderItem {
    name: string;
    quantity: number;
    notes?: string;
}

interface UpdateOrderNotesArgs {
    action: string;
    item?: OrderItem;
}

export function VoiceControlledInfo() {
    const { state } = useVapiContext();
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [orderNotes, setOrderNotes] = useState<OrderItem[]>([]);
    const lastProcessedMessageIndex = useRef(-1);

    const handleUpdateOrderNotes = useCallback((args: UpdateOrderNotesArgs) => {
        console.log("Handling update order notes:", args);
        setOrderNotes(prevNotes => {
            let newNotes = [...prevNotes];
            switch (args.action) {
                case "add":
                    if (args.item) {
                        const existingItemIndex = newNotes.findIndex(item => item.name.toLowerCase() === args.item!.name.toLowerCase());
                        if (existingItemIndex !== -1) {
                            newNotes[existingItemIndex].quantity += args.item.quantity;
                        } else {
                            newNotes.push(args.item);
                        }
                    }
                    break;
                case "remove":
                    if (args.item) {
                        newNotes = newNotes.filter(item => item.name.toLowerCase() !== args.item!.name.toLowerCase());
                    }
                    break;
                case "update":
                    if (args.item) {
                        const itemIndex = newNotes.findIndex(item => item.name.toLowerCase() === args.item!.name.toLowerCase());
                        if (itemIndex !== -1) {
                            newNotes[itemIndex] = { ...newNotes[itemIndex], ...args.item };
                        }
                    }
                    break;
                case "clear":
                    newNotes = [];
                    break;
            }
            console.log("Updated order notes:", newNotes);
            return newNotes;
        });
    }, []);

    useEffect(() => {
        const processNewMessages = () => {
            console.log("Processing new messages. Current state:", state.messages);
            for (let i = lastProcessedMessageIndex.current + 1; i < state.messages.length; i++) {
                const message = state.messages[i];
                console.log(`Processing message ${i}:`, message);

                if (message.type === MessageTypeEnum.ASSISTANT_MESSAGE) {
                    setAiResponse(message.content);
                } else if (message.type === MessageTypeEnum.TOOL_CALLS) {
                    const toolCallsMessage = message as ToolCallsMessage;
                    const updateOrderNotesCall = toolCallsMessage.toolCalls.find(
                        call => call.function.name === "updateOrderNotes"
                    );
                    if (updateOrderNotesCall) {
                        try {
                            let args: UpdateOrderNotesArgs;
                            if (typeof updateOrderNotesCall.function.arguments === 'string') {
                                args = JSON.parse(updateOrderNotesCall.function.arguments);
                            } else {
                                args = updateOrderNotesCall.function.arguments as UpdateOrderNotesArgs;
                            }
                            handleUpdateOrderNotes(args);
                        } catch (error) {
                            console.error("Error parsing updateOrderNotes arguments:", error);
                        }
                    }
                } else if (message.type === MessageTypeEnum.TOOL_CALL_RESULT) {
                    const toolCallResultMessage = message as ToolCallResultMessage;
                    if (toolCallResultMessage.name === "updateOrderNotes") {
                        try {
                            const result = JSON.parse(toolCallResultMessage.result) as { action: string; item?: OrderItem };
                            if (result.action) {
                                handleUpdateOrderNotes(result);
                            }
                        } catch (error) {
                            console.error("Error parsing updateOrderNotes result:", error);
                        }
                    }
                }

                lastProcessedMessageIndex.current = i;
            }
        };

        processNewMessages();
    }, [state.messages, handleUpdateOrderNotes]);

    // New effect to handle immediate updates
    useEffect(() => {
        const lastMessage = state.messages[state.messages.length - 1];
        if (lastMessage && lastMessage.type === MessageTypeEnum.TOOL_CALLS) {
            const toolCallsMessage = lastMessage as ToolCallsMessage;
            const updateOrderNotesCall = toolCallsMessage.toolCalls.find(
                call => call.function.name === "updateOrderNotes"
            );
            if (updateOrderNotesCall) {
                try {
                    let args: UpdateOrderNotesArgs;
                    if (typeof updateOrderNotesCall.function.arguments === 'string') {
                        args = JSON.parse(updateOrderNotesCall.function.arguments);
                    } else {
                        args = updateOrderNotesCall.function.arguments as UpdateOrderNotesArgs;
                    }
                    handleUpdateOrderNotes(args);
                } catch (error) {
                    console.error("Error parsing updateOrderNotes arguments:", error);
                }
            }
        }
    }, [state.messages, handleUpdateOrderNotes]);

    return (
        <div className="voice-controlled-info bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Your Order</h3>
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
