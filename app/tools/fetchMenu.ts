import { Bindings } from '../types/hono.types';
import { CategorizedMenu, MenuItem, MenuItemVariation, SquareApiResponse } from '../types/menu.types';

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
    console.log('Raw Square API response:', JSON.stringify(data, null, 2));

    if (!data.objects || data.objects.length === 0) {
      console.warn('No items returned from Square API');
      return {};
    }

    const categorizedMenu: CategorizedMenu = {};
    const categoryMap: { [id: string]: string } = {};

    // First, create a map of category IDs to names
    data.objects.forEach(item => {
      if (item.type === 'CATEGORY' && item.category_data) {
        categoryMap[item.id] = item.category_data.name;
      }
    });

    // Then, categorize menu items
    data.objects.forEach(item => {
      if (item.type === 'ITEM' && item.item_data) {
        const categoryId = item.item_data.categories?.[0]?.id || 'Uncategorized';
        const categoryName = categoryMap[categoryId] || 'Uncategorized';

        if (!categorizedMenu[categoryName]) {
          categorizedMenu[categoryName] = [];
        }

        categorizedMenu[categoryName].push({
          id: item.id,
          name: item.item_data.name || '',
          description: item.item_data.description || '',
          category: categoryName,
          variations: item.item_data.variations?.map(variation => ({
            id: variation.id,
            name: variation.item_variation_data?.name || '',
            price: variation.item_variation_data?.price_money?.amount?.toString() || '0',
          })) || [],
        });
      }
    });

    console.log("Categorized menu:", JSON.stringify(categorizedMenu, null, 2));
    return categorizedMenu;
  } catch (error) {
    console.error('Error fetching menu from Square:', error);
    throw error;
  }
}
