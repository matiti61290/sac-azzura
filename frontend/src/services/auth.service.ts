export const AuthService = {
  async login(credentials: { mail: string; password: string }) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      

      if (!res.ok) {
        throw new Error(data.message || "Une erreur est survenue lors de la connexion.");
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  async register(userData: any) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      // Si la requête a échoué (ex: Erreur 400 du ValidationPipe)
      if (!res.ok) {
        // Si NestJS renvoie un tableau d'erreurs (DTO), on récupère juste la première
        // pour éviter d'afficher un énorme bloc de texte à l'utilisateur
        if (Array.isArray(data.message)) {
          throw new Error(data.message[0]); 
        }
        
        // Sinon, c'est une erreur classique (ex: "Cet email existe déjà")
        throw new Error(data.message || "Une erreur est survenue lors de l'inscription.");
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },
};