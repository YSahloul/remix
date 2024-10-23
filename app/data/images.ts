export interface MenuItemImage {
    id: string;
    imageUrl: string;
  }
  
  export const menuItemImages: MenuItemImage[] = [
    {
      id: "GH22DVXWKTUWAHWSXCZLWBHR",
      imageUrl: "https://example.com/images/chips-n-salsa.jpg"
    },
    {
      id: "W5ZOQ7UZJAXSULOV6JWOQ67X",
      imageUrl: "https://example.com/images/other-item.jpg"
    },
    {
      id: "GTHOODPM6ETIR7SXYSOPXNIR",
      imageUrl: "https://www.mccormick.com/-/media/project/oneweb/mccormick-us/el-guapo/recipes/800x800/beef_birra_tacos_ground_black_pepper_800x800.jpg?rev=e42c1fb5716547f489920ad0e765427a&vd=20211208T213909Z&extension=webp&hash=EB7CE59B96A81D047EF25115F1FFEEA8"
    }
  ];
  
  export function getImageUrlsById(ids: string[]): string[] {
    return ids.map(id => {
      const item = menuItemImages.find(item => item.id === id);
      return item ? item.imageUrl : '';
    }).filter(url => url !== '');
  }