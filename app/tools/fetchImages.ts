import { Bindings } from '../types/hono.types';

interface MenuItemImage {
  id: string;
  imageUrl: string;
}

export async function fetchImages(bindings: Bindings, itemIds: string[]): Promise<MenuItemImage[]> {
  if (!bindings.SQUARE_ACCESS_TOKEN) {
    console.log('SQUARE_ACCESS_TOKEN is not set in the environment variables');
    return [];
  }

  const squareApiUrl = 'https://connect.squareupsandbox.com/v2/catalog/batch-retrieve'; // Use production URL for live environment

  try {
    console.log('Fetching images from Square...');
    const response = await fetch(squareApiUrl, {
      method: 'POST',
      headers: {
        'Square-Version': '2023-12-13', // Use the latest API version
        'Authorization': `Bearer ${bindings.SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        object_ids: itemIds,
        include_related_objects: true,
      })
    });

    if (!response.ok) {
      throw new Error(`Square API responded with status: ${response.status}`);
    }

    const data: any = await response.json();
    
    const itemImages: MenuItemImage[] = data.objects
      ?.filter((item: any) => item.type === 'ITEM' && item.item_data?.image_ids)
      .map((item: any) => ({
        id: item.id,
        imageUrl: `https://connect.squareup.com/v2/catalog/images/${item.item_data.image_ids[0]}`,
      })) ?? [];

    console.log(`Fetched images for ${itemImages.length} items`);
    console.log('Item images:', JSON.stringify(itemImages, null, 2));
    return itemImages;
  } catch (error) {
    console.error('Error fetching images from Square:', error);
    return [];
  }
}
