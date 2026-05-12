import RegisterForm from "@/src/components/auth/RegisterForm";

export default function Register() {
   
    return (
        <div className="flex flex-col items-center my-10 gap-15">
            <h1 className="text-7xl text-center text-dark-blue font-title">Page d'inscription</h1>
            <RegisterForm />
        </div>
    )
}