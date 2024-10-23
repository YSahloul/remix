import type { LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Bindings } from '~/types/hono.types';

export const loader: LoaderFunction = async ({ params, context }) => {
  const { id } = params;
  console.log(`api.image.$id.ts: Fetching image with id: ${id}`);
  
  const bindings = context.cloudflare.env as Bindings;

  if (!bindings.SQUARE_ACCESS_TOKEN) {
    console.error('SQUARE_ACCESS_TOKEN is not set');
    throw json({ error: 'SQUARE_ACCESS_TOKEN is not set' }, { status: 500 });
  }

  const squareApiUrl = `https://connect.squareupsandbox.com/v2/catalog/images/${id}`; // Use production URL for live environment

  try {
    console.log(`Fetching image metadata from Square API: ${squareApiUrl}`);
    const response = await fetch(squareApiUrl, {
      headers: {
        'Square-Version': '2023-12-13',
        'Authorization': `Bearer ${bindings.SQUARE_ACCESS_TOKEN}`,
      },
    });

    console.log('Square API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Square API error response:`, errorText);
      throw new Error(`Square API responded with status: ${response.status}`);
    }

    const data: any = await response.json();
    console.log('Square API response data:', JSON.stringify(data, null, 2));
    
    const imageUrl = data.image?.url;

    if (!imageUrl) {
      console.error('Image URL not found in Square API response');
      throw new Error('Image URL not found in Square API response');
    }

    console.log(`Fetching image from URL: ${imageUrl}`);
    const imageResponse = await fetch(imageUrl);
    console.log('Image fetch response status:', imageResponse.status);

    if (!imageResponse.ok) {
      console.error(`Failed to fetch image from URL: ${imageUrl}`);
      throw new Error(`Failed to fetch image: ${imageResponse.status}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();

    console.log('Image fetched successfully, returning response');
    return new Response(imageBuffer, {
      headers: {
        'Content-Type': imageResponse.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error in api.image.$id.ts:', error);
    throw json({ error: 'Failed to fetch image' }, { status: 500 });
  }
};
