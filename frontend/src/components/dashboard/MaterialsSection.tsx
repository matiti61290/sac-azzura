'use client';

import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import type { Material } from '../../types/dashboard.types';

interface MaterialsSectionProps {
  materials: Material[];
  loading: boolean;
  onRefresh: () => void;
  onAddMaterial: (material?: Partial<Material>) => Promise<Material[]>;
}

export default function MaterialsSection({
  materials,
  loading,
  onRefresh,
  onAddMaterial,
}: MaterialsSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', sku_code: '' });

  const handleSubmit = async () => {
    await onAddMaterial(formData);
    setIsOpen(false);
    setFormData({ name: '', sku_code: '' });
    onRefresh();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Matériaux</h3>
        <Button onClick={() => setIsOpen(true)}>Ajouter un matériau</Button>
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
          {materials.map((material) => (
            <tr key={material.id}>
              <td className="px-4 py-3 text-sm text-gray-900">{material.id}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{material.name}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{material.sku_code || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {!loading && materials.length === 0 && (
        <p className="text-gray-500 text-center py-4">Aucun matériau trouvé</p>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Ajouter un matériau">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
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