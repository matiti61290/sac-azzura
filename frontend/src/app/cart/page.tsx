import { Metadata } from 'next';
import CartDetails from '@/src/components/cart/CartDetails';

export const metadata: Metadata = {
  title: 'Votre Panier | Sac\'Azura',
  description: 'Finalisez votre commande de créations faites main en Normandie.',
};

export default function CartPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Votre Panier</h1>
      
      <CartDetails />
      
    </main>
  );
}