'use client';

import { useEffect, useState } from 'react';
import type { User, Category, SubCategory, Color, Material } from '../../types/dashboard.types';
import UserSection from '@/src/components/dashboard/UserSection';
import CategorySection from '@/src/components/dashboard/CategorySection';
import SubcategorySection from '@/src/components/dashboard/SubcategorySection';
import ColorsSection from '@/src/components/dashboard/ColorsSection';
import MaterialsSection from '@/src/components/dashboard/MaterialsSection';
import { AuthService } from '@/src/services/auth.service';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  useEffect(() => {
    fetchAllData();
  }, [])

  const fetchAllData = async () => {
    try {
      // Charger les utilisateurs
      const usersResponse: Response = await fetch(`${process.env.NEXT_PUBLIC_API}user`, {
        method: 'GET',
        credentials: 'include'
      });
      if (usersResponse.ok) {
        const data: User[] = await usersResponse.json();
        setUsers(data);
      }

      // Charger les catégories
      const categoriesResponse: Response = await fetch(`${process.env.NEXT_PUBLIC_API}category/`, {
        method: 'GET',
        credentials: 'include'
      });
      if (categoriesResponse.ok) {
        const data: Category[] = await categoriesResponse.json();
        setCategories(data);
      }

      // Charger les sous-catégories
      const subcategoriesResponse: Response = await fetch(`${process.env.NEXT_PUBLIC_API}subcategory/`, {
        method: 'GET',
        credentials: 'include'
      });
      if (subcategoriesResponse.ok) {
        const data: SubCategory[] = await subcategoriesResponse.json();
        setSubcategories(data);
      }

      // Charger les couleurs
      const colorsResponse: Response = await fetch(`${process.env.NEXT_PUBLIC_API}colors/`, {
        method: 'GET',
        credentials: 'include'
      });
      if (colorsResponse.ok) {
        const data: Color[] = await colorsResponse.json();
        setColors(data);
      }

      // Charger les matériaux
      const materialsResponse: Response = await fetch(`${process.env.NEXT_PUBLIC_API}material/`, {
        method: 'GET',
        credentials: 'include'
      });
      if (materialsResponse.ok) {
        const data: Material[] = await materialsResponse.json();
        setMaterials(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (category?: Partial<Category>): Promise<Category[]> => {
    const csrfToken = await AuthService.getCsrfToken()
    const response: Response = await fetch(`${process.env.NEXT_PUBLIC_API}category/add-category`, {
      method: 'POST',
      credentials: 'include',
      headers: { 
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken
      },
      body: JSON.stringify(category),
    });
    return await response.json();
  };

  const handleAddSubcategory = async (subcategory?: Partial<SubCategory>): Promise<SubCategory[]> => {
    const csrfToken = await AuthService.getCsrfToken()
    const response: Response = await fetch(`${process.env.NEXT_PUBLIC_API}subcategory/add-subcategory`, {
      method: 'POST',
      credentials: 'include', // Ajouté pour l'authentification par cookie
      headers: { 
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken
      },
      body: JSON.stringify(subcategory),
    });
    return await response.json();
  };

  const handleAddColor = async (color?: Partial<Color>): Promise<Color[]> => {
    const csrfToken = await AuthService.getCsrfToken()
    const response: Response = await fetch(`${process.env.NEXT_PUBLIC_API}colors/add-color`, {
      method: 'POST',
      credentials: 'include', // Ajouté
      headers: { 
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken
      },
      body: JSON.stringify(color),
    });
    return await response.json();
  };

  const handleAddMaterial = async (material?: Partial<Material>): Promise<Material[]> => {
    const csrfToken = await AuthService.getCsrfToken()
    const response: Response = await fetch(`${process.env.NEXT_PUBLIC_API}material/add-material`, {
      method: 'POST',
      credentials: 'include', // Ajouté
      headers: { 
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken
      },
      body: JSON.stringify(material),
    });
    return await response.json();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Dashboard SAC AZZURA</h1>
          <p className="text-gray-500 text-center">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Dashboard SAC AZZURA</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <UserSection
            users={users}
            loading={loading}
            onRefresh={fetchAllData}
          />

          <CategorySection
            categories={categories}
            loading={loading}
            onRefresh={fetchAllData}
            onAddCategory={handleAddCategory}
          />

          <SubcategorySection
            subCategories={subcategories}
            categories={categories} // On passe les catégories ici !
            loading={loading}
            onRefresh={fetchAllData}
            onAddSubCategory={handleAddSubcategory}
          />

          <ColorsSection
            colors={colors}
            loading={loading}
            onRefresh={fetchAllData}
            onAddColor={handleAddColor}
          />

          <MaterialsSection
            materials={materials}
            loading={loading}
            onRefresh={fetchAllData}
            onAddMaterial={handleAddMaterial}
          />
        </div>
      </div>
    </div>
  );
}