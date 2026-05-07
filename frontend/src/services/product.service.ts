export const ProductService = {
    async getAllProduct(){
        const res = await fetch(`${process.env.NEXT_API}/products`, {
            next: {revalidate: 3600}
        })
        return res.json()
    }
}
