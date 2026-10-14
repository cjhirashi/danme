import ProductForm from "@/components/admin/ProductForm";

// RF-106
export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-verde-oscuro">Nuevo producto</h1>
      <ProductForm />
    </div>
  );
}
