import { error } from "console"

export const AuthService = {
    async register(userData: any) {
        try{
            const res = await fetch(`${process.env.NEXT_PUBLIC_API}auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            })

            const data = await res.json()

            if(!res.ok){
                throw new Error(data.message || 'Une erreur est survenue')
            }

            return data
        } catch (error:any){
            throw new Error(error.message)
        }
    }
}