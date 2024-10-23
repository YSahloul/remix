import React from "react";
import { Menu } from "./Menu";
import { MenuCategories } from "./MenuCategories";
import { VoiceControlledInfo } from "./VoiceControlledInfo";
import { ErrorBoundary } from 'react-error-boundary';
import { useMenuContext } from "~/contexts/MenuContext";

export function Display() {
  const { selectedCategory } = useMenuContext();

  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <div className="flex flex-col h-screen">
        <header className="text-center py-4">
          <h1 className="text-2xl font-bold">Welcome to Tic-Taco</h1>
          <p className="text-sm text-gray-600">Talk with our AI assistant to explore our menu and place an order.</p>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-2/3 overflow-y-auto p-4">
            {selectedCategory ? <Menu /> : <MenuCategories />}
          </div>
          <div className="w-1/3 overflow-y-auto p-4">
            <VoiceControlledInfo />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
