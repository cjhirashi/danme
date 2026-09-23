import Link from "next/link";
import { listAllProducts } from "@/lib/services/products-admin.service";
import { formatPrice } from "@/lib/services/content.service";
import ProductAvailabilityToggle from "@/components/admin/ProductAvailabilityToggle";

// RF-106, RF-107, RF-108
export default async function AdminProductsPage() {
  const products = await listAllProducts();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-verde-oscuro">Productos</h1>
        <Link href="/admin/products/new" className="rounded bg-verde-danme px-4 py-2 text-white">
          Nuevo producto
        </Link>
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b text-verde-oscuro/70">
            <th className="py-2">Nombre</th>
            <th>Precio</th>
            <th>Disponible</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b">
              <td className="py-2">{product.name}</td>
              <td>{formatPrice(product.priceCents)}</td>
              <td>{product.available ? "Sí" : "No"}</td>
              <td className="flex gap-3 py-2">
                <Link href={`/admin/products/${product.id}`} className="underline">
                  Editar
                </Link>
                <ProductAvailabilityToggle productId={product.id} available={product.available} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
