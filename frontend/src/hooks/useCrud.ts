import { useState, useCallback, useEffect } from 'react';
import { AuthService } from '@/src/services/auth.service';

interface CrudHook<T> {
  data: T[];
  loading: boolean;
  refresh: () => Promise<void>;
  add: (payload: any) => Promise<boolean>;
  update: (id: number, payload: any) => Promise<boolean>;
  remove: (id: number) => Promise<void>;
}

export function useCrud<T>(
  basePath: string, 
  actionPath: string, 
  isFormData = false
): CrudHook<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  // === UTILITAIRE URL ===
  const buildUrl = (endpoint: string) => {
    const baseUrl = (process.env.NEXT_PUBLIC_API || '').replace(/\/$/, '');
    const cleanEndpoint = endpoint.replace(/^\//, '');
    return `${baseUrl}/${cleanEndpoint}`;
  };

  // === READ ===
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = basePath.endsWith('/') ? basePath : `${basePath}/`;
      
      const response = await fetch(buildUrl(endpoint), {
        method: 'GET',
        credentials: 'include'
      });
      if (response.ok) {
        setData(await response.json());
      }
    } catch (error) {
      console.error(`Erreur GET sur ${basePath}:`, error);
    } finally {
      setLoading(false);
    }
  }, [basePath]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // === CREATE ===
  const add = async (payload: any): Promise<boolean> => {
    try {
      const csrfToken = await AuthService.getCsrfToken();
      const headers: Record<string, string> = { 'x-csrf-token': csrfToken };
      if (!isFormData) headers['Content-Type'] = 'application/json';

      let bodyData = payload;
      if (isFormData && payload instanceof FormData && basePath === 'user') {
         const obj = Object.fromEntries(payload.entries());
         bodyData = JSON.stringify({ ...obj, isVerified: true });
         headers['Content-Type'] = 'application/json';
      } else if (!isFormData) {
         bodyData = JSON.stringify(payload);
      }

      const response = await fetch(buildUrl(`${basePath}/add-${actionPath}`), {
        method: 'POST',
        credentials: 'include',
        headers,
        body: bodyData,
      });

      if (response.ok) {
        await refresh();
        return true;
      }
      
      const errorData = await response.json().catch(() => ({}));
      console.error(`Erreur 400 POST sur ${basePath}:`, errorData);
      return false;
    } catch (error) {
      console.error(`Erreur POST sur ${basePath}:`, error);
      return false;
    }
  };

  // === UPDATE ===
  const update = async (id: number, payload: any): Promise<boolean> => {
    try {
      const csrfToken = await AuthService.getCsrfToken();
      const headers: Record<string, string> = { 'x-csrf-token': csrfToken };
      if (!isFormData) headers['Content-Type'] = 'application/json';

      let bodyData;
      
      // NETTOYAGE DE L'ID POUR TOUTES LES UPDATES
      if (isFormData && payload instanceof FormData) {
          const obj = Object.fromEntries(payload.entries());
          delete obj.id; // Nettoyage
          
          if(basePath === 'user') {
              bodyData = JSON.stringify({ ...obj, isVerified: true });
          } else {
              bodyData = JSON.stringify(obj);
          }
          headers['Content-Type'] = 'application/json';
      } else if (!isFormData) {
         const { id: _, ...cleanPayload } = payload; // Nettoyage
         bodyData = JSON.stringify(cleanPayload);
      }

      const response = await fetch(buildUrl(`${basePath}/update-${actionPath}/${id}`), {
        method: 'PATCH',
        credentials: 'include',
        headers,
        body: bodyData,
      });

      if (response.ok) {
        await refresh();
        return true;
      }
      
      // Affiche l'erreur de validation NestJS dans la console
      const errorData = await response.json().catch(() => ({}));
      console.error(`Erreur 400 PATCH sur ${basePath}:`, errorData);
      return false;
    } catch (error) {
      console.error(`Erreur PATCH sur ${basePath}:`, error);
      return false;
    }
  };

  // === DELETE ===
  const remove = async (id: number): Promise<void> => {
    try {
      const csrfToken = await AuthService.getCsrfToken();
      const response = await fetch(buildUrl(`${basePath}/delete-${actionPath}/${id}`), {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'x-csrf-token': csrfToken },
      });
      if (response.ok) {
        await refresh();
      }
    } catch (error) {
      console.error(`Erreur DELETE sur ${basePath}:`, error);
    }
  };

  return { data, loading, refresh, add, update, remove };
}