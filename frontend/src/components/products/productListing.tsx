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
    <div className="flex flex-col gap-8">
      
      {/* SIDEBAR - Filtres */}
      <aside className="w-full md:w-1/4 border-r pr-4">
        <h2 className={`font-text text-2xl mb-6`} style={{color: 'var(--dark-blue)'}}>Filtres</h2>
        
        <div className="flex flex-col gap-4">
          {loadingCategories ? (
            <p className="text-sm">Chargement des catégories...</p>
          ) : categories && categories.length > 0 ? (
            <>
              <label className={`block text-sm font-text font-medium`} style={{color: 'var(--foreground)'}}>
                Catégorie
              </label>
              <select 
                value={currentSubCategory || ''}
                // On met à jour "subcategory" et non "category"
                onChange={(e) => updateFilter('subcategory', e.target.value)}
                className="w-full border-2 border-light-blue rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-transparent bg-white"
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
                        style={{color: 'var(--foreground)'}}
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
                  className={`mt-4 text-sm font-text underline ${'hover:text-orange'} text-left`}
                  style={{color: 'var(--foreground)'}}
                >
                  Effacer les filtres
                </button>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-sm font-text">Aucune catégorie disponible</p>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT - Grille de produits */}
      <div className="w-full">
        <h2 className={`font-text text-2xl mb-4`} style={{color: 'var(--dark-blue)'}}>
          {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} disponible{filteredProducts.length > 1 ? 's' : ''}
        </h2>
        
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {/* ⚠️ IMPORTANT : On map sur filteredProducts */}
          {filteredProducts.map((product) => (
            <Link 
              key={product.id} 
              href={`/products/${product.sku_code}`}
              className="group" // "group" est crucial ici pour activer le hover sur l'image
            >
              {/* Gestion de l'image avec un ratio parfaitement carré */}
              {product.images && product.images.length > 0 ? (
                <img 
                  src={product.images[0].url} 
                  alt={`${product.name}`}
                  className="aspect-square w-full rounded-lg bg-gray-200 object-cover group-hover:opacity-75 transition-opacity"
                  loading="lazy"
                />
              ) : (
                <div className="aspect-square w-full rounded-lg bg-gray-200 flex items-center justify-center group-hover:opacity-75 transition-opacity">
                  <span className="text-gray-500 text-sm">Aucune image</span>
                </div>
              )}
              
              {/* Informations du produit */}
              {/* J'ai conservé ta classe "font-text" pour garder ta typographie custom */}
              <h3 className="mt-4 text-sm text-gray-700 font-text">
                {product.name}
              </h3>
              
              <p className="mt-1 text-sm text-gray-500 font-text">
                {product.subcategory?.name || 'Sans catégorie'}
              </p> 
              
              <p className="mt-1 text-lg font-medium text-gray-900 font-text">
                {product.price} €
              </p>
            </Link>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 font-text" style={{color: 'var(--foreground)'}}>Aucun produit trouvé pour les critères sélectionnés</p>
          </div>
        )}
      </div>
      
    </div>
  );
}
