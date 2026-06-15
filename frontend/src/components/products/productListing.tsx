"use client"; 

import { Product, Category } from '@/src/types/product';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';

interface ProductListingProps {
  initialProducts: Product[];
}

export default function ProductListing({ initialProducts }: ProductListingProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // L'état est maintenant un simple tableau de catégories, car NestJS doit renvoyer la structure imbriquée
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // 1. Lecture de l'URL actuelle
  const currentSubCategory = searchParams.get('subcategory');

  // 2. Fetch des catégories depuis l'API backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API}category/`, {
          cache: 'no-store'
        });
        
        if (!res.ok) throw new Error('Erreur lors de la récupération des catégories');

        const categoriesData: Category[] = await res.json();
        
        // On sauvegarde directement la donnée (NestJS renvoie normalement les sous-catégories imbriquées)
        setCategories(categoriesData);
      } catch (error) {
        console.error('Erreur de chargement des catégories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // 3. Filtrage ACTIF des produits (La pièce manquante !)
  const filteredProducts = useMemo(() => {
    if (!currentSubCategory) return initialProducts;

    return initialProducts.filter((product) => {
      // 👇 Attention au "c" minuscule ici !
      return product.subcategory?.sku_code === currentSubCategory; 
    });
  }, [initialProducts, currentSubCategory]);

  // 4. Fonction pour mettre à jour les filtres
  const updateFilter = (key: string, value: string | null) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (!value) {
      current.delete(key);
    } else {
      current.set(key, value);
    }

    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`${pathname}${query}`, { scroll: false });
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      
      {/* SIDEBAR - Filtres */}
      <aside className="w-full md:w-1/4">
        <h2 className="font-semibold mb-4">Filtres</h2>
        
        <div className="flex flex-col gap-4">
          {loadingCategories ? (
            <p className="text-gray-500 text-sm">Chargement des catégories...</p>
          ) : categories && categories.length > 0 ? (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <select 
                value={currentSubCategory || ''}
                // On met à jour "subcategory" et non "category"
                onChange={(e) => updateFilter('subcategory', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes catégories</option>
                
                {/* On boucle sur les catégories principales pour les OptGroups */}
                {categories.map((cat) => (
                  <optgroup label={cat.name} key={cat.id}>
                    
                    {/* Puis on boucle sur leurs sous-catégories pour les Options */}
                    {cat.subcategories?.map((subcat) => (
                      <option 
                        key={subcat.id} 
                        value={subcat.sku_code} // On stocke le slug dans l'URL (plus propre pour le SEO)
                      >
                        {subcat.name}
                      </option>
                    ))}
                    
                  </optgroup>
                ))}
              </select>

              {currentSubCategory && (
                <button 
                  onClick={() => router.push(pathname, { scroll: false })}
                  className="mt-4 text-sm text-red-500 hover:text-red-700 underline text-left"
                >
                  Effacer les filtres
                </button>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-sm">Aucune catégorie disponible</p>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT - Grille de produits */}
      <div className="w-full md:w-3/4">
        <p className="mb-4 text-gray-500">{filteredProducts.length} produit(s) disponible(s)</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* ⚠️ IMPORTANT : On map sur filteredProducts, pas initialProducts ! */}
          {filteredProducts.map((product) => (
            <Link 
              key={product.id} 
              href={`/products/${product.sku_code}`}
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              {product.images && product.images.length > 0 ? (
                <div className="mb-3">
                  <img 
                    src={product.images[0].url} 
                    alt={`${product.name}`}
                    className="w-full h-48 object-cover rounded"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="mb-3 bg-gray-100 h-48 flex items-center justify-center rounded">
                  <span className="text-gray-400 text-sm">Aucune image</span>
                </div>
              )}
              
              <h3 className="font-bold">{product.name}</h3>
              <p className="text-gray-600 text-sm">{product.subcategory?.name || 'Sans catégorie'}</p> 
              <p className="text-lg mt-2 font-semibold">{product.price} €</p>
              
              {product.description && (
                <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                  {product.description}
                </p>
              )}
            </Link>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun produit trouvé pour les critères sélectionnés</p>
          </div>
        )}
      </div>
      
    </div>
  );
}