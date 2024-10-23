import React, { useEffect, useState } from "react";
import { Menu } from "./Menu";
import { ErrorBoundary } from 'react-error-boundary';
import { CategorizedMenu } from "~/types/menu.types";
import { vapi } from "~/lib/vapi.sdk";
import { Message, MessageTypeEnum, ToolCallsMessage } from "~/types/conversation.type";

interface DisplayProps {
  initialMenu: CategorizedMenu;
}

export function Display({ initialMenu }: DisplayProps) {
  const [menu, setMenu] = useState<CategorizedMenu>(initialMenu);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentMessage, setCurrentMessage] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = (message: Message) => {
      console.log("Received message in Display:", JSON.stringify(message, null, 2));

      if (message.type === MessageTypeEnum.TOOL_CALLS) {
        const toolCallsMessage = message as ToolCallsMessage;
        const selectCategoryCall = toolCallsMessage.toolCalls.find(
          call => call.function.name === "selectCategory"
        );

        if (selectCategoryCall) {
          const { category } = selectCategoryCall.function.arguments;
          if (typeof category === 'string') {
            setSelectedCategory(category);
          } else {
            console.error("Invalid category type:", category);
          }
        }
      } else if (message.type === MessageTypeEnum.TRANSCRIPT) {
        if (message.transcriptType === "final") {
          setMessages(prev => [...prev, { role: message.role, content: message.transcript }]);
          setCurrentMessage(null);
        } else {
          setCurrentMessage({ role: message.role, content: message.transcript });
        }
      }
    };

    const reset = () => {
      setMenu(initialMenu);
      setMessages([]);
      setCurrentMessage(null);
      setSelectedCategory(null);
    };

    vapi.on("message", handleMessage);
    vapi.on("call-end", reset);

    return () => {
      vapi.off("message", handleMessage as any);
      vapi.off("call-end", reset as any);
    };
  }, [initialMenu]);

  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <div className="flex flex-col h-screen">
        <header className="text-center py-4">
          <h1 className="text-2xl font-bold">Welcome to Tic-Taco</h1>
          <p className="text-sm text-gray-600">Talk with our AI assistant to explore our menu and place an order.</p>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-2/3 overflow-y-auto p-4">
            {selectedCategory ? (
              <Menu menu={{ [selectedCategory]: menu[selectedCategory] }} />
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(menu).map(([category, items]) => (
                  <div key={category} className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-2">{category}</h3>
                    <p className="text-gray-600">{items.length} items</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Conversation part commented out
          <div className="w-1/3 flex flex-col">
            <div className="flex-grow overflow-y-auto p-4">
              <h2 className="text-2xl font-bold mb-4">Conversation</h2>
              {messages.map((msg, index) => (
                <div key={index} className={`mb-4 p-2 rounded ${msg.role === 'assistant' ? 'bg-blue-100' : 'bg-green-100'}`}>
                  <strong>{msg.role === 'assistant' ? 'Assistant' : 'You'}:</strong> {msg.content}
                </div>
              ))}
              {currentMessage && (
                <div className={`mb-4 p-2 rounded ${currentMessage.role === 'assistant' ? 'bg-blue-100' : 'bg-green-100'} opacity-50`}>
                  <strong>{currentMessage.role === 'assistant' ? 'Assistant' : 'You'}:</strong> {currentMessage.content}
                </div>
              )}
            </div>
          </div>
          */}
        </div>
      </div>
    </ErrorBoundary>
  );
}
