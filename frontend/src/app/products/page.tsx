import ProductListing from "@/src/components/products/productListing"
import { Product } from "@/src/types/product"

export default async function ProductsPage () {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}products/`, {
        cache: 'no-store'
    })

    if(!res.ok) {
        throw new Error('Erreur lors de la récuperation des produits')
    }

    const products: Product[] = await res.json()

    return (
        <div className="container mx-auto p-6 md:p-12 min-h-screen bg-[var(--background)]">
                <ProductListing initialProducts={products} />
        </div>
    )
}
