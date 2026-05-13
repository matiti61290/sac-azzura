export const AuthService = {
  // 1. Nouvelle fonction pour récupérer le token
  async getCsrfToken(): Promise<string> {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}csrf/token`, {
        method: 'GET',
        credentials: 'include', // INDISPENSABLE pour recevoir le cookie 'session-id'
      });

      if (!res.ok) {
        throw new Error("Impossible d'initialiser la sécurité CSRF.");
      }

      const data = await res.json();
      return data.csrfToken; // On retourne le jeton (string)
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // 2. On ajoute csrfToken en paramètre
  async login(credentials: { mail: string; password: string }, csrfToken: string) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken, // On place le token dans les headers !
        },
        credentials: 'include', // INDISPENSABLE pour renvoyer le cookie 'session-id' au back
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

  // (N'oublie pas de faire pareil pour register !)
  async register(userData: any, csrfToken: string) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken, // Pareil ici
        },
        credentials: 'include', // Et ici
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (Array.isArray(data.message)) {
          throw new Error(data.message[0]); 
        }
        throw new Error(data.message || "Une erreur est survenue lors de l'inscription.");
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },
};