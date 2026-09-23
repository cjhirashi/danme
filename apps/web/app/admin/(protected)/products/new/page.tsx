import ProductForm from "@/components/admin/ProductForm";

// RF-106
export default function NewProductPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-verde-oscuro">Nuevo producto</h1>
      <ProductForm />
    </div>
  );
}
