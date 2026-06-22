import Image from "next/image";
import NewsletterForm from "../components/homepage/NewsletterForm";
import { Product } from "@/src/types/product"; // ⚠️ Vérifie que ce chemin est le bon pour ton projet

export default async function Home() {

  // 1. Appel API pour récupérer les produits
  let products: Product[] = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}products/`, {
      cache: 'no-store' // Permet d'avoir les produits à jour. Tu pourras passer en 'force-cache' avec revalidation plus tard pour la prod.
    });

    if (res.ok) {
      products = await res.json();
      
      // 2. Tri par ID (du plus petit au plus grand)
      // Pour inverser (du plus récent au plus ancien) : (a, b) => b.id - a.id
      products.sort((a, b) => a.id - b.id);

      // 3. Limite à 4 ou 8 produits pour la page d'accueil (pour ne pas surcharger)
      products = products.slice(0, 4); 
    } else {
      console.error("Erreur lors de la récupération des produits pour l'accueil");
    }
  } catch (error) {
    console.error("Impossible de joindre l'API :", error);
  }

  return (
    <div className="">
      <main className="min-h-screen flex flex-col gap-12 p-6 md:p-12">
        
        {/* --- SECTION HERO --- */}
        <section>
          <div className="flex flex-col items-center justify-center bg-[image:var(--image-dev)] bg-cover bg-center h-200">
            <h1 className="text-7xl text-center text-white font-title mx-5 my-5 pb-10">Sacs et accessoires faits main en Normandie, personnalisables et pensés pour durer</h1>
            <h3 className=" text-xl text-white font-bold font-text m-5">Des créations artisanales uniques, pensées pour vous accompagner au quotidien.</h3>
            <button className="font-text font-semibold border border-orange rounded-xl p-5 bg-orange mt-10">Découvrir la boutique</button>
          </div>
           <div className="flex flex-col items-center gap-1 mt-15">
            <h2 className="text-6xl font-title text-center text-dark-blue mb-10">bienvenue chez Sac'Azura</h2>
            <p className="font-text text-lg">
              Je crois aux objets que l’on choisit avec le cœur, que 
              l’on porte avec plaisir, et que l’on garde parce qu’ils ont du sens.
            </p>
            <p className="font-text text-lg">
              Je m’appelle Gigi, et je confectionne moi-même chaque création dans mon atelier.
            </p>
            <p className="font-text text-lg">
              Ici, vous trouverez des sacs pensés pour le quotidien : 
              beaux, utiles, solides… et surtout, faits pour vous accompagner longtemps !
            </p>
          </div>
        </section>

        <hr className="color-night-blue bg-night-blue h-0.5 my-10"/>

        {/* --- SECTION SUR MESURE --- */}
        <section id="personalization" className="flex flex-col items-center">
          <Image src="/static/bag-personalized-temporary.png" width={750} height={0} alt="Sac personnalisé"/>
          <div className="flex flex-col items-center gap-1">
            <h3 className="font-title text-dark-blue text-6xl mt-5 mb-10">La personnalisation, le cœur de Sac’Azura</h3>
            <p className="font-text text-lg">Vous avez une envie particulière ? Une couleur précise, un tissu, une broderie, un détail qui compte pour vous ou pour offrir ?</p>
            <p className="font-text text-lg">Je propose des créations personnalisées et sur-mesure pour que votre sac soit vraiment le vôtre.</p>
            <p className="font-text text-lg">Parce que ce que j’aime le plus dans mon métier, c’est créer des objets qui ne ressemblent à personne d’autre.</p>
            <button className="font-text font-semibold border border-orange rounded-xl p-5 bg-orange mt-10">Personnaliser une création</button>
          </div>
        </section>

        <hr className="color-night-blue bg-night-blue h-0.5 my-10"/>

        {/* --- SECTION PRODUITS (Décommentée et Dynamique) --- */}
        <section id="creations" className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center gap-6 mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
            <h2 className="font-title text-6xl text-dark-blue text-center">Des créations artisanales, en petites séries ou en pièce unique</h2>
            
            {products.length > 0 ? (
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8 h-full mt-8">
                {products.map((product: Product) => {
                  const mainImageUrl = product.images && product.images.length > 0 
                    ? product.images[0].url 
                    : '/static/placeholder.jpg';

                  return (
                    <a key={product.id} href={`/products/${product.sku_code}`} className="group">
                      <img 
                        alt={`Image de ${product.name}`} 
                        src={mainImageUrl} 
                        className="aspect-2/3  w-full rounded-lg bg-gray-200 object-cover group-hover:opacity-75 transition-opacity" 
                        loading="lazy"
                      />
                      <h3 className="mt-4 text-sm text-gray-700 font-text">{product.name}</h3>
                      <p className="mt-1 text-sm text-gray-500 font-text">{product.subcategory?.name || 'Sans catégorie'}</p> 
                      <p className="mt-1 text-lg font-medium text-gray-900 font-text">{product.price} €</p>
                    </a>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 mt-8">Les créations arrivent très bientôt !</p>
            )}
            
            {/* Bouton optionnel pour voir tout le catalogue */}
            <a href="/products" className="mt-10 font-text font-semibold border-b-2 border-orange pb-1 hover:text-orange transition-colors">
              Voir toute la collection &rarr;
            </a>

          </div>
        </section>

        <hr className="color-night-blue bg-night-blue h-0.5 my-10"/>

        {/* --- SECTION AVIS --- */}
        <section id="review" className="flex flex-col items-center">
          <h3 className="font-title text-dark-blue text-6xl">Elles en parlent mieux que moi</h3>
          {/*Voir pour trouver comment importer des avis*/}
        </section>

        <hr className="color-night-blue bg-night-blue h-0.5 my-10"/>

        {/* --- SECTION UPCYCLING --- */}
        <section id="upcycling" className="flex flex-col items-center gap-4 text-center">
          <h3 className="font-title text-6xl text-dark-blue">Donner une seconde vie aux matières</h3>
          <p className="font-text text-lg">J’aime travailler avec des matières qui ont déjà vécu, comme les jeans, que je transforme pour leur offrir une nouvelle histoire.</p>
          <p className="font-text text-lg">L’upcycling me permet de créer autrement, sans produire inutilement, tout en donnant naissance à des sacs solides, uniques et chargés d’authenticité.</p>
          <button className="font-text font-semibold border border-orange rounded-xl p-5 bg-orange mt-4">Découvrir les créations upcyclées</button>
        </section>

        <hr className="color-night-blue bg-night-blue h-0.5 my-10"/>

        <NewsletterForm />

        <hr className="color-night-blue bg-night-blue h-0.5 my-10"/>

        {/* --- SECTION FOOTER / CALL TO ACTION --- */}
        <section id="shop" className="flex flex-col items-center gap-4 text-center">
            <h3 className="font-title text-6xl text-dark-blue">Votre prochain sac Sac’Azura vous attend.</h3>
            <p className="font-text text-lg">Vous pouvez commander directement en ligne ou me contacter pour un projet personnalisé.</p>
            <div className="flex gap-4 mt-4">
              <button className="font-text font-semibold border border-orange rounded-xl p-5 bg-orange">Voir la boutique</button>
              <button className="font-text font-semibold border border-orange rounded-xl p-5 bg-transparent text-orange hover:bg-orange hover:text-white transition-colors">Contacter l’atelier</button>
            </div>
        </section>

      </main>
    </div>
  );
}