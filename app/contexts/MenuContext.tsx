import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { CategorizedMenu } from "~/types/menu.types";
import { useVapiContext } from "./VapiContext";
import { MessageTypeEnum, ToolCallsMessage, ToolCallResultMessage } from "~/types/conversation.type";
import { ToolCall } from "~/types/vapi.types";

interface MenuContextType {
    menu: CategorizedMenu;
    selectedCategory: string | null;
    setSelectedCategory: (category: string | null) => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children, initialMenu }: { children: React.ReactNode; initialMenu: CategorizedMenu }) {
    const [menu] = useState<CategorizedMenu>(initialMenu);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const { state } = useVapiContext();

    const processSelectCategoryCall = useCallback((toolCall: ToolCall) => {
        console.log("selectCategory call found:", toolCall);
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

            if (typeof category === 'string' && menu[category]) {
                console.log("Setting selected category:", category);
                setSelectedCategory(category);
            } else {
                console.error("Invalid or non-existent category:", category);
            }
        } catch (error) {
            console.error("Error parsing selectCategory arguments:", error);
        }
    }, [menu]);

    useEffect(() => {
        const processMessages = () => {
            state.messages.forEach((message, index) => {
                if (message.type === MessageTypeEnum.TOOL_CALLS) {
                    const toolCallsMessage = message as ToolCallsMessage;
                    const selectCategoryCall = toolCallsMessage.toolCalls.find(
                        call => call.function.name === "selectCategory"
                    );
                    if (selectCategoryCall) {
                        console.log(`Processing selectCategory call from message ${index}`);
                        processSelectCategoryCall(selectCategoryCall);
                    }
                } else if (message.type === MessageTypeEnum.TOOL_CALL_RESULT) {
                    const toolCallResultMessage = message as ToolCallResultMessage;
                    if (toolCallResultMessage.name === "selectCategory") {
                        console.log(`Processing selectCategory result from message ${index}`);
                        try {
                            const result = JSON.parse(toolCallResultMessage.result);
                            if (result.category && menu[result.category]) {
                                console.log("Setting selected category from result:", result.category);
                                setSelectedCategory(result.category);
                            } else {
                                console.error("Invalid category received from result:", result.category);
                            }
                        } catch (error) {
                            console.error("Error processing selectCategory result:", error);
                        }
                    }
                }
            });
        };

        processMessages();
    }, [state.messages, processSelectCategoryCall, menu]);

    useEffect(() => {
        console.log("Current selected category:", selectedCategory);
    }, [selectedCategory]);

    const contextValue = useMemo(() => ({
        menu,
        selectedCategory,
        setSelectedCategory
    }), [menu, selectedCategory]);

    return (
        <MenuContext.Provider value={contextValue}>
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
