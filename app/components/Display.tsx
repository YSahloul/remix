import React, { useEffect, useState, useCallback } from "react";
import { Message, MessageTypeEnum, ToolCallResultMessage } from "~/types/conversation.type";
import { vapi } from "~/lib/vapi.sdk";
import { MenuComponent } from "./Menu";
import { ErrorBoundary } from 'react-error-boundary';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  variations: { id: string; name: string; price: string }[];
}

interface CategorizedMenu {
  [category: string]: MenuItem[];
}

export function Display() {
  const [menu, setMenu] = useState<CategorizedMenu>({});
  const [status, setStatus] = useState<"loading" | "menu">("loading");

  const onMessageUpdate = useCallback((message: any) => {
    console.log("Received message in Display:", JSON.stringify(message, null, 2));

    if (message.type === "tool_call_result" && message.name === "fetchMenu") {
      try {
        const fetchedMenu = JSON.parse(message.result);
        console.log("Parsed menu in Display:", JSON.stringify(fetchedMenu, null, 2));
        if (fetchedMenu && typeof fetchedMenu === 'object') {
          setMenu(fetchedMenu);
          setStatus("menu");
          console.log("Updated menu state:", JSON.stringify(fetchedMenu, null, 2));
          console.log("Updated status:", "menu");
        } else {
          console.error("Received invalid menu data:", fetchedMenu);
        }
      } catch (error) {
        console.error("Error parsing fetchMenu result:", error);
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
    console.log("Menu state updated:", JSON.stringify(menu, null, 2));
  }, [menu]);

  useEffect(() => {
    console.log("Status state updated:", status);
  }, [status]);

  console.log("Rendering Display. Status:", status, "Menu:", JSON.stringify(menu, null, 2));

  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      {status === "menu" && Object.keys(menu).length > 0 ? (
        <MenuComponent menu={menu} />
      ) : (
        <div>Loading menu...</div>
      )}
    </ErrorBoundary>
  );
}
