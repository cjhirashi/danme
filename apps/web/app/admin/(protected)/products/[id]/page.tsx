import { notFound } from "next/navigation";
import { getProductById } from "@/lib/services/products-admin.service";
import ProductForm from "@/components/admin/ProductForm";

// RF-107, RF-109, RF-110
export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-verde-oscuro">Editar producto</h1>
      <ProductForm product={product} />
    </div>
  );
}
