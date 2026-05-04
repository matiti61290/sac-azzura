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

        <section id="welcome" className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-gray-700">Welcome Section</h2>
          <p className="text-gray-600">Bienvenue sur notre site web.</p>
        </section>

        <section id="shop" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold text-gray-800">Boutique</h3>
            <p className="text-gray-600">Découvrez nos produits.</p>
          </div>
        </section>

        <section id="personalization" className="bg-gray-100 p-6 rounded">
          <h3 className="font-semibold text-gray-800">Personnalisation</h3>
          <p className="text-gray-600">Personnalisez vos articles.</p>
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
      </main>
    </div>
  );
}
