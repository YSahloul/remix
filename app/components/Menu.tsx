import React from "react";
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

interface MenuComponentProps {
  menu: CategorizedMenu;
}

export function MenuComponent({ menu }: MenuComponentProps) {
  return (
    <div className="menu-container">
      {Object.entries(menu).map(([category, items]) => (
        <div key={category} className="category-section">
          <h2 className="category-title">{category}</h2>
          {items.map((item) => (
            <div key={item.id} className="menu-item">
              <h3 className="item-name">{item.name}</h3>
              <p className="item-description">{item.description}</p>
              <ul className="variations-list">
                {item.variations.map((variation) => (
                  <li key={variation.id} className="variation">
                    {variation.name} - ${(parseInt(variation.price) / 100).toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
