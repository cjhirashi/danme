import type { Product } from "@prisma/client";
import { ProductCard } from "@/components/landing/ProductCard";

export function Catalog({ products }: { products: Product[] }) {
  return (
    <section id="catalogo" className="bg-crema px-4 py-16 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold text-verde-oscuro">
          Nuestros chicharrones
        </h2>

        {products.length === 0 ? (
          <p className="mt-8 text-center text-verde-oscuro/70">
            Catálogo pronto disponible — vuelve a visitarnos.
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
