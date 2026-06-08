'use client';

import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import type { Color } from '../../types/dashboard.types';

interface ColorEditForm {
  id?: number;
  name: string;
  sku_code?: string;
}

interface ColorsSectionProps {
  colors: Color[];
  loading: boolean;
  onAddColor?: (color: Omit<Color, 'id'>) => Promise<boolean>;
  onUpdateColor?: (colorId: number, color: Partial<Color>) => Promise<boolean>;
  onDeleteColor?: (colorId: number) => Promise<void>;
}

export default function ColorsSection({
  colors,
  loading,
  onAddColor,
  onUpdateColor,
  onDeleteColor,
}: ColorsSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<ColorEditForm>({
    id: undefined,
    name: '',
    sku_code: '',
  });

  const handleEditColor = (color: Color) => {
    setFormData({
      id: color.id,
      name: color.name || '',
      sku_code: color.sku_code || '',
    });
    setIsOpen(true);
  };

  const handleDeleteColor = async (colorId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette couleur ?')) {
      try {
        if (onDeleteColor) {
          await onDeleteColor(colorId);
        }
      } catch (error) {
        console.error("Erreur lors de la suppression de la couleur :", error);
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) return;

    if (formData.id && onUpdateColor) {
      const isSuccess = await onUpdateColor(formData.id, formData);
      if (isSuccess) {
        setIsOpen(false);
        setFormData({ id: undefined, name: '', sku_code: '' });
      }
    } else if (onAddColor) {
      const isSuccess = await onAddColor(formData as Omit<Color, 'id'>);
      if (isSuccess) {
        setIsOpen(false);
        setFormData({ id: undefined, name: '', sku_code: '' });
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Couleurs ({colors?.length || 0})</h3>
        {onAddColor && (
          <button onClick={() => setIsOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded">
            + Ajouter une couleur
          </button>
        )}
      </div>

      {loading && <p className="text-gray-500">Chargement...</p>}

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code SKU</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {colors.map((color) => (
            <tr key={color.id}>
              <td className="px-4 py-3 text-sm text-gray-900">{color.id}</td>
              <td className="px-4 py-3 text-sm text-gray-900 font-mono">{color.name || '-'}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{color.sku_code || '-'}</td>
              <td className="px-4 py-3 text-right">
                {onUpdateColor && (
                  <button 
                    onClick={() => handleEditColor(color)} 
                    className="text-blue-600 hover:underline text-sm mr-2"
                  >
                    Éditer
                  </button>
                )}
                {onDeleteColor && (
                  <button 
                    onClick={() => handleDeleteColor(color.id)} 
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

      {!loading && colors.length === 0 && (
        <p className="text-gray-500 text-center py-4">Aucune couleur trouvée</p>
      )}

      {isOpen && (
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={formData.id ? 'Modifier une couleur' : 'Ajouter une couleur'}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="ROUGE"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code SKU (optionnel)</label>
              <input
                type="text"
                value={formData.sku_code}
                onChange={(e) => setFormData({ ...formData, sku_code: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ROUGE-001"
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
