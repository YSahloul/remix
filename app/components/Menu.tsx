import React from "react";
import { ErrorBoundary } from 'react-error-boundary';
import { useMenuContext } from "~/contexts/MenuContext";
import { MenuItem } from "~/types/menu.types";

export function Menu() {
  const { menu, selectedCategory } = useMenuContext();

  if (!selectedCategory || !menu[selectedCategory]) {
    return null;
  }

  const items = menu[selectedCategory];

  const renderMenuItem = (item: MenuItem) => (
    <div key={item.id} className="bg-white p-4 rounded-lg shadow mb-4">
      <h4 className="font-bold text-lg mb-2">{item.name}</h4>
      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
      <ul className="text-sm">
        {item.variations.map((variation) => (
          <li key={variation.id} className="mb-1">
            {variation.name} - ${(parseInt(variation.price) / 100).toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="menu-container p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">{selectedCategory}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(renderMenuItem)}
      </div>
    </div>
  );
}
