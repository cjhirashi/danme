import Image from "next/image";
import type { Product } from "@prisma/client";
import { formatPrice } from "@/lib/services/content.service";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-verde-danme/20 bg-white shadow-sm">
      <div className="relative aspect-square w-full bg-crema">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div
            data-testid="product-image-placeholder"
            className="flex h-full w-full items-center justify-center text-sm text-verde-danme/60"
          >
            Imagen pendiente
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-lg font-semibold text-verde-oscuro">{product.name}</h3>
        <p className="text-sm text-verde-oscuro/80">{product.description}</p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-xl font-bold text-naranja-quemado">
            {formatPrice(product.priceCents)}
          </span>
          <span className="text-xs text-verde-danme">{product.presentation}</span>
        </div>

        {(product.nomExcesoCalorias || product.nomExcesoSodio) && (
          <div className="flex flex-wrap gap-2 pt-2">
            {product.nomExcesoCalorias && (
              <span className="rounded-full bg-verde-oscuro px-2 py-1 text-[10px] font-semibold uppercase text-white">
                Exceso calorías
              </span>
            )}
            {product.nomExcesoSodio && (
              <span className="rounded-full bg-verde-oscuro px-2 py-1 text-[10px] font-semibold uppercase text-white">
                Exceso sodio
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
