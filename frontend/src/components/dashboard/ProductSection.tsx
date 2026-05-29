'use client';

import { useState } from 'react';
import type { Product, Category, SubCategory, Color, Material } from '../../types/dashboard.types';

// 1. Définition stricte des types attendus (C'est ça qui fait que c'est du vrai TSX)
interface ProductSectionProps {
  products: Product[];
  categories: Category[];
  subcategories: SubCategory[];
  colors: Color[];
  materials: Material[];
  loading: boolean;
  onRefresh: () => void | Promise<void>;
  onAddProduct: (formData: FormData) => Promise<boolean>;
}

// 2. Le composant avec le typage appliqué
export default function ProductSection({ 
  products, 
  categories, 
  subcategories, 
  colors, 
  materials, 
  loading, 
  onRefresh,
  onAddProduct 
}: ProductSectionProps) {
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    subcategoryId: '',
    sku_code: '',
    images: [] as File[],
  });

  const [variations, setVariations] = useState([
    { colorId: '', materialId: '', quantity: 0 }
  ]);

  const handleAddVariation = () => {
    setVariations([...variations, { colorId: '', materialId: '', quantity: 0 }]);
  };

  // Typage strict de l'événement de formulaire
const submitProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price.toString());
    data.append('subcategoryId', formData.subcategoryId);
    data.append('sku_code', formData.sku_code);
    
    formData.images.forEach(file => data.append('files', file));
    data.append('variations', JSON.stringify(variations));

    // --- NOUVEAU CODE D'ENVOI ---
    const isSuccess = await onAddProduct(data);
    
    if (isSuccess) {
      // Si c'est un succès, on ferme la fenêtre
      setIsModalOpen(false);
      // Et on réinitialise le formulaire pour la prochaine fois
      setFormData({
        name: '', description: '', price: 0, subcategoryId: '', sku_code: '', images: []
      });
      setVariations([{ colorId: '', materialId: '', quantity: 0 }]);
    }
  };

  if (loading) {
    return <div>Chargement des produits...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Produits ({products?.length || 0})</h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded">
          + Nouveau Produit
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-3">Image</th>
              <th className="p-3">Nom</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Prix</th>
              <th className="p-3">Stock Total</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((product) => {
              // Petit calcul rapide pour additionner les quantités de toutes les déclinaisons
              const totalStock = product.stocks?.reduce((sum, stock) => sum + stock.quantity, 0) || 0;
              
              return (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    {/* On affiche la première image du tableau si elle existe */}
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0].url} 
                        alt={product.name} 
                        className="w-12 h-12 object-cover rounded shadow-sm" 
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500 text-center leading-tight">
                        Sans image
                      </div>
                    )}
                  </td>
                  <td className="p-3 font-semibold text-gray-800">{product.name}</td>
                  <td className="p-3 text-sm text-gray-500">{product.sku_code}</td>
                  <td className="p-3 text-gray-800">{product.price} €</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${totalStock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {totalStock} en stock
                    </span>
                  </td>
                  <td className="p-3">
                    {/* Boutons en attente de tes futures fonctions Update/Delete */}
                    <button className="text-blue-600 hover:underline text-sm mr-3">Éditer</button>
                    <button className="text-red-600 hover:underline text-sm">Supprimer</button>
                  </td>
                </tr>
              );
            })}
            
            {/* Si la liste est vide */}
            {(!products || products.length === 0) && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  Aucun produit pour le moment. Cliquez sur "+ Nouveau Produit" pour commencer.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE CRÉATION */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center overflow-y-auto z-50">
          <div className="bg-white p-8 rounded-lg w-full max-w-4xl my-8">
            <h3 className="text-2xl mb-4">Ajouter un produit</h3>
            
            <form onSubmit={submitProduct} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="text"
                  placeholder="Nom du produit" 
                  className="border p-2"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <input 
                  type="text"
                  placeholder="Code SKU (ex: SAC-001)" 
                  className="border p-2 rounded"
                  value={formData.sku_code}
                  onChange={(e) => setFormData({...formData, sku_code: e.target.value.toUpperCase()})}
                  required
                />
                <select 
                  className="border p-2"
                  value={formData.subcategoryId}
                  onChange={(e) => setFormData({...formData, subcategoryId: e.target.value})}
                >
                  <option value="">Sélectionner une sous-catégorie...</option>
                  {subcategories.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <textarea 
                  placeholder="Description du produit" 
                  className="border p-2 rounded md:col-span-3 h-24"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="Prix (€)" 
                  className="border p-2 rounded h-12"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-bold">Images du produit</label>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="border p-2 w-full" 
                  onChange={(e) => {
                    if (e.target.files) {
                      setFormData({...formData, images: Array.from(e.target.files)});
                    }
                  }}
                />
              </div>

              <div className="bg-gray-50 p-4 rounded border">
                <h4 className="font-bold mb-2">Déclinaisons & Stocks</h4>
                {variations.map((variation, index) => (
                  <div key={index} className="flex gap-4 mb-2 items-center">
                    <select 
                      className="border p-2 flex-1"
                      value={variation.colorId}
                      onChange={(e) => {
                        const newVariations = [...variations];
                        newVariations[index].colorId = e.target.value;
                        setVariations(newVariations);
                      }}
                    >
                      <option value="">Couleur...</option>
                      {colors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    
                    <select 
                      className="border p-2 flex-1"
                      value={variation.materialId}
                      onChange={(e) => {
                        const newVariations = [...variations];
                        newVariations[index].materialId = e.target.value;
                        setVariations(newVariations);
                      }}
                    >
                      <option value="">Matériau...</option>
                      {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                    
                    <input 
                      type="number" 
                      placeholder="Qté" 
                      className="border p-2 w-24"
                      value={variation.quantity}
                      onChange={(e) => {
                        const newVariations = [...variations];
                        newVariations[index].quantity = parseInt(e.target.value) || 0;
                        setVariations(newVariations);
                      }}
                    />
                  </div>
                ))}
                <button type="button" onClick={handleAddVariation} className="text-blue-600 text-sm mt-2 font-semibold">
                  + Ajouter une variante (couleur/matériau)
                </button>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600">Annuler</button>
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Sauvegarder</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}