import PaymentSuccessComponent from "@/src/components/successpage/success"
import { Metadata } from "next"


export const metadata: Metadata = {
    title: "Merci pour votre confiance ! | Sac'Azura",
    description: "Votre commande a été validée avec succès à l'atelier.",
}

export default function PaymentSuccessPage() {

    return (
        <PaymentSuccessComponent />
    )
}