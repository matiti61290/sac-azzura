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
  const [formData, setFormData] = useState({ code: '', nom: '' });

  const handleSubmit = async () => {
    await onAddColor(formData);
    setIsOpen(false);
    setFormData({ code: '', nom: '' });
    onRefresh();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Couleurs</h3>
        <Button onClick={() => setIsOpen(true)}>Ajouter une couleur</Button>
      </div>

      {loading && <p className="text-gray-500">Chargement...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {colors.map((color) => (
          <div key={color.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div
              className="w-12 h-12 rounded-full shadow-sm border border-gray-200"
              style={{ backgroundColor: color.code }}
            />
            <div>
              <p className="font-medium text-gray-900">{color.nom || color.code}</p>
              <p className="text-xs text-gray-500">#{color.code.toUpperCase()}</p>
            </div>
          </div>
        ))}
      </div>

      {!loading && colors.length === 0 && (
        <p className="text-gray-500 text-center py-4">Aucune couleur trouvée</p>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Ajouter une couleur">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code HEX</label>
            <input
              type="text"
              placeholder="#FF5733"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
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