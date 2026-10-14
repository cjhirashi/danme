import { listAllProducts } from "@/lib/services/products-admin.service";
import { formatPrice } from "@/lib/services/content.service";
import ProductAvailabilityToggle from "@/components/admin/ProductAvailabilityToggle";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import FlashNotice from "@/components/admin/FlashNotice";
import AdminTable from "@/components/admin/AdminTable";
import AdminButton from "@/components/admin/AdminButton";

// RF-106, RF-107, RF-108, RF-123
export default async function AdminProductsPage() {
  const products = await listAllProducts();

  const headers = ["Nombre", "Precio", "Disponible"];
  const rows = products.map((product) => [
    product.name,
    formatPrice(product.priceCents),
    product.available ? "✅ Sí" : "❌ No",
  ]);

  const actions = products.map((product) => (
    <div key={product.id} className="flex gap-2">
      <AdminButton element="link" href={`/admin/products/${product.id}`} variant="secondary">
        Editar
      </AdminButton>
      <ProductAvailabilityToggle productId={product.id} productName={product.name} available={product.available} />
      <DeleteProductButton productId={product.id} productName={product.name} />
    </div>
  ));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-verde-oscuro">Productos</h1>
        <AdminButton element="link" href="/admin/products/new" variant="primary">
          ➕ Nuevo producto
        </AdminButton>
      </div>

      <FlashNotice />

      {products.length > 0 ? (
        <AdminTable headers={headers} rows={rows} actions={actions} />
      ) : (
        <div className="rounded border border-verde-danme/20 bg-verde-danme/5 p-6 text-center text-verde-oscuro">
          No hay productos.{" "}
          <AdminButton element="link" href="/admin/products/new" variant="primary">
            Crear uno
          </AdminButton>
        </div>
      )}
    </div>
  );
}
