import Image from "next/image";

export default function Home() {

  //changer le background de la section slogan
  return (
    <div className="">
      <main className="min-h-screen flex flex-col gap-12 p-6 md:p-12">
        
        <section id="slogan" className="text-center bg-[url(../../public/static/home-background.jpg)] py-15">
          <h1 className="text-7xl text-white  font-title mx-5 my-5 pb-10">Sacs et accessoires faits main en Normandie, personnalisables et pensés pour durer</h1>
          <h3 className=" text-xl text-white font-bold font-text m-5">Des créations artisanales uniques, pensées pour vous accompagner au quotidien.</h3>
          <button className="font-text font-semibold border border-orange rounded-xl p-5 bg-orange">Découvrir la boutique</button>
        </section>

        <hr className="color-night-blue bg-night-blue h-0.5 my-10"/>

        <section id="welcome" className="flex flex-col items-center gap-4">
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

        <section id="creations" className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2">
            <h3 className="font-semibold text-gray-800">Créations</h3>
            <p className="text-gray-600">Voyez nos dernières créations.</p>
          </div>
        </section>

        <section id="review" className="bg-white p-6 rounded shadow">
          <h3 className="font-semibold text-gray-800">Avis</h3>
          <p className="text-gray-600">Lisez ce que disent nos clients.</p>
        </section>

        <section id="upcycling" className="flex flex-col gap-4">
          <h3 className="font-semibold text-gray-800">Upcycling</h3>
          <p className="text-gray-600">Découvrez nos initiatives d'upcycling.</p>
        </section>

        <section id="newsletter" className="flex flex-col items-center gap-4">
          <h3 className="font-semibold text-gray-800">Newsletter</h3>
          <form className="w-full max-w-md">
            <input 
              type="email" 
              placeholder="Votre email" 
              className="w-full p-2 border rounded"
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
