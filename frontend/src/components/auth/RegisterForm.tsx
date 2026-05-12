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
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Prenom</label>
                    <input type="text" name="firstname" required value={formData.firstname} onChange={handleChange}/>
                </div>
                <div>
                    <label>Nom</label>
                    <input type="text" name="lastname" required value={formData.lastname} onChange={handleChange}/>
                </div>
                <div>
                    <label>mail</label>
                    <input type="email" name="mail" required value={formData.mail} onChange={handleChange}/>
                </div>
                <div>
                    <label>Telephone</label>
                    <input type="tel" name="phoneNumber" required value={formData.phoneNumber} onChange={handleChange}/>
                </div>
                <div>
                    <label>Mot de passe</label>
                    <input type="password" name="password" required value={formData.password} onChange={handleChange}/>
                </div>
                <div>
                    <label>Confirmer mdp</label>
                    <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange}/>
                </div>

                <button className="mt-10" type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Création en cours...' : "S'inscrire"}</button>
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