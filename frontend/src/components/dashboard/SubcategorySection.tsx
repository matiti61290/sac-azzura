'use client';

import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import type { SubCategory, Category } from '../../types/dashboard.types';

interface SubCategoryEditForm {
  id?: number;
  name: string;
  categoryId?: number;
  sku_code?: string;
}

interface SubcategorySectionProps {
  subCategories: SubCategory[];
  categories: Category[];
  loading: boolean;
  onAddSubCategory?: (subCategory: Omit<SubCategory, 'id' | 'category'>) => Promise<boolean>;
  onUpdateSubCategory?: (id: number, subCategory: Partial<SubCategory>) => Promise<boolean>;
  onDeleteSubCategory?: (id: number) => Promise<void>;
}

export default function SubcategorySection({
  subCategories,
  categories,
  loading,
  onAddSubCategory,
  onUpdateSubCategory,
  onDeleteSubCategory,
}: SubcategorySectionProps) {
  const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState<SubCategoryEditForm>({
  id: undefined,
  name: '',
  categoryId: undefined,
  sku_code: '',
});

  const handleEditSubCategory = (subCategory: SubCategory) => {
    setFormData({
      id: subCategory.id,
      name: subCategory.name,
      categoryId: subCategory.category?.id || undefined,
      sku_code: subCategory.sku_code || '',
    });
    setIsOpen(true);
  };

  const handleDeleteSubCategory = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette sous-catégorie ?')) {
      try {
        if (onDeleteSubCategory) {
          await onDeleteSubCategory(id);
        }
      } catch (error) {
        console.error("Erreur lors de la suppression de la sous-catégorie :", error);
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) return;

    type SubCategoryWithoutIdAndCategory = Omit<SubCategory, 'id' | 'category'>;
    const payload: SubCategoryWithoutIdAndCategory = {
      name: formData.name,
      categoryId: formData.categoryId !== undefined ? Number(formData.categoryId) : 0,
      sku_code: formData.sku_code || '',
    };

    if (formData.id && onUpdateSubCategory) {
      const isSuccess = await onUpdateSubCategory(formData.id, payload as Partial<SubCategory>);
      if (isSuccess) {
        setIsOpen(false);
        setFormData({ id: undefined, name: '', categoryId: undefined, sku_code: '' });
      }
    } else if (onAddSubCategory) {
      const isSuccess = await onAddSubCategory(payload as SubCategoryWithoutIdAndCategory);
      if (isSuccess) {
        setIsOpen(false);
        setFormData({ id: undefined, name: '', categoryId: undefined, sku_code: '' });
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Sous-catégories ({subCategories?.length || 0})</h3>
        {onAddSubCategory && (
          <button onClick={() => setIsOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded">
            + Ajouter une sous-catégorie
          </button>
        )}
      </div>

      {loading && <p className="text-gray-500">Chargement...</p>}

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie Parente</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {subCategories.map((subcategory) => (
            <tr key={subcategory.id}>
              <td className="px-4 py-3 text-sm text-gray-900">{subcategory.id}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{subcategory.name}</td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {subcategory.category?.name || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">{subcategory.sku_code || '-'}</td>
              <td className="px-4 py-3 text-right">
                {onUpdateSubCategory && (
                  <button 
                    onClick={() => handleEditSubCategory(subcategory)} 
                    className="text-blue-600 hover:underline text-sm mr-2"
                  >
                    Éditer
                  </button>
                )}
                {onDeleteSubCategory && (
                  <button 
                    onClick={() => handleDeleteSubCategory(subcategory.id)} 
                    className="text-red-600 hover:underline text-sm"
                  >
                    Supprimer
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!loading && subCategories.length === 0 && (
        <p className="text-gray-500 text-center py-4">Aucune sous-catégorie trouvée</p>
      )}

      {isOpen && (
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={formData.id ? 'Modifier une sous-catégorie' : 'Ajouter une sous-catégorie'}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nom de la sous-catégorie"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie Parente</label>
              <select
                value={formData.categoryId || ''}
                onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Code SKU (optionnel)</label>
              <input
                type="text"
                value={formData.sku_code}
                onChange={(e) => setFormData({ ...formData, sku_code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="SKU de la sous-catégorie"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="secondary" onClick={() => setIsOpen(false)}>Annuler</Button>
              <Button type="submit" onClick={handleSubmit}>
                {formData.id ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
