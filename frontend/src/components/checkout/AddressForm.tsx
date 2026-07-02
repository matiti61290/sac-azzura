'use client'

import { useState, useEffect } from "react"
import { AddressType, AddressFormData } from "@/src/types/address"
import { useAuth } from "@/src/contexts/AuthContext"
import { useCart } from "@/src/contexts/CartContext"
import { AuthService } from "@/src/services/auth.service"
import UnverifiedAccountModal from "@/src/components/ui/UnverifiedAccoundModal"

interface SavedAddress {
    id: number;
    street: string;
    additional?: string;
    zipcode: string;
    city: string;
    type: AddressType;
}

export default function AddressForm() {
    const { isConnected, user } = useAuth()
    const { cart } = useCart()
    
    const [isLoading, setIsLoading] = useState(false)
    const [sameAsBilling, setSameAsBilling] = useState(true)
    const [isUnverifiedModalOpen, setIsUnverifiedModalOpen] = useState(false)

    // Stockage des adresses déjà existantes en BDD
    const [savedDeliveries, setSavedDeliveries] = useState<SavedAddress[]>([])
    const [savedBillings, setSavedBillings] = useState<SavedAddress[]>([])
    
    // IDs des adresses sélectionnées (si l'utilisateur choisit une adresse existante)
    const [selectedDeliveryId, setSelectedDeliveryId] = useState<number | null>(null)
    const [selectedBillingId, setSelectedBillingId] = useState<number | null>(null)

    // Toggle pour forcer la saisie d'une nouvelle adresse
    const [showNewDeliveryForm, setShowNewDeliveryForm] = useState(false)
    const [showNewBillingForm, setShowNewBillingForm] = useState(false)
    
    const [formData, setFormData] = useState<Omit<AddressFormData, 'type'>>({
        street: "", additional: "", zipcode: "", city: ""
    })

    // 🔄 1. Charger les adresses enregistrées au montage du composant
    useEffect(() => {
        if (!isConnected) return

        const fetchSavedAddresses = async () => {
            const token = localStorage.getItem('token')
            
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            }
            if (token) {
                headers['Authorization'] = `Bearer ${token}`
            }

            try {
                // 🔑 AJOUT : credentials: 'include' pour envoyer le cookie de session/jwt
                const resDel = await fetch(`${process.env.NEXT_PUBLIC_API}addresses/user/delivery_addresses`, { 
                    headers,
                    credentials: 'include' 
                })
                if (resDel.ok) {
                    const data = await resDel.json()
                    setSavedDeliveries(data)
                    if (data.length > 0) setSelectedDeliveryId(data[0].id)
                    else setShowNewDeliveryForm(true)
                }

                // 🔑 AJOUT : credentials: 'include' ici aussi
                const resBill = await fetch(`${process.env.NEXT_PUBLIC_API}addresses/user/billing_addresses`, { 
                    headers,
                    credentials: 'include' 
                })
                if (resBill.ok) {
                    const data = await resBill.json()
                    setSavedBillings(data)
                    if (data.length > 0) setSelectedBillingId(data[0].id)
                }
            } catch (err) {
                console.error("Erreur chargement adresses", err)
            }
        }

        fetchSavedAddresses()
    }, [isConnected])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const sendAddressToBackend = async (data: AddressFormData) => {
        const csrfToken = await AuthService.getCsrfToken()
        const token = localStorage.getItem('token') 
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken,
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }

        const payload = {
            street: data.street, zipcode: data.zipcode, city: data.city, type: data.type,
            ...(data.additional ? { additional: data.additional } : {}) 
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API}addresses/user/add-address`, {
            method: 'POST',
            headers,
            credentials: 'include', 
            body: JSON.stringify(payload),
        })

        if (!response.ok) throw new Error(`Erreur type ${data.type}`)
        return response.json()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true) // On lance le chargement du bouton

        try {
            let finalDeliveryId = selectedDeliveryId
            let finalBillingId = selectedBillingId

            if (showNewDeliveryForm) {
                const newDelivery = await sendAddressToBackend({ ...formData, type: AddressType.DELIVERY })
                finalDeliveryId = newDelivery.id
            }

            if (sameAsBilling) {
                finalBillingId = finalDeliveryId
            } else if (showNewBillingForm) {
                const newBilling = await sendAddressToBackend({ ...formData, type: AddressType.BILLING })
                finalBillingId = newBilling.id
            }

            if (!finalDeliveryId || !finalBillingId) {
                throw new Error("Veuillez sélectionner ou renseigner vos adresses.")
            }

            const csrfToken = await AuthService.getCsrfToken()
            const token = localStorage.getItem('token')

            const cartDto = {
                items: cart.map(item => ({ sku: item.sku, quantity: item.quantity })),
                delivery_address_id: finalDeliveryId,
                billing_address_id: finalBillingId,
                promotion_code: "AUCUN"
            }

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
                // 🌟 L'INTERCEPTION MAGIQUE : 
                // Si le serveur répond 403, c'est que le ForbiddenException du compte non vérifié s'est activé !
                if (paymentResponse.status === 403) {
                    setIsUnverifiedModalOpen(true) // On ouvre ta jolie modal
                    return // On stoppe l'exécution ici (sans passer par le catch)
                }

                // Pour toutes les autres erreurs (ex: 400, 500), on lève l'erreur classique
                throw new Error(paymentData.message || "Erreur lors de la préparation du paiement.")
            }

            // Si tout est OK, redirection vers Stripe
            if (paymentData.url) {
                window.location.href = paymentData.url 
            }

        } catch (error: any) {
            console.error(error)
            alert(error.message || "Une erreur est survenue.")
        } finally {
            setIsLoading(false) // Libère le bouton dans tous les cas
        }
    }

return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100 font-text text-night-blue">
        <div className="mb-8 text-center sm:text-left">
            <h2 className="text-2xl font-title mb-2">Où doit-on expédier votre création ?</h2>
            <p className="text-sm text-gray-500 italic">Gigi prépare vos colis avec soin depuis son atelier normand.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* --- SECTION 1 : ADRESSES DE LIVRAISON ENREGISTRÉES --- */}
            {savedDeliveries.length > 0 && !showNewDeliveryForm && (
                <div>
                    <label className="block text-sm font-bold uppercase tracking-wider text-night-blue/60 mb-3">
                        Vos adresses de livraison enregistrées
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                        {savedDeliveries.map((addr) => (
                            <div 
                                key={addr.id}
                                onClick={() => setSelectedDeliveryId(addr.id)}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedDeliveryId === addr.id ? 'border-orange bg-orange/5 font-semibold' : 'border-gray-200 hover:border-gray-300'}`}
                            >
                                <p className="text-sm">{addr.street} {addr.additional && `(${addr.additional})`}</p>
                                <p className="text-xs text-gray-500">{addr.zipcode} {addr.city}</p>
                            </div>
                        ))}
                    </div>
                    <button 
                        type="button" 
                        onClick={() => setShowNewDeliveryForm(true)}
                        className="mt-3 text-xs font-semibold text-orange hover:underline"
                    >
                        ➕ Utiliser une autre adresse de livraison
                    </button>
                </div>
            )}

            {/* --- FORMULAIRE ADRESSE DE LIVRAISON (S'affiche si demandé ou si aucune adresse en BDD) --- */}
            {showNewDeliveryForm && (
                <div className="space-y-4 bg-gray-50/50 p-4 rounded-xl border border-gray-150">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold uppercase text-night-blue/60">Nouvelle adresse de livraison</h3>
                        {savedDeliveries.length > 0 && (
                            <button type="button" onClick={() => setShowNewDeliveryForm(false)} className="text-xs text-gray-400 hover:underline">Annuler</button>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-semibold mb-1">Adresse postale *</label>
                        <input type="text" name="street" required value={formData.street} onChange={handleChange} className="w-full px-4 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-orange" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold mb-1">Complément (Optionnel)</label>
                        <input type="text" name="additional" value={formData.additional} onChange={handleChange} className="w-full px-4 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-orange" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold mb-1">Code postal *</label>
                            <input type="text" name="zipcode" required value={formData.zipcode} onChange={handleChange} className="w-full px-4 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-orange" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1">Ville *</label>
                            <input type="text" name="city" required value={formData.city} onChange={handleChange} className="w-full px-4 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-orange" />
                        </div>
                    </div>
                </div>
            )}

            {/* --- SELECTION FACTURATION --- */}
            <div className="pt-4 border-t border-gray-100">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={sameAsBilling} onChange={(e) => setSameAsBilling(e.target.checked)} className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-md checked:bg-orange checked:border-orange transition-all" />
                    <span className="text-sm font-medium">Utiliser cette adresse pour la facturation</span>
                </label>
            </div>

            {/* --- OPTIONNEL : ADRESSE FACTURATION SÉPARÉE --- */}
            {!sameAsBilling && savedBillings.length > 0 && !showNewBillingForm && (
                <div className="pt-4 border-t">
                    <label className="block text-sm font-bold uppercase tracking-wider text-night-blue/60 mb-3">Adresse de facturation</label>
                    <div className="grid grid-cols-1 gap-2">
                        {savedBillings.map((addr) => (
                            <div 
                                key={addr.id}
                                onClick={() => setSelectedBillingId(addr.id)}
                                className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedBillingId === addr.id ? 'border-orange bg-orange/5' : 'border-gray-200'}`}
                            >
                                <p className="text-xs font-semibold">{addr.street} — {addr.zipcode} {addr.city}</p>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={() => setShowNewBillingForm(true)} className="mt-2 text-xs font-semibold text-orange hover:underline">➕ Créer une nouvelle adresse de facturation</button>
                </div>
            )}

            <div className="pt-6 space-y-3">
                {/* 💡 1. Message informatif discret au lieu du blocage rouge */}
                {isConnected && user?.isVerified === false && (
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 text-center">
                        💡 Votre compte n'est pas encore vérifié. Vous pouvez cliquer sur le bouton de paiement ci-dessous pour finaliser l'activation.
                    </div>
                )}

                {/* 🔒 2. Bouton de paiement libéré du verrou de vérification */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex justify-center items-center py-4 px-6 rounded-xl text-white font-semibold text-base transition-all shadow-lg
                        ${isLoading
                            ? "bg-gray-400 shadow-none cursor-not-allowed" 
                            : "bg-night-blue hover:bg-[#06089e] shadow-night-blue/20"
                        }`}
                >
                    {isLoading ? "Préparation de la page Stripe..." : "🔒 Passer au paiement sécurisé"}
                </button>
            </div>
        </form>

        {/* 🌟 3. Inclusion de la modal sur mesure à la racine du composant */}
        <UnverifiedAccountModal
            isOpen={isUnverifiedModalOpen}
            onClose={() => setIsUnverifiedModalOpen(false)}
        />
    </div>
)
}