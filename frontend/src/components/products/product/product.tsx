'use client'

import { Product } from "@/src/types/product"
import { useState } from "react"

interface ProductInteractiveProps {
    product: Product
}

export default function ProductInteractive({ product }: ProductInteractiveProps) {

    return (
        <div className="space-y-6 bg-gray-50 p-6 rounded-xl border">
            {/* 1. Zone Image avec Zoom interactif */}
            <div 
                className="overflow-hidden rounded-lg bg-white border cursor-pointer"
            >
                <img 
                    src={product.images?.[0]?.url || "/placeholder.png"} 
                    alt={product.name}
                    className={`w-full h-64 object-cover transition-transform duration-300`}
                />
            </div>

            {/* 3. Bouton d'ajout au panier */}
            <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition"
            >
                Ajouter au panier
            </button>
        </div>
    )
}