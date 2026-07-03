'use client'

import { useState } from "react"
import { useAuth } from "@/src/contexts/AuthContext"
import { useRouter } from "next/navigation"

export default function LoginForm(){

    const { login } = useAuth()
    const router = useRouter() 

    const [formData, setFormData] = useState({
        mail: '',
        password: ''
    })

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e:React.FormEvent) => {
        e.preventDefault()

        setStatus('loading')
        setMessage('')

        try {
            await login(formData)
    
            setStatus('success')
            setMessage('Connexion réussie !')
            setFormData({mail: '', password: ''})
    
            router.push('/')
            
        } catch(error: any) {
            setStatus('error')
            setMessage(error.message)
        }
    }


return (
        <div className="flex flex-col items-center justify-center ">
            <form onSubmit={handleSubmit} className="flex flex-col items-center" noValidate>
                <div className="w-full max-w-lg flex flex-col gap-6">
                    
                    <div className="flex items-center">
                        <label className="w-32 font-text text-lg text-right mr-4 font-medium">Email</label>
                        <input className="flex-1 w-200 text-center p-2 border-2 border-night-blue rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" type="email" name="mail" required value={formData.mail} onChange={handleChange}/>
                    </div>

                    <div className="flex items-center">
                        <label className="w-32 font-text text-lg text-right mr-4 font-medium">Mot de passe</label>
                        <input className="flex-1 w-200 text-center p-2 border-2 border-night-blue rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" type="password" name="password" required value={formData.password} onChange={handleChange}/>
                    </div>
                </div>
                <button 
                    className="font-text font-semibold border border-orange rounded-xl mt-5 p-5 px-20 bg-orange" 
                    type="submit" 
                    disabled={status === 'loading'}
                >
                    {status === 'loading' ? 'Connexion en cours...' : "Se connecter"}
                </button>
            </form>

            {status === 'success' && (
            <p className="mt-4 text-green-600 text-center font-medium">{message}</p>
            )}
            {status === 'error' && (
            <p className="mt-4 text-red-600 text-center font-medium">{message}</p>
            )}
        </div>
    )
}