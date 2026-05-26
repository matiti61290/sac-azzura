'use client';

import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import type { SubCategory } from '../../types/dashboard.types';

interface SubcategorySectionProps {
  subCategories: SubCategory[];
  loading: boolean;
  onRefresh: () => void;
  onAddSubCategory: (subCategory?: Partial<SubCategory>) => Promise<SubCategory[]>;
}

export default function SubcategorySection({
  subCategories,
  loading,
  onRefresh,
  onAddSubCategory,
}: SubcategorySectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ nom: '', description: '' });

  const handleSubmit = async () => {
    await onAddSubCategory(formData);
    setIsOpen(false);
    setFormData({ nom: '', description: '' });
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
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {subCategories.map((subcategory) => (
            <tr key={subcategory.id}>
              <td className="px-4 py-3 text-sm text-gray-900">{subcategory.id}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{subcategory.nom}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{subcategory.description || '-'}</td>
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
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>Annuler</Button>
            <Button type="submit" onClick={handleSubmit}>Ajouter</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}