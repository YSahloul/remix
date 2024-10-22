import { Bindings } from '../types/hono.types';

interface MenuItemVariation {
  id: string;
  name: string;
  price: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  variations: MenuItemVariation[];
}

export interface CategorizedMenu {
  [category: string]: MenuItem[];
}

interface SquareApiResponse {
  objects?: Array<{
    id: string;
    type: string;
    item_data?: {
      name?: string;
      description?: string;
      category?: { name?: string };
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

export async function fetchMenu(bindings: Bindings): Promise<CategorizedMenu> {
  if (!bindings.SQUARE_ACCESS_TOKEN) {
    console.error('SQUARE_ACCESS_TOKEN is not set in the environment variables');
    throw new Error('SQUARE_ACCESS_TOKEN is not set');
  }

  const squareApiUrl = 'https://connect.squareupsandbox.com/v2/catalog/list'; // Use production URL for live environment
  
  try {
    console.log('Fetching menu from Square...');
    const response = await fetch(squareApiUrl, {
      method: 'GET',
      headers: {
        'Square-Version': '2023-12-13', // Use the latest API version
        'Authorization': `Bearer ${bindings.SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Square API responded with status: ${response.status}`);
    }

    const data: SquareApiResponse = await response.json();
    console.log('Square API response:', JSON.stringify(data));

    if (!data.objects || data.objects.length === 0) {
      console.warn('No items returned from Square API');
      return {};
    }

    const menuItems: MenuItem[] = data.objects
      .filter((item): item is NonNullable<typeof item> => item.type === 'ITEM' && !!item.item_data)
      .map((item) => ({
        id: item.id,
        name: item.item_data?.name ?? '',
        description: item.item_data?.description ?? '',
        category: item.item_data?.category?.name ?? 'Uncategorized',
        variations: item.item_data?.variations?.map((variation) => ({
          id: variation.id,
          name: variation.item_variation_data?.name ?? '',
          price: (variation.item_variation_data?.price_money?.amount ?? 0).toString(),
        })) ?? [],
      }));

    console.log(`Processed ${menuItems.length} menu items:`, JSON.stringify(menuItems));

    const categorizedMenu = menuItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as CategorizedMenu);

    console.log("Categorized menu:", JSON.stringify(categorizedMenu));
    return categorizedMenu;
  } catch (error) {
    console.error('Error fetching menu from Square:', error);
    throw error;
  }
}
