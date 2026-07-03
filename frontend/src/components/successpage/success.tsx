'use client'

import { useCart } from "@/src/contexts/CartContext"
import Link from "next/link"
import { useEffect } from "react"

export default function PaymentSuccessComponent(){
    const { cleanCart } = useCart()
    
    useEffect(()=> {
        cleanCart()
    }, [])

    return(
        <main className="min-h-[80vh] flex items-center justify-center bg-gray-50/50 font-text text-night-blue py-12 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center space-y-6">

                <div className="space-y-2">
                    <h1 className="text-3xl font-title text-night-blue">C'est dans le sac !</h1>
                    <p className="text-sm text-gray-500 font-medium">Votre paiement a été validé avec succès.</p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                    <Link
                        href="/"
                        className="flex-1 py-3 px-4 rounded-xl border-2 border-night-blue font-semibold text-sm hover:bg-night-blue hover:text-white transition-all duration-150 text-center"
                    >
                        Retour à l'accueil
                    </Link>
                    
                    <Link 
                        href="/profile"
                        className="flex-1 py-3 px-4 rounded-xl bg-orange hover:bg-[#e89454] text-white font-semibold text-sm shadow-md shadow-orange/10 transition-all duration-150 text-center"
                    >
                        Suivre ma commande
                    </Link>
                </div>
            </div>
        </main>
    )
}