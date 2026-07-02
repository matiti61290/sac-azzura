'use client'

import { useState, useEffect } from "react"
import { useAuth } from "@/src/contexts/AuthContext"
import { AuthService } from "@/src/services/auth.service"
import { useRouter } from "next/navigation"
import { Order } from "@/src/types/order"
import { OrderStatus } from "@/src/libs/enum/order-status"
import ConfirmationModal from "@/src/components/ui/ConfirmationModal"
import NotificationModal from "@/src/components/ui/NotificationModal"

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
    const [isLoadingData, setIsLoadingData] = useState(true) 
    const [isUpdating, setIsUpdating] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false) 
    
    // 🌟 ÉTATS POUR LA VÉRIFICATION DU COMPTE ET LE RENVOI DU MAIL
    const [isVerified, setIsVerified] = useState<boolean>(true) // Géré dynamiquement par la BDD
    const [isResendingEmail, setIsResendingEmail] = useState(false)

    // 🌟 ÉTATS POUR LES MODALS SUR MESURE
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isAccountDeleted, setIsAccountDeleted] = useState(false) 
    const [notification, setNotification] = useState<{
        isOpen: boolean
        type: 'success' | 'error'
        message: string
    }>({
        isOpen: false,
        type: 'success',
        message: ""
    })

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
                const res = await fetch(`${process.env.NEXT_PUBLIC_API}user/${user.id}`, { 
                    headers,
                    credentials: 'include' 
                })
                
                if (res.ok) {
                    const userData = await res.json()
                    
                    setAddresses(userData.addresses || [])
                    setOrders(userData.orders || [])
                    setIsVerified(userData.isVerified) // 🌟 On extrait le vrai statut de la BDD
                    
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
                setIsLoadingData(false)
            }
        }

        fetchProfileData()
    }, [isConnected, user?.id])

    // 🌟 ENVOI DU MAIL DE VÉRIFICATION DEPUIS LE PROFIL
    const handleResendVerificationMail = async () => {
        setIsResendingEmail(true)
        try {
            const csrfToken = await AuthService.getCsrfToken()
            const token = localStorage.getItem('token')

            const res = await fetch(`${process.env.NEXT_PUBLIC_API}auth/resend-verification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-csrf-token': csrfToken,
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                credentials: 'include'
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Une erreur est survenue lors de l'envoi.")
            }

            setNotification({
                isOpen: true,
                type: 'success',
                message: "Un nouveau lien d'activation vient d'être envoyé sur votre boîte mail ! ✨"
            })
        } catch (err: any) {
            setNotification({
                isOpen: true,
                type: 'error',
                message: err.message
            })
        } finally {
            setIsResendingEmail(false)
        }
    }

    // ✨ MODIFICATION DES INFOS PERSONNELLES
    const handleUpdateAccount = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsUpdating(true)
        try {
            const csrfToken = await AuthService.getCsrfToken()
            const token = localStorage.getItem('token')

            const payload: Record<string, any> = {
                firstname: accountForm.firstname,
                lastname: accountForm.lastname,
                mail: accountForm.mail,
                phoneNumber: accountForm.phoneNumber,
            }

            if (accountForm.password.trim() !== "") {
                payload.password = accountForm.password
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API}user/update-user/${user?.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-csrf-token': csrfToken,
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                credentials: 'include',
                body: JSON.stringify(payload)
            })

            const data = await res.json()

            if (!res.ok) {
                const serverMessage = Array.isArray(data.message) 
                    ? data.message.join(', ') 
                    : data.message
                throw new Error(serverMessage || "Impossible de modifier vos informations.")
            }

            setNotification({
                isOpen: true,
                type: 'success',
                message: "Vos informations personnelles ont été mises à jour avec succès ! ✨"
            })
        } catch (err: any) {
            setNotification({
                isOpen: true,
                type: 'error',
                message: err.message
            })
        } finally {
            setIsUpdating(false)
        }
    }

    // 🗑️ EXÉCUTION RÉELLE DE LA SUPPRESSION DE COMPTE
    const executeDeleteAccount = async () => {
        setIsDeleteModalOpen(false) 
        setIsDeleting(true)
        try {
            const csrfToken = await AuthService.getCsrfToken()
            const token = localStorage.getItem('token')

            const res = await fetch(`${process.env.NEXT_PUBLIC_API}user/delete-user/${user?.id}`, {
                method: 'DELETE',
                headers: {
                    'x-csrf-token': csrfToken,
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                credentials: 'include'
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || "Une erreur est survenue lors de la suppression de votre compte.")
            }

            setIsAccountDeleted(true) 
            setNotification({
                isOpen: true,
                type: 'success',
                message: "Votre compte a été supprimé avec succès. Nous sommes désolés de vous voir partir de l'atelier ! 👋"
            })
        } catch (err: any) {
            setNotification({
                isOpen: true,
                type: 'error',
                message: err.message
            })
        } finally {
            setIsDeleting(false)
        }
    }

    const handleCloseNotification = () => {
        setNotification(prev => ({ ...prev, isOpen: false }))
        if (isAccountDeleted) {
            logout()
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
                                
                                {/* 🌟 NOUVELLE BANNIÈRE DE VÉRIFICATION D'E-MAIL */}
                                {!isVerified && (
                                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 max-w-md animate-fade-in">
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-semibold text-amber-800 flex items-center gap-1.5">
                                                ⚠️ Votre compte n'est pas vérifié
                                            </p>
                                            <p className="text-xs text-amber-700/80 leading-relaxed">
                                                Activez votre profil Sac'Azura pour valider vos paniers d'achats.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            disabled={isResendingEmail}
                                            onClick={handleResendVerificationMail}
                                            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-amber-900 bg-amber-200/60 hover:bg-amber-200 rounded-xl transition-all whitespace-nowrap disabled:opacity-50"
                                        >
                                            {isResendingEmail ? "Envoi..." : "Renvoyer le lien"}
                                        </button>
                                    </div>
                                )}

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
                                            type="tel" 
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
                                        disabled={isUpdating || isDeleting}
                                        className="bg-orange text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#e89454] transition-colors shadow-sm shadow-orange/20 disabled:opacity-50"
                                    >
                                        {isUpdating ? "Enregistrement..." : "Sauvegarder les modifications"}
                                    </button>
                                </form>

                                {/* 🚨 ZONE DE DANGER : SUPPRESSION DE COMPTE */}
                                <div className="mt-12 pt-6 border-t border-red-100 max-w-md space-y-3">
                                    <div>
                                        <h4 className="text-sm font-semibold text-red-600">Zone de danger</h4>
                                        <p className="text-xs text-gray-400 mt-0.5">Ces actions sont définitives et impacteront l'accès à votre compte.</p>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={isDeleting || isUpdating}
                                        onClick={() => setIsDeleteModalOpen(true)} 
                                        className="px-4 py-2 text-xs font-semibold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                                    >
                                        {isDeleting ? "Suppression en cours..." : "Supprimer définitivement mon compte"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 📍 ONGLET 2 : MES ADRESSES */}
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

                        {/* 📜 ONGLET 3 : MES COMMANDES */}
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

                {/* Petit bouton déconnexion pour la version mobile */}
                <button 
                    type="button" 
                    onClick={() => logout()}
                    className="w-full text-center mt-8 pt-4 border-t border-gray-150 text-sm font-semibold text-red-500 md:hidden"
                >
                    🚪 Déconnexion du compte
                </button>
            </div>

            {/* --- MODALS DE COMMISSIONS GRAPHIK --- */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={executeDeleteAccount}
                title="Supprimer définitivement le compte ?"
                message="Êtes-vous absolument sûr de vouloir supprimer votre compte Sac'Azura ? Cette action effacera toutes vos données ainsi que votre historique de commande. C'est irréversible."
                confirmLabel="Supprimer"
                cancelLabel="Annuler"
                variant="danger"
            />

            <NotificationModal
                isOpen={notification.isOpen}
                onClose={handleCloseNotification}
                type={notification.type}
                message={notification.message}
            />

        </div>
    )
}