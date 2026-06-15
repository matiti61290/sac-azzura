export default ProductCard () {
    return(
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
    )
}