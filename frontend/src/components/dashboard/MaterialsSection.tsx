'use client';

import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import type { Material } from '../../types/dashboard.types';

interface MaterialEditForm {
  id?: number;
  name: string;
  sku_code?: string;
}

interface MaterialsSectionProps {
  materials: Material[];
  loading: boolean;
  onAddMaterial?: (material: Omit<Material, 'id'>) => Promise<boolean>;
  onUpdateMaterial?: (materialId: number, material: Partial<Material>) => Promise<boolean>;
  onDeleteMaterial?: (materialId: number) => Promise<void>;
}

export default function MaterialsSection({
  materials,
  loading,
  onAddMaterial,
  onUpdateMaterial,
  onDeleteMaterial,
}: MaterialsSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<MaterialEditForm>({
    id: undefined,
    name: '',
    sku_code: '',
  });

  const handleEditMaterial = (material: Material) => {
    setFormData({
      id: material.id,
      name: material.name || '',
      sku_code: material.sku_code || '',
    });
    setIsOpen(true);
  };

  const handleDeleteMaterial = async (materialId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce matériau ?')) {
      try {
        if (onDeleteMaterial) {
          await onDeleteMaterial(materialId);
        }
      } catch (error) {
        console.error("Erreur lors de la suppression du matériau :", error);
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) return;

    if (formData.id && onUpdateMaterial) {
      const isSuccess = await onUpdateMaterial(formData.id, formData);
      if (isSuccess) {
        setIsOpen(false);
        setFormData({ id: undefined, name: '', sku_code: '' });
      }
    } else if (onAddMaterial) {
      const isSuccess = await onAddMaterial(formData as Omit<Material, 'id'>);
      if (isSuccess) {
        setIsOpen(false);
        setFormData({ id: undefined, name: '', sku_code: '' });
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Matériaux ({materials?.length || 0})</h3>
        {onAddMaterial && (
          <button onClick={() => setIsOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded">
            + Ajouter un matériau
          </button>
        )}
      </div>

      {loading && <p className="text-gray-500">Chargement...</p>}

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description/Code SKU</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {materials.map((material) => (
            <tr key={material.id}>
              <td className="px-4 py-3 text-sm text-gray-900">{material.id}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{material.name || '-'}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{material.sku_code || '-'}</td>
              <td className="px-4 py-3 text-right">
                {onUpdateMaterial && (
                  <button 
                    onClick={() => handleEditMaterial(material)} 
                    className="text-blue-600 hover:underline text-sm mr-2"
                  >
                    Éditer
                  </button>
                )}
                {onDeleteMaterial && (
                  <button 
                    onClick={() => handleDeleteMaterial(material.id)} 
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

      {!loading && materials.length === 0 && (
        <p className="text-gray-500 text-center py-4">Aucun matériau trouvé</p>
      )}

      {isOpen && (
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={formData.id ? 'Modifier un matériau' : 'Ajouter un matériau'}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Coton, Polyester..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code SKU (optionnel)</label>
              <textarea
                value={formData.sku_code}
                onChange={(e) => setFormData({ ...formData, sku_code: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={1}
                placeholder="COTON-BASIQUE"
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
