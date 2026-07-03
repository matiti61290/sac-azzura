// src/app/profil/page.tsx
import { Metadata } from "next"
import ProfileDashboard from "@/src/components/profile/profile-dashboard"

export const metadata: Metadata = {
    title: "Mon Compte | Sac'Azura",
    description: "Gérez vos informations, vos adresses et suivez vos commandes personnalisées sur l'atelier Sac'Azura.",
}

export default function ProfilPage() {
    return (
        <main className="min-h-screen bg-gray-50/50 text-night-blue font-text py-12 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8 text-center md:text-left">
                    <h1 className="text-3xl font-text text-night-blue mb-2">Mon compte</h1>
                </div>
                <ProfileDashboard />
            </div>
        </main>
    )
}