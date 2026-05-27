'use client';

import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import type { Color } from '../../types/dashboard.types';

interface ColorsSectionProps {
  colors: Color[];
  loading: boolean;
  onRefresh: () => void;
  onAddColor: (color?: Partial<Color>) => Promise<Color[]>;
}

export default function ColorsSection({
  colors,
  loading,
  onRefresh,
  onAddColor,
}: ColorsSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', sku_code: '' });

  const handleSubmit = async () => {
    await onAddColor(formData);
    setIsOpen(false);
    setFormData({ name: '', sku_code: '' });
    onRefresh();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Couleurs</h3>
        <Button onClick={() => setIsOpen(true)}>Ajouter une couleur</Button>
      </div>

      {loading && <p className="text-gray-500">Chargement...</p>}

     <table className="min-w-full divide-y divide-gray-200">
  <thead className="bg-gray-50">
    <tr>
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code SKU</th>
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
    {colors.map((color) => (
      <tr key={color.id}>
        <td className="px-4 py-3 text-sm text-gray-900">{color.id}</td>
        {/* J'utilise color.nom ou color.name selon ce que ton API renvoie */}
        <td className="px-4 py-3 text-sm text-gray-900">{color.name}</td>
        {/* Pareil pour sku_code ou code */}
        <td className="px-4 py-3 text-sm text-gray-500">{color.sku_code || '-'}</td>
      </tr>
    ))}
  </tbody>
</table>

{/* Affichage d'un message si le tableau est vide */}
{!loading && colors.length === 0 && (
  <p className="text-gray-500 text-center py-4">Aucune couleur trouvée</p>
)}

      {!loading && colors.length === 0 && (
        <p className="text-gray-500 text-center py-4">Aucune couleur trouvée</p>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Ajouter une couleur">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Couleur</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">sku_code</label>
            <input
              type="text"
              value={formData.sku_code}
              onChange={(e) => setFormData({ ...formData, sku_code: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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