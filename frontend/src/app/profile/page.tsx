// src/app/profil/page.tsx
import { Metadata } from "next"
import ProfileDashboard from "@/src/components/profile/profile-dashboard"

export const metadata: Metadata = {
    title: "Mon Espace Création | Sac'Azura",
    description: "Gérez vos informations, vos adresses et suivez vos commandes personnalisées sur l'atelier Sac'Azura.",
}

export default function ProfilPage() {
    return (
        <main className="min-h-screen bg-gray-50/50 text-night-blue font-text py-12 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8 text-center md:text-left">
                    <h1 className="text-3xl font-title text-night-blue mb-2">Mon Espace Création</h1>
                    <p className="text-sm text-gray-500 italic">Bienvenue dans vos coulisses, là où vos sacs prennent vie.</p>
                </div>

                {/* Appel du composant Client interactif */}
                <ProfileDashboard />
            </div>
        </main>
    )
}