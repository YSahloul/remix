import React from "react";
import { useMenuContext } from "~/contexts/MenuContext";

export function MenuCategories() {
  const { menu, setSelectedCategory } = useMenuContext();

  const handleCategoryClick = (category: string) => {
    console.log("Category clicked:", category);
    setSelectedCategory(category);
  };

  return (
    <div className="grid grid-cols-3 gap-4 w-full max-w-4xl mx-auto my-8">
      {Object.entries(menu).map(([category, items]) => (
        <div 
          key={category} 
          className="bg-white p-4 rounded-lg shadow cursor-pointer hover:bg-gray-100"
          onClick={() => handleCategoryClick(category)}
        >
          <h3 className="text-xl font-semibold mb-2">{category}</h3>
          <p className="text-gray-600">{items.length} items</p>
        </div>
      ))}
    </div>
  );
}
