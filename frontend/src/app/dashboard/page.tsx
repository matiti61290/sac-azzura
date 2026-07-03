'use client';

import type { Product, Category, SubCategory, Color, Material, User } from '@/src/types/dashboard.types';
import UserSection from '@/src/components/dashboard/UserSection';
import CategorySection from '@/src/components/dashboard/CategorySection';
import SubcategorySection from '@/src/components/dashboard/SubcategorySection';
import ColorsSection from '@/src/components/dashboard/ColorsSection';
import MaterialsSection from '@/src/components/dashboard/MaterialsSection';
import ProductSection from '@/src/components/dashboard/ProductSection';
import { useCrud } from '@/src/hooks/useCrud';

export default function Dashboard() {
  const users = useCrud<User>('user', 'user', true);
  const categories = useCrud<Category>('category', 'category');
  const subcategories = useCrud<SubCategory>('subcategory', 'subcategory');
  const colors = useCrud<Color>('colors', 'color');
  const materials = useCrud<Material>('materials', 'material');
  const products = useCrud<Product>('products', 'product', true);

  const globalLoading = products.loading && categories.loading;

  if (globalLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500 text-xl">Chargement du dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Dashboard SAC AZZURA</h1>

        <div className="mb-6">
          <ProductSection 
            products={products.data}
            categories={categories.data}
            subcategories={subcategories.data}
            colors={colors.data}
            materials={materials.data}
            loading={products.loading}
            onAddProduct={products.add}
            onUpdateProduct={products.update}
            onDeleteProduct={products.remove}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <UserSection
              users={users.data}
              loading={users.loading}
              onAddUser={users.add}
              onUpdateUser={users.update}
              onDeleteUser={users.remove}
            />
          </div>

          <CategorySection
            categories={categories.data}
            loading={categories.loading}
            onAddCategory={categories.add}
            onUpdateCategory={categories.update}
            onDeleteCategory={categories.remove}
          />

          <SubcategorySection
            subCategories={subcategories.data}
            categories={categories.data} 
            loading={subcategories.loading}
            onAddSubCategory={subcategories.add}
            onUpdateSubCategory={subcategories.update}
            onDeleteSubCategory={subcategories.remove}
          />

          <ColorsSection
            colors={colors.data}
            loading={colors.loading}
            onAddColor={colors.add}
            onUpdateColor={colors.update}
            onDeleteColor={colors.remove}
          />

          <MaterialsSection
            materials={materials.data}
            loading={materials.loading}
            onAddMaterial={materials.add}
            onUpdateMaterial={materials.update}
            onDeleteMaterial={materials.remove}
          />
        </div>
      </div>
    </div>
  );
}