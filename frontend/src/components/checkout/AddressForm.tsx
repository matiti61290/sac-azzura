'use client'

import { useState } from "react"
import { AddressType, AddressFormData } from "@/src/types/address"
import { useRouter } from "next/navigation"
import { useAuth } from "@/src/contexts/AuthContext" // 👈 1. Import de ton hook d'authentification
import { AuthService } from "@/src/services/auth.service"
import { useCart } from "@/src/contexts/CartContext"

export default function AddressForm() {
    const router = useRouter()
    const { isConnected, user } = useAuth() // 👈 2. Récupération de l'état global de connexion
    const { cart } = useCart() 
    
    const [isLoading, setIsLoading] = useState(false)
    const [sameAsBilling, setSameAsBilling] = useState(true)
    
    const [formData, setFormData] = useState<Omit<AddressFormData, 'type'>>({
        street: "",
        additional: "",
        zipcode: "",
        city: ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Fonction d'envoi réadaptée
const sendAddressToBackend = async (data: AddressFormData) => {
    const csrfToken = await AuthService.getCsrfToken()
    const token = localStorage.getItem('token') 

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    // 🧼 ON ASSAINIT LE PAYLOAD ICI
    const payload = {
        street: data.street,
        zipcode: data.zipcode,
        city: data.city,
        type: data.type,
        // Si additional est vide, on ne l'inclut pas du tout dans le JSON
        ...(data.additional ? { additional: data.additional } : {}) 
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API}addresses/user/add-address`, {
        method: 'POST',
        headers: headers,
        credentials: 'include', 
        body: JSON.stringify(payload), // 👈 On envoie le payload nettoyé
    })

    if (!response.ok) {
        throw new Error(`Erreur type ${data.type}`)
    }
    return response.json()
}

   const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        if (!isConnected) {
            alert("Vous devez être connecté pour renseigner une adresse de livraison.")
            setIsLoading(false)
            return
        }

        try {
            const token = (user as any)?.token || localStorage.getItem('token') || undefined

            // 1. Envoi et récupération de l'adresse de LIVRAISON (grâce au return du back)
            const deliveryAddress = await sendAddressToBackend({ ...formData, type: AddressType.DELIVERY })
            let billingAddressId = deliveryAddress.id // Par défaut, c'est la même

            // 2. Si l'adresse de facturation est différente, on l'envoie et on récupère son ID
            if (!sameAsBilling) {
                const billingAddress = await sendAddressToBackend({ ...formData, type: AddressType.BILLING })
                billingAddressId = billingAddress.id
            }

            // --- 🚀 NOUVEAU : ENCHAINEMENT DIRECT VERS STRIPE ---
            
            // A. On récupère les jetons nécessaires pour le paiement
            const csrfToken = await AuthService.getCsrfToken()

            // B. On formate les articles du panier pour correspondre au CartItemDto[] du back
            const formattedItems = cart.map(item => ({
                sku: (item as any).sku_code || item.sku, // Détecte sku_code ou sku pour éviter tout champ vide
                quantity: item.quantity
            }))

            // C. On prépare le CartDto attendu par ton PaymentController
            const cartDto = {
                items: formattedItems,
                delivery_address_id: deliveryAddress.id,
                billing_address_id: billingAddressId,
                // promotion_code: "AUCUN"
            }

            // D. On appelle ton contrôleur de paiement
            const paymentResponse = await fetch(`${process.env.NEXT_PUBLIC_API}payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-csrf-token': csrfToken,
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                credentials: 'include',
                body: JSON.stringify(cartDto)
            })

            const paymentData = await paymentResponse.json()

            if (!paymentResponse.ok) {
                throw new Error(paymentData.message || "Impossible d'initialiser la session de paiement.")
            }

            // E. REDIRECTION MAGIQUE : On quitte Next.js pour aller sur la page sécurisée de Stripe
            if (paymentData.url) {
                window.location.href = paymentData.url
            } else {
                throw new Error("L'URL de paiement Stripe n'a pas pu être générée.")
            }

        } catch (error: any) {
            console.error("Erreur Checkout / Paiement:", error)
            alert(error.message || "Oups, je n'ai pas réussi à préparer votre commande.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100 font-text">
            
            <div className="mb-8 text-center sm:text-left">
                <h2 className="text-2xl font-title text-night-blue mb-2">Où dois-je expédier votre création ?</h2>
                <p className="text-sm text-gray-500 italic">
                    Gigi prépare vos colis avec soin depuis son atelier normand.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* --- CHAMP : ADRESSE --- */}
                <div>
                    <label htmlFor="street" className="block text-sm font-semibold text-night-blue mb-1">
                        Adresse postale <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="street"
                        name="street"
                        required
                        placeholder="12 rue de la Couture"
                        value={formData.street}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange focus:border-orange outline-none transition-all"
                    />
                </div>

                {/* --- CHAMP : COMPLÉMENT (additional) --- */}
                <div>
                    <label htmlFor="additional" className="block text-sm font-semibold text-night-blue mb-1">
                        Complément d'adresse <span className="text-gray-400 font-normal">(Optionnel)</span>
                    </label>
                    <input
                        type="text"
                        id="additional"
                        name="additional"
                        placeholder="Appartement, Bâtiment, Étage..."
                        value={formData.additional}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange focus:border-orange outline-none transition-all"
                    />
                </div>

                {/* --- CHAMPS : CODE POSTAL & VILLE --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="zipcode" className="block text-sm font-semibold text-night-blue mb-1">
                            Code postal <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="zipcode"
                            name="zipcode"
                            required
                            placeholder="76000"
                            value={formData.zipcode}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange focus:border-orange outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label htmlFor="city" className="block text-sm font-semibold text-night-blue mb-1">
                            Ville <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="city"
                            name="city"
                            required
                            placeholder="Rouen"
                            value={formData.city}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange focus:border-orange outline-none transition-all"
                        />
                    </div>
                </div>

                {/* --- CHECKBOX FACTURATION IDENTIQUE --- */}
                <div className="pt-4 border-t border-gray-100">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                            <input
                                type="checkbox"
                                checked={sameAsBilling}
                                onChange={(e) => setSameAsBilling(e.target.checked)}
                                className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-md checked:bg-orange checked:border-orange transition-all cursor-pointer"
                            />
                            <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium text-night-blue group-hover:text-orange transition-colors">
                            Utiliser cette adresse pour la facturation
                        </span>
                    </label>
                </div>

                {/* --- BOUTON DE SOUMISSION --- */}
                <div className="pt-6">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center py-4 px-6 rounded-xl text-white font-semibold tracking-wide text-base bg-night-blue hover:bg-[#06089e] active:scale-[0.98] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-150 shadow-lg shadow-night-blue/20"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                Enregistrement...
                            </span>
                        ) : (
                            "Continuer vers le paiement"
                        )}
                    </button>
                </div>

            </form>
        </div>
    )
}