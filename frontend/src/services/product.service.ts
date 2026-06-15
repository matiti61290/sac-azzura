import { Category, Product, SubCategory } from "../types/product.type"

export interface FilterState {
  category: number
  subCategory: number
  color: string
  material: string
}

export function filterProduct(products: Product[], filters: FilterState): Product[] {
  return products.filter((product) => {
    const matchCategory = !filters.category || product.subcategory.category?.id === filters.category
    const matchSubcategory = !filters.subCategory || product.subcategory.id === filters.subCategory

    return matchCategory && matchSubcategory
  })
}

export function extractUniqueFilters(products: Product[]) {
  const categoriesMap = new Map<number, Category>()
  const subCategoryMap = new Map<number, SubCategory>()

  products.forEach((product) => {
    if (product.subcategory.category && !categoriesMap.has(product.subcategory.category.id)) {
      categoriesMap.set(product.subcategory.category.id, {
        id: product.subcategory.category.id,
        name: product.subcategory.category.name,
        sku_code: product.subcategory.category.sku_code
      })
    }

    //filtre sur subcategory a faire
    
    //readapter cette partie

    //   if (product.subCategory && product.category) {
    //     const cat = categoriesMap.get(product.category.id);
    //     if (cat && !cat.subCategories?.some((s) => s.id === product.subCategory!.id)) {
    //       cat.subCategories?.push(product.subCategory);
    //     }
    //   }
    // });
  })
}