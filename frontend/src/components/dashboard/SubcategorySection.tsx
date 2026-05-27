'use client';

import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import type { SubCategory, Category } from '../../types/dashboard.types';

interface SubcategorySectionProps {
  subCategories: SubCategory[];
  categories: Category[]; // Ajout des catégories pour le select
  loading: boolean;
  onRefresh: () => void;
  onAddSubCategory: (subCategory?: Partial<SubCategory>) => Promise<SubCategory[]>;
}

export default function SubcategorySection({
  subCategories,
  categories,
  loading,
  onRefresh,
  onAddSubCategory,
}: SubcategorySectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Correction de la syntaxe ici (categoryId était vide)
  const [formData, setFormData] = useState({ name: '', categoryId: '', sku_code: '' });

  const handleSubmit = async () => {
    // On convertit categoryId en nombre pour le backend
    const payload = {
      ...formData,
      categoryId: Number(formData.categoryId),
    };

    await onAddSubCategory(payload);
    setIsOpen(false);
    setFormData({ name: '', categoryId: '', sku_code: '' });
    onRefresh();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Sous-catégories</h3>
        <Button onClick={() => setIsOpen(true)}>Ajouter une sous-catégorie</Button>
      </div>

      {loading && <p className="text-gray-500">Chargement...</p>}

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {subCategories.map((subcategory) => (
            <tr key={subcategory.id}>
              <td className="px-4 py-3 text-sm text-gray-900">{subcategory.id}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{subcategory.name}</td>
              {/* On accède directement à l'objet category renvoyé par TypeORM */}
              <td className="px-4 py-3 text-sm text-gray-500">
                {subcategory.category?.name || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">{subcategory.sku_code || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {!loading && subCategories.length === 0 && (
        <p className="text-gray-500 text-center py-4">Aucune sous-catégorie trouvée</p>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Ajouter une sous-catégorie">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie Parente</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="" disabled>-- Sélectionner une catégorie --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code SKU</label>
            <textarea
              value={formData.sku_code}
              onChange={(e) => setFormData({ ...formData, sku_code: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={1}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>Annuler</Button>
            <Button 
              type="submit" 
              onClick={handleSubmit}
            >
              Ajouter
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}