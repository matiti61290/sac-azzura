// src/app/products/[id]/page.tsx
import ProductInteractive from "@/src/components/products/product/product"
import { Product } from "@/src/types/product"
// On importe le composant interactif qu'on va créer juste après

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: PageProps) {
    const { id } = await params

    // 1. Fetch des données côté serveur (Ultra rapide, parfait pour le SEO)
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}products/${id}`, {
        cache: 'no-store'
    })
    if (!res.ok) return <div>Produit introuvable</div>
    const product: Product = await res.json()

    return (
        <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Partie gauche : Infos textuelles simples (rendues par le serveur) */}
            <div>
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <p className="text-gray-600 mt-2">{product.description}</p>
                <p className="text-2xl font-semibold mt-4">{product.price} €</p>
            </div>

            {/* Partie droite : TOUTE L'INTERACTIVITÉ (Gérée par le client) */}
            {/* On transmet l'objet 'product' au composant Client via les props */}
            <div>
                <ProductInteractive product={product} />
            </div>
        </div>
    )
}