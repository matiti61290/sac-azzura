'use client'

import type { Product } from "@/src/types/dashboard.types"
import { useCrud } from "@/src/hooks/useCrud"

export default function ProductList () {
  // 💡 ICI : On extrait "data" et on la renomme en "products", 
  // et on récupère aussi "loading" au passage pour améliorer l'UX !
  const products = useCrud<<Product

  // Optionnel mais recommandé : afficher un état de chargement
  if (loading) {
    return <div className="text-center p-6">Chargement des produits...</div>;
  }

  return (

  )
}