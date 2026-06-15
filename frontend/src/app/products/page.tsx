import ProductListing from "@/src/components/products/productListing"
import { Product } from "@/src/types/product"

export default async function ProductsPage () {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}products/`, {
        cache: 'no-store'
    })

    if(!res.ok) {
        throw new Error('Erreur lors de la recuperation des produits')
    }

    const products: Product[] = await res.json()

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Notre Boutique</h1>
      
      {/* On passe la liste complète au composant client qui gérera l'UI */}
        <ProductListing initialProducts={products} />
        </div>
    )
}