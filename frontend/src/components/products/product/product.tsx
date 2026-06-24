'use client'

import { Product, Stocks } from "@/src/types/product"
import { useMemo, useState } from "react"

interface ProductOptionsProps {
    stocks: Stocks[];
}

export default function ProductOptions({ stocks }: ProductOptionsProps) {
    // 1. On extrait proprement les couleurs et matériaux uniques présents dans le stock de ce produit
    const availableColors = useMemo(() => {
        const uniqueColors = new Map(stocks.map(s => [s.color.id, s.color]));
        return Array.from(uniqueColors.values());
    }, [stocks]);

    const availableMaterials = useMemo(() => {
        const uniqueMaterials = new Map(stocks.map(s => [s.material.id, s.material]));
        return Array.from(uniqueMaterials.values());
    }, [stocks]);

    // 2. États pour stocker les choix de la cliente (on sélectionne les premiers par défaut)
    const [selectedColor, setSelectedColor] = useState<number>(availableColors[0]?.id);
    const [selectedMaterial, setSelectedMaterial] = useState<number>(availableMaterials[0]?.id);

    // 3. On trouve la ligne de stock exacte qui correspond à la combinaison cliquée
    const currentStock = stocks.find(
        s => s.color.id === selectedColor && s.material.id === selectedMaterial
    );

    // 4. Fonctions de validation croisée (Vérifie si la combinaison existe et a du stock > 0)
    const isColorAvailable = (colorId: number) => {
        return stocks.some(s => s.material.id === selectedMaterial && s.color.id === colorId && s.quantity > 0);
    };

    const isMaterialAvailable = (materialId: number) => {
        return stocks.some(s => s.color.id === selectedColor && s.material.id === materialId && s.quantity > 0);
    };

    // Action d'ajout au panier
    const handleAddToCart = () => {
        if (!currentStock) return;
        
        // C'est cet ID de stock exact (et son SKU) que tu passeras à ton futur Context Panier
        console.log("Ajout au panier de la ligne de stock ID:", currentStock.id, "SKU:", currentStock.sku_code);
        alert(`Félicitations ! Le modèle en ${currentStock.material.name} (Couleur: ${currentStock.color.name}) a été ajouté à votre panier.`);
    };

    return (
        <div className="space-y-6 font-text">
            
            {/* --- SECTION CHOIX DE LA COULEUR --- */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-night-blue/60">
                        Choisir la couleur
                    </h3>
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
                                className={`
                                    px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 focus:outline-none
                                    ${isSelected 
                                        ? "bg-orange text-white shadow-md ring-2 ringorange ring-offset-2 scale-105 font-bold" 
                                        : "bg-white text-night-blue border border-gray-200 hover:border-orange/50"
                                    }
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
                    <h3 className="text-xs font-bold uppercase tracking-wider text-night-blue/60">
                        Type de tissu / matériau
                    </h3>
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
                                className={`
                                    px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 focus:outline-none
                                    ${isSelected 
                                        ? "bg-orange text-white shadow-md ring-2 ring-orange ring-offset-2 scale-105 font-bold" 
                                        : "bg-white text-night-blue border border-gray-200 hover:border-orange/50"
                                    }
                                    ${!isAvailable && !isSelected ? "opacity-30 cursor-not-allowed bg-gray-50 line-through decoration-night-blue" : ""}
                                `}
                            >
                                {material.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* --- ZONE D'ACTION FINALE (AVEC LE TON DE GIGI) --- */}
            <div className="pt-6 border-t border-night-blue/10 mt-6">
                
                {/* Gestion des textes de statut dynamiques */}
                <div className="mb-4">
                    {!currentStock ? (
                        <p className="text-red-500 text-sm font-medium italic">
                            Cette combinaison n'est pas réalisable pour le moment.
                        </p>
                    ) : currentStock.quantity === 0 ? (
                        <p className="text-orange text-sm font-medium italic">
                            Victime de son succès ! Ce modèle est en cours de réapprovisionnement à l'atelier.
                        </p>
                    ) : (
                        <p className="text-emerald-600 text-sm font-medium flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Création disponible immédiatement ({currentStock.quantity} en stock)
                        </p>
                    )}
                </div>

                {/* Bouton d'ajout principal mis en valeur en orange */}
                <button
                    disabled={!currentStock || currentStock.quantity === 0}
                    onClick={handleAddToCart}
                    className="
                        w-full flex items-center justify-center py-4 px-6 rounded-2xl text-white font-semibold tracking-wide text-base
                        bg-orange hover:bg-[#e89454] active:scale-[0.98]
                        disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none
                        transition-all duration-150 shadow-lg shadow-orange/20
                    "
                >
                    Ajouter au panier
                </button>
            </div>
        </div>
    )
}