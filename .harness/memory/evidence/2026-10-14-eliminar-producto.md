# Evidencia e2e — SPEC-002 enmienda 2026-10-14 (b): eliminar producto (T-084)

- Script: `apps/web/e2e/delete-product.mjs` (receta en su cabecera).
- Entorno: build local `danme-web:verify` (código de la enmienda con las correcciones del revisor), puerto 3100, `DATABASE_URL` = `danme_test`, volumen `danme-uploads-verify`.
- Fecha: 2026-10-14.

Salida:

```
1 creado en lista: true
2 diálogo: ¿Eliminar definitivamente «Borrar E2E 711»? Esta acción no se puede deshacer.

Cancelar
Eliminar
3 cancelar → cerrado: true | DELETEs: 0
4 escape → cerrado: true | DELETEs: 0
5 fondo → cerrado: true | DELETEs: 0
6 DELETEs: 1 | sigue en lista: false
7 aviso: ✓
Producto «Borrar E2E 711» eliminado
×
8 en landing: false
```

Después: `ls public/uploads/products | wc -l` en el contenedor = `0`. El archivo de la imagen recién subida se borró junto con la fila.

Lectura:
- 1: el producto creado con imagen aparece en la lista.
- 2: el diálogo nombra el producto (RF-125).
- 3–5: Cancelar, Escape y clic en el fondo cierran el diálogo sin ninguna petición DELETE (RF-125).
- 6: confirmar hace exactamente 1 DELETE y el producto desaparece de la lista sin recargar (RF-126, RF-128).
- 7: aviso de éxito con el nombre (RF-127).
- 8: el producto ya no está en el landing (RF-126).
