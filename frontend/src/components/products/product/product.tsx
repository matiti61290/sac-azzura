'use client'

import { Product, Stocks } from "@/src/types/product"
import { useMemo, useState } from "react"
import { useCart } from "@/src/contexts/CartContext"
import Link from "next/link" // Pour pouvoir cliquer et aller vers le panier

interface ProductOptionsProps {
    stocks: Stocks[];
    product: Product;
}

export default function ProductOptions({ stocks, product }: ProductOptionsProps) {
    const { addToCart } = useCart();

    // --- LOGIQUE DE STOCK (Inchangée) ---
    const availableColors = useMemo(() => Array.from(new Map(stocks.map(s => [s.color.id, s.color])).values()), [stocks]);
    const availableMaterials = useMemo(() => Array.from(new Map(stocks.map(s => [s.material.id, s.material])).values()), [stocks]);

    const [selectedColor, setSelectedColor] = useState<number>(availableColors[0]?.id);
    const [selectedMaterial, setSelectedMaterial] = useState<number>(availableMaterials[0]?.id);

    const currentStock = stocks.find(s => s.color.id === selectedColor && s.material.id === selectedMaterial);

    const isColorAvailable = (colorId: number) => stocks.some(s => s.material.id === selectedMaterial && s.color.id === colorId && s.quantity > 0);
    const isMaterialAvailable = (materialId: number) => stocks.some(s => s.color.id === selectedColor && s.material.id === materialId && s.quantity > 0);

    // 👇 NOUVEAU : État pour gérer l'affichage de notre notification
    const [showNotification, setShowNotification] = useState(false);

    // Action d'ajout au panier
    const handleAddToCart = () => {
        if (!currentStock) return;
        
        addToCart({
            stockId: currentStock.id,
            productId: product.id,
            name: product.name,
            price: product.price,
            colorName: currentStock.color.name,
            materialName: currentStock.material.name,
            imageUrl: product.images?.[0]?.url || "/placeholder.jpg",
            quantity: 1,
            sku: currentStock.sku
        });

        // 👇 Au lieu de l'alert(), on affiche notre notification
        setShowNotification(true);

        // On la fait disparaître automatiquement après 4 secondes
        setTimeout(() => {
            setShowNotification(false);
        }, 4000);
    };

    return (
        <div className="space-y-6 font-text relative">
            
            {/* --- SECTION CHOIX DE LA COULEUR --- */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-night-blue/60">Choisir la couleur</h3>
                    <span className="text-sm font-semibold text-night-blue">
                        {availableColors.find(c => c.id === selectedColor)?.name}
                    </span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {availableColors.map((color) => {
                        const isSelected = selectedColor === color.id;
                        const isAvailable = isColorAvailable(color.id);
                        return (
                            <button
                                key={color.id}
                                disabled={!isAvailable && !isSelected}
                                onClick={() => setSelectedColor(color.id)}
                                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 focus:outline-none
                                    ${isSelected ? "bg-orange text-white shadow-md ring-2 ring-orange ring-offset-2 scale-105 font-bold" : "bg-white text-night-blue border border-gray-200 hover:border-orange/50"}
                                    ${!isAvailable && !isSelected ? "opacity-30 cursor-not-allowed bg-gray-50 line-through decoration-night-blue" : ""}
                                `}
                            >
                                {color.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* --- SECTION CHOIX DU MATÉRIAU --- */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-night-blue/60">Type de tissu / matériau</h3>
                    <span className="text-sm font-semibold text-night-blue">
                        {availableMaterials.find(m => m.id === selectedMaterial)?.name}
                    </span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {availableMaterials.map((material) => {
                        const isSelected = selectedMaterial === material.id;
                        const isAvailable = isMaterialAvailable(material.id);
                        return (
                            <button
                                key={material.id}
                                disabled={!isAvailable && !isSelected}
                                onClick={() => setSelectedMaterial(material.id)}
                                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 focus:outline-none
                                    ${isSelected ? "bg-orange text-white shadow-md ring-2 ring-orange ring-offset-2 scale-105 font-bold" : "bg-white text-night-blue border border-gray-200 hover:border-orange/50"}
                                    ${!isAvailable && !isSelected ? "opacity-30 cursor-not-allowed bg-gray-50 line-through decoration-night-blue" : ""}
                                `}
                            >
                                {material.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* --- ZONE D'ACTION FINALE --- */}
            <div className="pt-6 border-t border-night-blue/10 mt-6">
                <div className="mb-4">
                    {!currentStock ? (
                        <p className="text-red-500 text-sm font-medium italic">Cette combinaison n'est pas réalisable pour le moment.</p>
                    ) : currentStock.quantity === 0 ? (
                        <p className="text-orange text-sm font-medium italic">Victime de son succès ! Ce modèle est en cours de réapprovisionnement à l'atelier.</p>
                    ) : (
                        <p className="text-emerald-600 text-sm font-medium flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Création disponible immédiatement ({currentStock.quantity} en stock)
                        </p>
                    )}
                </div>

                <button
                    disabled={!currentStock || currentStock.quantity === 0}
                    onClick={handleAddToCart}
                    className="w-full flex items-center justify-center py-4 px-6 rounded-2xl text-white font-semibold tracking-wide text-base bg-orange hover:bg-[#e89454] active:scale-[0.98] disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none transition-all duration-150 shadow-lg shadow-orange/20"
                >
                    Ajouter au panier
                </button>
            </div>

            {/* 👇 NOUVEAU : LA NOTIFICATION (TOAST) */}
            <div 
                className={`
                    fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 
                    bg-white border-l-4 border-orange shadow-2xl rounded-lg p-5
                    w-[90vw] md:w-[380px]
                    transform transition-all duration-500 ease-out
                    ${showNotification ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}
                `}
            >
                <div className="flex items-start justify-between">
                    <div>
                        <h4 className="text-night-blue font-bold text-lg flex items-center gap-2">
                            <span>✨</span> C'est dans le sac !
                        </h4>
                        <p className="text-sm text-gray-600 mt-1 leading-snug">
                            Le modèle <strong>{product.name}</strong> ({currentStock?.material.name} - {currentStock?.color.name}) a été ajouté à votre panier.
                        </p>
                    </div>
                </div>
                <div className="mt-4 flex gap-3">
                    <button 
                        onClick={() => setShowNotification(false)}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Continuer
                    </button>
                    <Link 
                        href="/cart"
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-night-blue hover:bg-[#06089e] rounded-lg text-center transition-colors shadow-md"
                    >
                        Voir le panier
                    </Link>
                </div>
            </div>
            
        </div>
    )
}