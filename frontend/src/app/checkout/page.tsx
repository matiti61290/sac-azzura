// src/app/checkout/page.tsx
import { Metadata } from "next"
import AddressForm from "@/src/components/checkout/AddressForm"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Livraison | Sac'Azura",
    description: "Renseignez vos coordonnées de livraison pour vos créations Sac'Azura.",
}

export default function CheckoutAddressPage() {
    return (
        <main className="min-h-screen bg-gray-50/50 font-text text-night-blue py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <nav className="flex items-center justify-center gap-2 md:gap-4 mb-12 text-sm font-medium">
                    <Link href="/cart" className="text-gray-400 hover:text-orange transition-colors">
                        Mon Panier
                    </Link>
                    <span className="text-gray-300">/</span>
                    <span className="text-orange font-bold border-b-2 border-orange pb-0.5">
                        Livraison
                    </span>
                    <span className="text-gray-300">/</span>
                    <span className="text-gray-400 pointer-events-none">
                        Paiement
                    </span>
                </nav>

                <AddressForm />

                <div className="max-w-2xl mx-auto mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center border-t border-gray-100 pt-8">
                    <div className="space-y-1">
                        <span className="text-xl">🇫🇷</span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-night-blue">Artisanat Français</h4>
                        <p className="text-xs text-gray-500">Confectionné en Normandie</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-xl">🔒</span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-night-blue">Paiement Sécurisé</h4>
                        <p className="text-xs text-gray-500">Données 100% chiffrées</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-xl">📦</span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-night-blue">Envoi Soigné</h4>
                        <p className="text-xs text-gray-500">Emballage éco-responsable</p>
                    </div>
                </div>

            </div>
        </main>
    )
}