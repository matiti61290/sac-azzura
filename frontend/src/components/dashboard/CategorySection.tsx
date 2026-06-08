'use client';

import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import type { Category } from '../../types/dashboard.types';

interface CategoryEditForm {
  id?: number;
  name: string;
  sku_code?: string;
}

interface CategorySectionProps {
  categories: Category[];
  loading: boolean;
  onAddCategory?: (category: Omit<Category, 'id'>) => Promise<boolean>;
  onUpdateCategory?: (categoryId: number, category: Partial<Category>) => Promise<boolean>;
  onDeleteCategory?: (categoryId: number) => Promise<void>;
}

export default function CategorySection({
  categories,
  loading,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}: CategorySectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<CategoryEditForm>({
    id: undefined,
    name: '',
    sku_code: '',
  });

  const handleEditCategory = (category: Category) => {
    setFormData({
      id: category.id,
      name: category.name,
      sku_code: category.sku_code || '',
    });
    setIsOpen(true);
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      try {
        if (onDeleteCategory) {
          await onDeleteCategory(categoryId);
        }
      } catch (error) {
        console.error("Erreur lors de la suppression de la catégorie :", error);
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) return;

    if (formData.id && onUpdateCategory) {
      const isSuccess = await onUpdateCategory(formData.id, formData);
      if (isSuccess) {
        setIsOpen(false);
        setFormData({ id: undefined, name: '', sku_code: '' });
      }
    } else if (onAddCategory) {
      const isSuccess = await onAddCategory(formData as Omit<Category, 'id'>);
      if (isSuccess) {
        setIsOpen(false);
        setFormData({ id: undefined, name: '', sku_code: '' });
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Catégories ({categories?.length || 0})</h3>
        {onAddCategory && (
          <button onClick={() => setIsOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded">
            + Ajouter une catégorie
          </button>
        )}
      </div>

      {loading && <p className="text-gray-500">Chargement...</p>}

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code SKU</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {categories.map((category) => (
            <tr key={category.id}>
              <td className="px-4 py-3 text-sm text-gray-900">{category.id}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{category.name}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{category.sku_code || '-'}</td>
              <td className="px-4 py-3 text-right">
                {onUpdateCategory && (
                  <button 
                    onClick={() => handleEditCategory(category)} 
                    className="text-blue-600 hover:underline text-sm mr-2"
                  >
                    Éditer
                  </button>
                )}
                {onDeleteCategory && (
                  <button 
                    onClick={() => handleDeleteCategory(category.id)} 
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

      {!loading && categories.length === 0 && (
        <p className="text-gray-500 text-center py-4">Aucune catégorie trouvée</p>
      )}

      {isOpen && (
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={formData.id ? 'Modifier une catégorie' : 'Ajouter une catégorie'}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nom de la catégorie"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code SKU (optionnel)</label>
              <input
                type="text"
                value={formData.sku_code}
                onChange={(e) => setFormData({ ...formData, sku_code: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="CODE-CATEGORIE"
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
