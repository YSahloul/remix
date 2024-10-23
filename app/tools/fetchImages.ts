import { Bindings } from '~/types/hono.types';

export interface MenuItemImage {
  id: string;
  imageUrl: string;
}

export async function fetchImages(bindings: Bindings, itemIds: string[]): Promise<MenuItemImage[]> {
  console.log("fetchImages called with itemIds:", itemIds);
  
  if (!bindings.SQUARE_ACCESS_TOKEN) {
    console.error('SQUARE_ACCESS_TOKEN is not set in the environment variables');
    return [];
  }

  const squareApiUrl = 'https://connect.squareupsandbox.com/v2/catalog/search-catalog-items'; // Use production URL for live environment

  try {
    console.log('Fetching images from Square API...');
    const response = await fetch(squareApiUrl, {
      method: 'POST',
      headers: {
        'Square-Version': '2023-12-13',
        'Authorization': `Bearer ${bindings.SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        object_types: ["ITEM"],
        query: {
          exact_query: {
            attribute_name: "item_id",
            attribute_values: itemIds
          }
        },
        include_related_objects: true,
      })
    });

    console.log('Square API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Square API error response:`, errorText);
      throw new Error(`Square API responded with status: ${response.status}`);
    }

    const data: any = await response.json();
    console.log('Square API response data:', JSON.stringify(data, null, 2));
    
    const itemImages: MenuItemImage[] = data.items
      ?.filter((item: any) => {
        console.log(`Processing item ${item.id}:`, JSON.stringify(item, null, 2));
        return item.image_ids && item.image_ids.length > 0;
      })
      .map((item: any) => ({
        id: item.id,
        imageUrl: `/api/image/${item.image_ids[0]}`,
      })) ?? [];

    if (itemImages.length === 0) {
      console.log("No images found for the given itemIds");
    }
    return itemImages;
  } catch (error) {
    console.error('Error fetching images from Square:', error);
    throw error; // Throw the error instead of returning an empty array
  }
}
