// src/app/products/[id]/page.tsx
import { Product } from "@/src/types/product"
import ProductOptions from "@/src/components/products/product/product"
import Link from "next/link"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: PageProps) {
    const { id } = await params

    const res = await fetch(`${process.env.NEXT_PUBLIC_API}products/${id}`, { cache: 'no-store' })
    if (!res.ok) return <div className="text-center py-20 font-text text-night-blue">Création introuvable...</div>
    const product: Product = await res.json()

    return (
        <div className="min-h-screen bg-white font-text text-azura-night">
            
            {/* --- FIL D'ARIANE / RETOUR (D'après ton wireframe de la page 3) --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                <Link href="/products" className="inline-flex items-center text-sm text-night-blue/70 hover:text-orange transition-colors">
                    ← Retour aux créations
                </Link>
            </div>

            {/* --- CONTENU PRINCIPAL (GRID 2 COLONNES ASYMÉTRIQUE) --- */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* BLOC GAUCHE : VISUELS & LABELS ARTISANAUX (Prend 7 colonnes sur 12) */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Image principale au format de ton prototype */}
                    <div className="aspect-[4/5] w-full rounded-3xl overflow-hidden bg-gray-50 border border-azura-night/5 shadow-sm">
                        <img 
                            src={product.images?.[0]?.url || "/placeholder.jpg"} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* BLOC DROITE : INFOS, HISTOIRE & SÉLECTION DE STOCK (Prend 5 colonnes sur 12) */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-8 lg:space-y-0">
                    <div>
                        {/* Phrase d'accroche ou badge de catégorie */}
                        <span className="text-xs font-text font-bold tracking-widest text-dark-blue uppercase bg-dark-blue/10 px-2.5 py-1 rounded-md">
                            {product.subcategory?.name || "Création exclusive"}
                        </span>

                        {/* Nom du produit avec ta police custom Avallon */}
                        <h1 className="text-4xl lg:text-5xl font-title text-dark-blue mt-3 tracking-wide">
                            {product.name}
                        </h1>

                        {/* Prix mis en valeur */}
                        <p className="text-2xl font-bold font-text text-gray-900 mt-2">
                            {product.price} €
                        </p>

                        {/* Description classique */}
                        <div className="mt-6">
                            <h2 className="text-s font-bold uppercase tracking-wider text-night-blue mb-2">Description</h2>
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                {product.description}
                            </p>
                        </div>
                    </div>

                    {/* INTERACTIVITÉ (Notre composant client avec les boutons oranges et la table ternaire) */}
                    <div className="pt-6 border-t border-azura-night/10">
                        {product.stocks && product.stocks.length > 0 ? (
                            <ProductOptions stocks={product.stocks} />
                        ) : (
                            <p className="text-orange text-sm font-medium italic text-center p-4 bg-orange/5 rounded-xl">
                                Je prépare actuellement de nouvelles pièces pour ce modèle. N'hésitez pas à m'envoyer un petit message !
                            </p>
                        )}
                    </div>

                </div>
            </main>

            {/* --- SECTION BAS DE PAGE : "VOUS AIMEREZ AUSSI" (Zonage de tes prototypes) --- */}
            <section className="bg-gray-50 border-t border-night-blue/5 mt-20 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl lg:text-3xl font-title text-night-blue text-center mb-10 tracking-wide">
                        Vous aimerez aussi...
                    </h2>
                    
                    {/* Grille de suggestions (Tu pourras y mapper d'autres produits) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((item) => (
                            <div key={item} className="group bg-white rounded-2xl p-3 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                <div className="aspect-square w-full rounded-xl bg-gray-100 overflow-hidden mb-3">
                                    <div className="w-full h-full bg-gray-200 animate-pulse" /> {/* Placeholder image */}
                                </div>
                                <h4 className="text-sm font-semibold text-night-blue truncate">Autre Sac Création</h4>
                                <p className="text-xs text-gray-500 mt-0.5">79 €</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}