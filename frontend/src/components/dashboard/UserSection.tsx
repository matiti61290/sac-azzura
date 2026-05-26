'use client';

import type { User } from '../../types/dashboard.types';

interface UserSectionProps {
  users: User[];
  loading: boolean;
  onRefresh: () => void;
}

export default function UserSection({
  users,
  loading
}: UserSectionProps) {

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Utilisateurs</h3>
      </div>

      {loading && <p className="text-gray-500">Chargement...</p>}

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-4 py-3 text-sm text-gray-900">{user.id}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{user.lastname}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{user.mail || '-'}</td>
              <td className="px-4 py-3 text-sm text-gray-500">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  'bg-green-100 text-green-800'
                }`}>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!loading && users.length === 0 && (
        <p className="text-gray-500 text-center py-4">Aucun utilisateur trouvé</p>
      )}
    </div>
  );
}