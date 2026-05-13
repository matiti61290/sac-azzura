import LoginForm from "@/src/components/auth/LoginForm";

export default function Login() {
   
    return (
        <div className="flex flex-col items-center my-10 gap-15">
            <h1 className="text-7xl text-center text-dark-blue font-title">Page de connexion</h1>
            <LoginForm />
        </div>
    )
}