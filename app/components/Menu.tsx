import React from "react";
import { ErrorBoundary } from 'react-error-boundary';
import { CategorizedMenu, MenuItem } from "~/types/menu.types";

interface MenuComponentProps {
  menu: CategorizedMenu;
}

export function Menu({ menu }: MenuComponentProps) {
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

  const renderCategory = (categoryName: string, items: MenuItem[]) => (
    <div key={categoryName} className="mb-8">
      <h3 className="text-2xl font-semibold mb-4 text-center">{categoryName}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(renderMenuItem)}
      </div>
    </div>
  );

  const categoryOrder = ["Starters", "Main Menu", "Drinks"];
  const sortedCategories = Object.entries(menu).sort(([aName], [bName]) => {
    const aIndex = categoryOrder.indexOf(aName);
    const bIndex = categoryOrder.indexOf(bName);
    if (aIndex === -1 && bIndex === -1) return aName.localeCompare(bName);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  return (
    <div className="menu-container p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Our Menu</h2>
      
      {sortedCategories.map(([categoryName, items]) => renderCategory(categoryName, items))}
      
      {Object.keys(menu).length === 0 && (
        <p className="text-center text-gray-500">Menu is currently unavailable.</p>
      )}
    </div>
  );
}
