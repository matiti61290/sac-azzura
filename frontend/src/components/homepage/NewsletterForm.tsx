'use client'

import { useState } from "react"

export default function NewsletterForm() {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('loading')

            try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API}newsletter/subscribe`, {
            method: 'POST',
            headers:  { 'Content-Type': 'application/json'},
            body: JSON.stringify({ email })
        })
        console.log(process.env.NEXT_PUBLIC_API)
        const data = await res.json()

        if (!res.ok){
            throw new Error(data.message || 'Une erreur est survenue')
        }

        setStatus('success')
        setMessage(data.message)
        setEmail('')
        } catch (error: any) {
            setStatus('error')
            setMessage(error.message)
        }
    }

    return (
        <section id="newsletter" className="flex flex-col items-center gap-4">
      <h3 className="font-title text-6xl text-dark-blue text-center">
        Rejoignez l’univers Sac’Azura
      </h3>
      <p className="font-text text-lg text-center">
        Les nouvelles créations partent vite. Soyez la première à les voir !
      </p>
      <p className="font-text text-lg text-center">
        Coulisses de l’atelier, nouveautés et offres exclusives dans votre boîte mail, sans spam.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col items-center w-full max-w-md">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre email"
          required
          disabled={status === 'loading'}
          className="w-full p-2 border-2 border-night-blue rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Envoi en cours...' : "S'inscrire"}
        </button>
      </form>

      {status === 'success' && (
        <p className="text-green-600 font-text text-center mt-2 font-medium">
          {message}
        </p>
      )}
      {status === 'error' && (
        <p className="text-red-600 font-text text-center mt-2 font-medium">
          {message}
        </p>
      )}
    </section>
    )
}