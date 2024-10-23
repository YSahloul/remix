import React from "react";
import { CategorizedMenu } from "~/types/menu.types";

interface MenuCategoriesProps {
  initialMenu: CategorizedMenu;
}

export function MenuCategories({ initialMenu }: MenuCategoriesProps) {
  return (
    <div className="grid grid-cols-3 gap-4 w-full max-w-4xl mx-auto my-8">
      {Object.entries(initialMenu).map(([category, items]) => (
        <div key={category} className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2">{category}</h3>
          <p className="text-gray-600">{items.length} items</p>
        </div>
      ))}
    </div>
  );
}