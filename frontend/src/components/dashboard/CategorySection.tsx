'use client';

import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import type { Category } from '../../types/dashboard.types';

interface CategorySectionProps {
  categories: Category[];
  loading: boolean;
  onRefresh: () => void;
  onAddCategory: (category?: Partial<Category>) => Promise<Category[]>;
}

export default function CategorySection({
  categories,
  loading,
  onRefresh,
  onAddCategory,
}: CategorySectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', sku_code: '' });

  const handleSubmit = async () => {
    await onAddCategory(formData);
    setIsOpen(false);
    setFormData({ name: '', sku_code: '' });
    onRefresh();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Catégories</h3>
        <Button onClick={() => setIsOpen(true)}>Ajouter une catégorie</Button>
      </div>

      {loading && <p className="text-gray-500">Chargement...</p>}

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code SKU</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {categories.map((category) => (
            <tr key={category.id}>
              <td className="px-4 py-3 text-sm text-gray-900">{category.id}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{category.name}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{category.sku_code || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {!loading && categories.length === 0 && (
        <p className="text-gray-500 text-center py-4">Aucune catégorie trouvée</p>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Ajouter une catégorie">
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
            <Button type="submit" onClick={handleSubmit}>Ajouter</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}