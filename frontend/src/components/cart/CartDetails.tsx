'use client'

import { useCart } from '@/src/contexts/CartContext';
import Link from 'next/link';

export default function CartDetails() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Votre panier est vide</h2>
        <p className="text-gray-600 mb-8">L'atelier de Gigi a plein de belles créations qui n'attendent que vous !</p>
        <Link 
          href="/products" 
          className="bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 transition"
        >
          Découvrir la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      {/* Liste des articles (Prend 8 colonnes) */}
      <div className="lg:col-span-8 space-y-6">
        {cart.map((item) => (
          <div key={item.stockId} className="flex gap-6 border-b pb-6">
            <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {item.materialName} • {item.colorName}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Réf: {item.sku}</p>
                </div>
                <p className="font-bold">{item.price} €</p>
              </div>

              <div className="flex justify-between items-end mt-4">
                <div className="flex items-center border rounded-md">
                  <button 
                    onClick={() => updateQuantity(item.stockId, item.quantity - 1)}
                    className="px-3 py-1 hover:bg-gray-100"
                  >-</button>
                  <span className="px-3 py-1 text-sm">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.stockId, item.quantity + 1)}
                    className="px-3 py-1 hover:bg-gray-100"
                  >+</button>
                </div>
                
                <button 
                  onClick={() => removeFromCart(item.stockId)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Retirer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Résumé de la commande (Prend 4 colonnes) */}
      <div className="lg:col-span-4">
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h2 className="text-lg font-bold mb-4 border-b pb-4">Résumé de votre commande</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total</span>
              <span>{cartTotal} €</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Livraison</span>
              <span>Calculée à l'étape suivante</span>
            </div>
          </div>

          <div className="flex justify-between font-bold text-xl border-t pt-4 mb-6">
            <span>Total estimé</span>
            <span>{cartTotal} €</span>
          </div>

          <Link href="/checkout" className="w-full bg-black text-white py-4 rounded-md font-bold hover:bg-gray-800 transition">
            Valider la commande
          </Link>
        </div>
      </div>
    </div>
  );
}