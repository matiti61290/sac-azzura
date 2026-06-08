'use client';

import { useState } from 'react';
import type { User } from '../../types/dashboard.types';

interface UserEditForm {
  id?: number;
  firstname: string;
  lastname: string;
  mail: string;
  isVerified: boolean;
}

interface UserSectionProps {
  users: User[];
  loading: boolean;
  onAddUser?: (formData: FormData) => Promise<boolean>;
  onUpdateUser?: (userId: number, formData: FormData) => Promise<boolean>;
  onDeleteUser?: (userId: number) => Promise<void>;
}

export default function UserSection({
  users,
  loading,
  onAddUser,
  onUpdateUser,
  onDeleteUser
}: UserSectionProps) {
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<UserEditForm>({
    id: undefined,
    firstname: '',
    lastname: '',
    mail: '',
    isVerified: false,
  });

  const handleEditUser = (user: User) => {
    setEditFormData({
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      mail: user.mail || '',
      isVerified: user.isVerified,
    });
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        if (onDeleteUser) {
          await onDeleteUser(userId);
        }
      } catch (error) {
        console.error("Erreur lors de la suppression de l'utilisateur :", error);
        alert("Une erreur est survenue lors de la suppression.");
      }
    }
  };

  const handleSubmitUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('firstname', editFormData.firstname);
    data.append('lastname', editFormData.lastname);
    data.append('mail', editFormData.mail);
    data.append('isVerified', editFormData.isVerified.toString());

    if (editFormData.id) {
      const isSuccess = await onUpdateUser?.(editFormData.id, data);
      
      if (isSuccess) {
        setIsModalOpen(false);
        setEditFormData({ id: undefined, firstname: '', lastname: '', mail: '', isVerified: false });
      }
    } else {
      const isSuccess = await onAddUser?.(data);
      
      if (isSuccess) {
        setIsModalOpen(false);
        setEditFormData({ id: undefined, firstname: '', lastname: '', mail: '', isVerified: false });
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Utilisateurs ({users?.length || 0})</h3>
        {onAddUser && (
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded">
            + Nouveau Utilisateur
          </button>
        )}
      </div>

      {loading && <p className="text-gray-500">Chargement...</p>}

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prénom</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">État</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-4 py-3 text-sm text-gray-900">{user.id}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{user.firstname}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{user.lastname}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{user.mail || '-'}</td>
              <td className="px-4 py-3 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  user.isVerified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user.isVerified ? 'Vérifié' : 'Non vérifié'}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                {onUpdateUser && (
                  <button 
                    onClick={() => handleEditUser(user)} 
                    className="text-blue-600 hover:underline text-sm mr-2"
                  >
                    Éditer
                  </button>
                )}
                {onDeleteUser && (
                  <button 
                    onClick={() => handleDeleteUser(user.id)} 
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

      {!loading && users.length === 0 && (
        <p className="text-gray-500 text-center py-4">Aucun utilisateur trouvé</p>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center overflow-y-auto z-50">
          <div className="bg-white p-8 rounded-lg w-full max-w-md my-8">
            <h3 className="text-2xl mb-4">{editFormData.id ? 'Modifier un utilisateur' : 'Ajouter un utilisateur'}</h3>
            
            <form onSubmit={handleSubmitUser} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="text"
                  placeholder="Prénom" 
                  className="border p-2 rounded"
                  value={editFormData.firstname}
                  onChange={(e) => setEditFormData({...editFormData, firstname: e.target.value})}
                  required
                />
                <input 
                  type="text"
                  placeholder="Nom" 
                  className="border p-2 rounded"
                  value={editFormData.lastname}
                  onChange={(e) => setEditFormData({...editFormData, lastname: e.target.value})}
                  required
                />
              </div>

              <input 
                type="email"
                placeholder="Email" 
                className="border p-2 rounded w-full"
                value={editFormData.mail}
                onChange={(e) => setEditFormData({...editFormData, mail: e.target.value})}
                required
              />

              <div className="flex items-center">
                <input 
                  type="checkbox"
                  id="isVerified"
                  checked={editFormData.isVerified}
                  onChange={(e) => setEditFormData({...editFormData, isVerified: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="isVerified" className="text-sm">Compte vérifié</label>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600">Annuler</button>
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">{editFormData.id ? 'Mettre à jour' : 'Sauvegarder'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
