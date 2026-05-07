export interface ProductImage {
    id: number
    key: string
    url: string
}

export interface Product {
    id: number
    name: string
    description: string
    price: string | number
    sku_code: string
    isActive: boolean
    
    images: ProductImage[]
}