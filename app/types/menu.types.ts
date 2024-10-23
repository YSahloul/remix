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
      };
    }>;
  }
