// src/components/profil/ProfileDashboard.tsx
'use client'

import { useState, useEffect } from "react"
import { useAuth } from "@/src/contexts/AuthContext"
import { AuthService } from "@/src/services/auth.service"
import { useRouter } from "next/navigation"
import { Order } from "@/src/types/order"
import { OrderStatus } from "@/src/libs/enum/order-status"

interface Address {
    id: number
    street: string
    additional?: string
    zipcode: string
    city: string
    type: 'delivery' | 'billing'
}

export default function ProfileDashboard() {
    const { isConnected, user, logout, isLoading } = useAuth()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'account' | 'addresses' | 'orders'>('account')
    
    // States pour centraliser les données issues du Back-end
    const [orders, setOrders] = useState<Order[]>([])
    const [addresses, setAddresses] = useState<Address[]>([])
    const [isLoadingData, setIsLoadingData] = useState(true) // ⏳ Évite les flashs de contenu vide
    const [isUpdating, setIsUpdating] = useState(false)

    // Formulaire d'infos personnelles
    const [accountForm, setAccountForm] = useState({
        firstname: "",
        lastname: "",
        mail: "",
        phoneNumber: "",
        password: ""
    })

    // Redirection si l'utilisateur n'est pas connecté
    useEffect(() => {
        console.log("DEBUG: Début du useEffect");
        console.log("DEBUG: isConnected =", isConnected);
        console.log("DEBUG: user ID =", user?.id);
        // On n'agit que si le chargement est FINI (isLoading === false)
        if (!isLoading && !isConnected) {
            router.push('/login')
        }
    }, [isLoading, isConnected, router])

    // 🚀 L'unique appel API pour récupérer l'utilisateur et ses relations
    useEffect(() => {
        if (!isConnected || !user?.id) return

        const fetchProfileData = async () => {
           const token = localStorage.getItem('token')
            
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            }
            if (token) {
                headers['Authorization'] = `Bearer ${token}`
            }
            try {
                // Route NestJS faisant appel à ton findUserById avec ses relations
                const res = await fetch(`${process.env.NEXT_PUBLIC_API}user/${user.id}`, { 
                    headers,
                    credentials: 'include' 
                })
                
                if (res.ok) {
                    const userData = await res.json()
                    
                    // On distribue les données des relations TypeORM directement dans nos states
                    setAddresses(userData.addresses || [])
                    setOrders(userData.orders || [])
                    
                    // On pré-remplit le formulaire avec les vraies données de la BDD
                    setAccountForm({
                        firstname: userData.firstname,
                        lastname: userData.lastname || "",
                        mail: userData.mail || "",
                        phoneNumber: userData.phoneNumber || "",
                        password: ""
                    })

                }
            } catch (err) {
                console.error("Erreur de chargement du profil", err)
            } finally {
                setIsLoadingData(false) // Le chargement est terminé
            }
        }

        fetchProfileData()
    }, [isConnected, user?.id])

    const handleUpdateAccount = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsUpdating(true)
        try {
            const csrfToken = await AuthService.getCsrfToken()
            const token = localStorage.getItem('token')

            const res = await fetch(`${process.env.NEXT_PUBLIC_API}auth/update-profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-csrf-token': csrfToken,
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                credentials: 'include',
                body: JSON.stringify(accountForm)
            })

            if (!res.ok) throw new Error("Impossible de modifier vos informations.")
            alert("Vos informations ont été mises à jour ! ✨")
        } catch (err: any) {
            alert(err.message)
        } finally {
            setIsUpdating(false)
        }
    }

    if (isConnected === null || isConnected === false) return null

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[500px]">
                <span className="animate-pulse font-text text-gray-500">Chargement de votre espace...</span>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* --- PANNEAU DE NAVIGATION (GAUCHE) --- */}
            <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit space-y-6">
                <div className="text-center md:text-left">
                    <p className="text-2xl font-text font-semibold text-dark-blue truncate">{accountForm.firstname || user?.firstname}</p>
                </div>

                <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 border-b md:border-b-0">
                    <button 
                        type="button"
                        onClick={() => setActiveTab('account')}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'account' ? 'bg-dark-blue text-white' : 'hover:bg-gray-50 text-gray-600'}`}
                    >
                        Mon Compte
                    </button>
                    <button 
                        type="button"
                        onClick={() => setActiveTab('addresses')}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'addresses' ? 'bg-dark-blue text-white' : 'hover:bg-gray-50 text-gray-600'}`}
                    >
                        Mes Adresses ({isLoadingData ? '...' : addresses.length})
                    </button>
                    <button 
                        type="button"
                        onClick={() => setActiveTab('orders')}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'orders' ? 'bg-dark-blue text-white' : 'hover:bg-gray-50 text-gray-600'}`}
                    >
                        Mes Commandes ({isLoadingData ? '...' : orders.length})
                    </button>
                </nav>

                <button 
                    type="button"
                    onClick={() => logout()}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors hidden md:block"
                >
                    Déconnexion
                </button>
            </div>

            {/* --- CONTENU DE L'ONGLET ACTIF (DROITE) --- */}
            <div className="md:col-span-3 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[500px] flex flex-col justify-between">
                
                {/* ⏳ ÉCRAN DE CHARGEMENT GLOBAL DE L'ATELIER */}
                {isLoadingData ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 italic gap-2 py-12">
                        <span className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin"></span>
                        Récupération de vos données...
                    </div>
                ) : (
                    <div className="flex-1">
                        
                        {/* 👤 ONGLET 1 : INFORMATIONS DU COMPTE */}
                        {activeTab === 'account' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-text">Mes informations personnelles</h3>
                                    <p className="text-xs text-gray-400 mt-1">Modifiez les identifiants de votre compte Sac'Azura.</p>
                                </div>
                                <form onSubmit={handleUpdateAccount} className="space-y-4 max-w-md">
                                    <div>
                                        <label className="block text-xs font-semibold mb-1">Prénom</label>
                                        <input 
                                            type="text" 
                                            value={accountForm.firstname}
                                            onChange={(e) => setAccountForm({...accountForm, firstname: e.target.value})}
                                            className="w-full px-4 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-orange" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1">Nom</label>
                                        <input 
                                            type="text" 
                                            value={accountForm.lastname}
                                            onChange={(e) => setAccountForm({...accountForm, lastname: e.target.value})}
                                            className="w-full px-4 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-orange" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1">Adresse e-mail</label>
                                        <input 
                                            type="email" 
                                            value={accountForm.mail}
                                            onChange={(e) => setAccountForm({...accountForm, mail: e.target.value})}
                                            className="w-full px-4 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-orange" 
                                        />
                                    </div>
                                  <div>
                                        <label className="block text-xs font-semibold mb-1">Numéro de téléphone</label>
                                        <input 
                                            type="phone" 
                                            value={accountForm.phoneNumber}
                                            onChange={(e) => setAccountForm({...accountForm, phoneNumber: e.target.value})}
                                            className="w-full px-4 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-orange" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1">Nouveau mot de passe (laisser vide si inchangé)</label>
                                        <input 
                                            type="password" 
                                            placeholder="••••••••"
                                            value={accountForm.password}
                                            onChange={(e) => setAccountForm({...accountForm, password: e.target.value})}
                                            className="w-full px-4 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-orange" 
                                        />
                                    </div>
                                    <button 
                                        type="submit"
                                        disabled={isUpdating}
                                        className="bg-orange text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#e89454] transition-colors shadow-sm shadow-orange/20"
                                    >
                                        {isUpdating ? "Enregistrement..." : "Sauvegarder les modifications"}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* 📍 ONGLET 2 : MES ADRESSES (REDUIT VIA RELATION UNIQUE) */}
                        {activeTab === 'addresses' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-text">Le carnet d'adresses</h3>
                                    <p className="text-xs text-gray-400 mt-1">Retrouvez vos adresses enregistrées pour vos futures commandes.</p>
                                </div>
                                {addresses.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">Vous n'avez pas encore d'adresse enregistrée.</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {addresses.map((addr) => (
                                            <div key={addr.id} className="p-4 rounded-xl border border-gray-200 relative group bg-gray-50/30">
                                                <span className={`absolute top-3 right-3 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${addr.type === 'delivery' ? 'bg-teal-50 text-teal-600 border border-teal-100' : 'bg-purple-50 text-purple-600 border border-purple-100'}`}>
                                                    {addr.type === 'delivery' ? 'Livraison' : 'Facturation'}
                                                </span>
                                                <p className="text-sm font-semibold pr-16 text-night-blue">{addr.street}</p>
                                                {addr.additional && <p className="text-xs text-gray-400 mt-0.5">{addr.additional}</p>}
                                                <p className="text-xs text-gray-500 mt-2 font-medium">{addr.zipcode} {addr.city}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 📜 ONGLET 3 : MES COMMANDES (REDUIT VIA RELATION UNIQUE) */}
                        {activeTab === 'orders' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-text">Suivi des commandes</h3>
                                    <p className="text-xs text-gray-400 mt-1">Consultez l'état de vos créations, de l'atelier jusqu'à chez vous.</p>
                                </div>

                                {orders.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">Vous n'avez pas encore passé de commande.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order) => { 
                                            return (
                                                <div key={order.id} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:border-gray-200 transition-colors">
                                                    <div className="bg-gray-50/70 p-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4 text-xs">
                                                        <div>
                                                            <p className="text-gray-400 uppercase tracking-wider text-[10px] font-bold mb-0.5">Commande</p>
                                                            <p className="font-bold text-sm">#AZ-{order.id}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-400 uppercase tracking-wider text-[10px] font-bold mb-0.5">Date</p>
                                                            <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-400 uppercase tracking-wider text-[10px] font-bold mb-0.5">Total</p>
                                                            <p className="font-bold text-sm">{order.totalAmount} €</p>
                                                        </div>
                                                        <div>
                                                            <span className={`px-3 py-1.5 rounded-md font-bold text-[11px] border flex items-center gap-1.5 ${
                                                                order.status === OrderStatus.PAID 
                                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                                                    : order.status === OrderStatus.PENDING 
                                                                        ? 'bg-amber-50 text-amber-600 border-amber-100' 
                                                                        : 'bg-gray-50 text-gray-500 border-gray-200'
                                                            }`}>
                                                                {/* Traduction logique de l'enum vers le texte affiché */}
                                                                {order.status === OrderStatus.PAID && 'En préparation'}
                                                                {order.status === OrderStatus.PENDING && 'En attente'}
                                                                {order.status === OrderStatus.CANCELLED && 'Annulée'}
                                                                {order.status === OrderStatus.SHIPPED && 'Expédiée'}
                                                                {order.status === OrderStatus.DELIVERED && 'Livrée'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                )}

                {/* Petit bouton déconnexion pour la version mobile tout en bas */}
                <button 
                    type="button" 
                    onClick={() => logout()}
                    className="w-full text-center mt-8 pt-4 border-t border-gray-150 text-sm font-semibold text-red-500 md:hidden"
                >
                    🚪 Déconnexion du compte
                </button>
            </div>
        </div>
    )
}