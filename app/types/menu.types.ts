export interface MenuItemVariation {
  id: string;
  name: string;
  price: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  variations: MenuItemVariation[];
  image_url?: string; // Add this if menu items can have images
}

export interface CategorizedMenu {
  [category: string]: MenuItem[];
}

export interface SquareApiResponse {
  objects?: Array<{
    id: string;
    type: string;
    category_data?: {
      name: string;
    };
    item_data?: {
      name?: string;
      description?: string;
      category_id?: string;
      categories?: Array<{ id: string }>;
      variations?: Array<{
        id: string;
        item_variation_data?: {
          name?: string;
          price_money?: { amount?: number };
        };
      }>;
      image_ids?: string[]; // Add this if Square API provides image IDs
    };
  }>;
}

// Add these new types

export type MenuType = CategorizedMenu; // This aligns with how you're using it in vapi.sdk.ts

export interface MenuContextType {
  menu: MenuType | null;
  setMenu: (menu: MenuType) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
}

export interface OrderItem {
  name: string;
  quantity: number;
  notes?: string;
}

export interface UpdateOrderNotesArgs {
  action: 'add' | 'remove' | 'update' | 'clear';
  item?: OrderItem;
}
