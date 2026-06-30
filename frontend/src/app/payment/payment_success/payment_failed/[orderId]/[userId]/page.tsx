import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Paiement interrompu | Sac'Azura",
    description: "Le paiement de votre commande n'a pas pu aboutir.",
}

interface ParamsProps {
    params: Promise<{
        orderId: string
        userId: string
    }>
}

export default async function PaymentFailedPage({ params }: ParamsProps) {
    // Récupération des paramètres au cas où tu en aurais besoin (ex: journalisation ou affichage)
    const { orderId } = await params

    return (
        <main className="min-h-[80vh] flex items-center justify-center bg-gray-50/50 font-text text-night-blue py-12 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center space-y-6">
                
                {/* Icône d'avertissement douce */}
                <div className="w-20 h-20 mx-auto bg-amber-50 rounded-full flex items-center justify-center text-amber-500 text-4xl">
                    🧵
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-title text-night-blue">Le fil s'est emmêlé...</h1>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        Le paiement a été interrompu ou refusé par votre établissement bancaire. Pas d'inquiétude, aucune somme n'a été prélevée.
                    </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 text-left text-xs text-gray-500 space-y-1">
                    <p>💡 <strong>Que s'est-il passé ?</strong></p>
                    <ul className="list-disc list-inside space-y-0.5">
                        <li>La saisie de la carte a peut-être été annulée.</li>
                        <li>La validation 3D Secure a expiré.</li>
                    </ul>
                    {orderId && <p className="pt-2 text-[10px] text-gray-400">Référence de l'incident : #{orderId}</p>}
                </div>

                {/* Actions de récupération */}
                <div className="pt-2 space-y-3">
                    <Link 
                        href="/cart" // On renvoie la cliente vers son panier pour qu'elle puisse réessayer
                        className="block w-full py-4 px-6 rounded-xl bg-night-blue hover:bg-[#06089e] text-white font-semibold text-base transition-all duration-150 shadow-lg shadow-night-blue/10 text-center"
                    >
                        🛒 Retourner au panier & réessayer
                    </Link>

                    <Link 
                        href="/"
                        className="block w-full py-3 px-4 text-sm font-medium text-gray-500 hover:text-night-blue transition-colors text-center"
                    >
                        Retourner à la boutique
                    </Link>
                </div>

            </div>
        </main>
    )
}