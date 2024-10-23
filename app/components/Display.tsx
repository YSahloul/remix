import React, { useEffect, useState, useCallback } from "react";
import { vapi } from "~/lib/vapi.sdk";
import { Menu } from "./Menu";
import { ErrorBoundary } from 'react-error-boundary';
import { CategorizedMenu } from "~/types/menu.types";
import { MenuItemImage } from "~/tools/fetchImages";

interface Message {
  role: string;
  content: string;
}

interface DisplayProps {
  initialMenu?: CategorizedMenu;
}

export function Display({ initialMenu = {} }: DisplayProps) {
  const [menu, setMenu] = useState<CategorizedMenu>(initialMenu);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const onMessageUpdate = useCallback((message: any) => {
    console.log("Received message in Display:", JSON.stringify(message, null, 2));

    if (message.type === "tool_call_result" && message.name === "fetchMenu") {
      try {
        const fetchedMenu: CategorizedMenu = JSON.parse(message.result);
        setMenu(fetchedMenu);
      } catch (error) {
        console.error("Error parsing fetchMenu result:", error);
      }
    } else if (message.type === "tool_call_result" && message.name === "fetchImages") {
      try {
        const fetchedImages: MenuItemImage[] = JSON.parse(message.result);
        if (fetchedImages.length > 0) {
          setImageUrl(fetchedImages[0].imageUrl);
        }
      } catch (error) {
        console.error("Error parsing fetchImages result:", error);
      }
    } else if (message.type === "transcript") {
      if (message.transcriptType === "final") {
        setMessages(prev => [...prev, { role: message.role, content: message.transcript }]);
        setCurrentMessage(null);
      } else {
        setCurrentMessage({ role: message.role, content: message.transcript });
      }
    }
  }, []);

  useEffect(() => {
    vapi.on("message", onMessageUpdate);
    return () => {
      vapi.off("message", onMessageUpdate as any);
    };
  }, [onMessageUpdate]);

  useEffect(() => {
    console.log("Current menu state:", JSON.stringify(menu, null, 2));
  }, [menu]);

  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <div className="flex h-screen">
        <div className="w-2/3 overflow-y-auto p-4 border-r">
          <Menu menu={menu} />
          {imageUrl && (
            <div className="mt-4">
              <img src={imageUrl} alt="Menu item" className="max-w-full h-auto rounded-lg shadow-lg" />
            </div>
          )}
        </div>
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
          <div className="p-4 border-t">
            {/* You can add an input field here for text-based interaction if needed */}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
