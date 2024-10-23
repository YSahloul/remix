import React, { createContext, useContext, useState, useEffect } from 'react';
import { CategorizedMenu } from "~/types/menu.types";
import { useVapiContext } from "./VapiContext";
import { MessageTypeEnum, ToolCallsMessage } from "~/types/conversation.type";
import { ToolCall } from "~/types/vapi.types";

interface MenuContextType {
  menu: CategorizedMenu;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children, initialMenu }: { children: React.ReactNode; initialMenu: CategorizedMenu }) {
  const [menu, setMenu] = useState<CategorizedMenu>(initialMenu);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { state } = useVapiContext();
  const { messages } = state;

  useEffect(() => {
    // Process messages to update selected category
    messages.forEach(message => {
      if (message.type === MessageTypeEnum.TOOL_CALLS) {
        const toolCallsMessage = message as ToolCallsMessage;
        const selectCategoryCall = toolCallsMessage.toolCalls.find(
          call => call.function.name === "selectCategory"
        ) as ToolCall | undefined;

        if (selectCategoryCall) {
          try {
            let category: string;
            if (typeof selectCategoryCall.function.arguments === 'string') {
              const args = JSON.parse(selectCategoryCall.function.arguments);
              category = args.category;
            } else if (typeof selectCategoryCall.function.arguments === 'object' && selectCategoryCall.function.arguments !== null) {
              category = selectCategoryCall.function.arguments.category;
            } else {
              throw new Error('Invalid arguments for selectCategory');
            }

            if (typeof category === 'string') {
              setSelectedCategory(category);
            } else {
              console.error("Invalid category type:", category);
            }
          } catch (error) {
            console.error("Error parsing selectCategory arguments:", error);
          }
        }
      }
    });
  }, [messages]);

  return (
    <MenuContext.Provider value={{ menu, selectedCategory, setSelectedCategory }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenuContext() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenuContext must be used within a MenuProvider');
  }
  return context;
}
