'use client'

import { useState } from "react"
import { AuthService } from "@/src/services/auth.service"

interface UnverifiedAccountModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UnverifiedAccountModal({ isOpen, onClose }: UnverifiedAccountModalProps) {
  const [isSending, setIsSending] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  if (!isOpen) return null

  const handleResendMail = async () => {
    setIsSending(true)
    setStatus(null)
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
        throw new Error(data.message || "Impossible de renvoyer le mail pour le moment.")
      }

      setStatus({
        type: 'success',
        message: "Un nouveau lien d'activation vient d'être envoyé sur votre boîte mail ! ✨"
      })
    } catch (err: any) {
      setStatus({
        type: 'error',
        message: err.message
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-text">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 transition-all transform scale-100 duration-200">
        
        <div className="text-center space-y-3">
          <div className="text-4xl">📧</div>
          <h3 className="text-lg font-semibold text-gray-900">Vérification de compte requise</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Pour valider votre commande et permettre à Gigi de préparer votre colis, vous devez obligatoirement valider votre adresse e-mail.
          </p>
        </div>

        {/* --- ZONE DE FEEDBACK (SUCCÈS / ERREUR) --- */}
        {status && (
          <div className={`mt-4 p-3.5 rounded-xl text-xs font-medium text-center ${
            status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {status.message}
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 order-2 sm:order-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Fermer
          </button>
          
          {status?.type !== 'success' && (
            <button
              type="button"
              disabled={isSending}
              onClick={handleResendMail}
              className="flex-1 order-1 sm:order-2 px-4 py-2.5 text-sm font-semibold text-white bg-orange hover:bg-[#e89454] disabled:bg-gray-400 rounded-xl transition-colors shadow-sm shadow-orange/20"
            >
              {isSending ? "Envoi en cours..." : "Renvoyer le mail"}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}