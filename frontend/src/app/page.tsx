import Image from "next/image";
import { ProductService } from "../services/product.service";
import { Product } from "../types/product";

export default async function Home() {


  //Liste de produit test avant d'ajouter le call API

  const products: Product[] = await ProductService.getAllProduct()

  //changer le background de la section slogan
  return (
    <div className="">
      <main className="min-h-screen flex flex-col gap-12 p-6 md:p-12">
        
        {/* <section id="slogan" className="text-center bg-[url(../../public/static/home-background.jpg)] py-15">
          <h1 className="text-7xl text-white  font-title mx-5 my-5 pb-10">Sacs et accessoires faits main en Normandie, personnalisables et pensés pour durer</h1>
          <h3 className=" text-xl text-white font-bold font-text m-5">Des créations artisanales uniques, pensées pour vous accompagner au quotidien.</h3>
          <button className="font-text font-semibold border border-orange rounded-xl p-5 bg-orange">Découvrir la boutique</button>
        </section>

        <hr className="color-night-blue bg-night-blue h-0.5 my-10"/> */}

        {/* <section id="welcome" className="flex flex-col items-center gap-4">
          <Image className="mb-10" src="/static/photo-dev.png"width={2000} height={0}  alt="Photo de la creatice, Gigi"/>
          <div className="flex flex-col items-center gap-1">
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
            <button className="font-text font-semibold border border-orange rounded-xl p-5 bg-orange mt-10">Découvrir la boutique</button>
          </div>
        </section> */}

        {/*Possible changement de la section 1*/}
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

        <section id="creations" className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center gap-6 mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
            <h2 className="font-title text-6xl text-dark-blue">Des créations artisanales, en petites séries ou en pièce unique</h2>
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
              {products.map((product: Product) => {
                // On récupère la première image, ou une image par défaut si le tableau est vide
                const mainImageUrl = product.images.length > 0 
                  ? product.images[0].url 
                  : '/static/placeholder.jpg'; // Ton image par défaut dans le dossier public/

                return (
                  <a key={product.id} href={`/shop/${product.id}`} className="group">
                    <img 
                      alt={`Image de ${product.name}`} 
                      src={mainImageUrl} 
                      className="aspect-square w-full rounded-lg bg-gray-200 object-cover group-hover:opacity-75" 
                    />
                    <h3 className="mt-4 text-sm text-gray-700">{product.name}</h3>
                    <p className="mt-1 text-lg font-medium text-gray-900">{product.price} €</p>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        <hr className="color-night-blue bg-night-blue h-0.5 my-10"/>

        <section id="review" className="flex flex-col items-center">
          <h3 className="font-title text-dark-blue text-6xl">Elles en parlent mieux que moi</h3>
          {/*Voir pour trouver comment importer des*/}
        </section>

        <hr className="color-night-blue bg-night-blue h-0.5 my-10"/>

        <section id="upcycling" className="flex flex-col items-center gap-4">
          <h3 className="font-title text-6xl text-dark-blue">Donner une seconde vie aux matières</h3>
          <p className="font-text text-lg">J’aime travailler avec des matières qui ont déjà vécu, comme les jeans, que je transforme pour leur offrir une nouvelle histoire.</p>
          <p className="font-text text-lg">L’upcycling me permet de créer autrement, sans produire inutilement, tout en donnant naissance à des sacs solides, uniques et chargés d’authenticité.</p>
          <button className="font-text font-semibold border border-orange rounded-xl p-5 bg-orange">Découvrir les créations upcyclées</button>
        </section>

        <hr className="color-night-blue bg-night-blue h-0.5 my-10"/>

        <section id="newsletter" className="flex flex-col items-center gap-4">
          <h3 className="font-title text-6xl text-dark-blue">Rejoignez l’univers Sac’Azura</h3>
          <p className="font-text text-lg">Les nouvelles créations partent vite. Soyez la première à les voir !</p>
          <p className="font-text text-lg">Coulisses de l’atelier, nouveautés et offres exclusives dans votre boîte mail, sans spam.</p>
          <form className="flex flex-col items-center w-full max-w-md">
            <input 
              type="email" 
              placeholder="Votre email" 
              className="w-full p-2 border border-2 border-night-blue rounded"
            />
            <button 
              type="submit" 
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              S'inscrire
            </button>
          </form>
        </section>

        <section id="shop" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold text-gray-800">Boutique</h3>
            <p className="text-gray-600">Découvrez nos produits.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
