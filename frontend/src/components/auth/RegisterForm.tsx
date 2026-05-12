'use client'

import { useState } from "react"
import { AuthService } from "@/src/services/auth.service"

export default function RegisterForm(){

        const [formData, setFormData] = useState({
            firstname: '',
            lastname: '',
            mail: '',
            phoneNumber: '',
            password: '',
            confirmPassword: ''
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
                await AuthService.register(formData)
        
                setStatus('success')
                setMessage('Votre compte a été créé avec succès ! Un email de confirmation vous a été envoyé.')
                setFormData({firstname: '', lastname: '', mail: '', phoneNumber: '', password: '', confirmPassword: ''})
        
                //faire un routing vers la page d'accueil ou de log
            } catch(error: any) {
                setStatus('error')
                setMessage(error.message)
            }
        }
    


return (
        <div className="flex flex-col items-center justify-center">
            <form onSubmit={handleSubmit} className="flex flex-col items-center">
                <div className="w-full max-w-lg flex flex-col gap-6">
                    
                    <div className="flex items-center">
                        <label className="w-32 font-text text-lg text-right mr-4 font-medium">Prenom</label>
                        <input className="flex-1 w-200 text-center p-2 border-2 border-night-blue rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" type="text" name="firstname" required value={formData.firstname} onChange={handleChange}/>
                    </div>

                    <div className="flex items-center">
                        <label className="w-32 font-text text-lg text-right mr-4 font-medium">Nom</label>
                        <input className="flex-1 w-200 text-center p-2 border-2 border-night-blue rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" type="text" name="lastname" required value={formData.lastname} onChange={handleChange}/>
                    </div>

                    <div className="flex items-center">
                        <label className="w-32 font-text text-lg text-right mr-4 font-medium">Email</label>
                        <input className="flex-1 w-200 text-center p-2 border-2 border-night-blue rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" type="email" name="mail" required value={formData.mail} onChange={handleChange}/>
                    </div>

                    <div className="flex items-center">
                        <label className="w-32 font-text text-lg text-right mr-4 font-medium">Téléphone</label>
                        <input className="flex-1 w-200 text-center p-2 border-2 border-night-blue rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" type="tel" name="phoneNumber" required value={formData.phoneNumber} onChange={handleChange}/>
                    </div>

                    <div className="flex items-center">
                        <label className="w-32 font-text text-lg text-right mr-4 font-medium">Mot de passe</label>
                        <input className="flex-1 w-200 text-center p-2 border-2 border-night-blue rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" type="password" name="password" required value={formData.password} onChange={handleChange}/>
                    </div>
                    
                    <div className="flex items-center">
                        <label className="w-32 font-text text-lg text-right mr-4 font-medium">Confirmer le mot de passe</label>
                        <input className="flex-1 w-200 text-center p-2 border-2 border-night-blue rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange}/>
                    </div>
                </div>
                <button 
                    className="font-text font-semibold border border-orange rounded-xl mt-5 p-5 px-20 bg-orange" 
                    type="submit" 
                    disabled={status === 'loading'}
                >
                    {status === 'loading' ? 'Création en cours...' : "S'inscrire"}
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