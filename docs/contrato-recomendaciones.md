# Contrato de recomendaciones energéticas

## Ruta

`GET /api/recomendaciones` requiere una sesión autenticada. Los clientes, analistas y administradores reciben recomendaciones únicamente para los dispositivos activos de su propia cuenta. El administrador no puede consultar datos de consumo de otras cuentas mediante esta ruta.

La respuesta contiene:

- `recomendaciones`: hasta tres aparatos con mayor estimación diaria entre los que tengan un consejo editorial publicado para su categoría. Cada registro informa aparato, categoría, kWh/día estimados, participación en la suma estimada de los aparatos analizados y el consejo con su fuente.
- `dispositivosSinConsejo`: aparatos con estimación positiva para los que no hay un consejo específico publicado.
- `dispositivosAnalizados`: cantidad de aparatos activos con estimación diaria positiva.
- `consumoEstimadoTotalKwhDia`: suma de las estimaciones diarias consideradas.
- `nota`: explica que la priorización es orientativa y que la estimación no es una medición ni un diagnóstico de eficiencia.

Ejemplo de respuesta:

```json
{
  "recomendaciones": [
    {
      "dispositivoId": "...",
      "dispositivo": "Nevera principal",
      "categoria": "nevera",
      "consumoEstimadoKwhDia": 1.2,
      "participacionPorcentual": 54.5,
      "consejo": {
        "titulo": "Revisa la etiqueta y el uso de tu nevera",
        "resumen": "La etiqueta aporta información para comparar equipos.",
        "texto": "...",
        "imagenUrl": "",
        "imagenAlt": "",
        "fuente": "Ministerio de Minas y Energía",
        "fuenteUrl": "https://..."
      }
    }
  ],
  "dispositivosSinConsejo": [],
  "dispositivosAnalizados": 2,
  "consumoEstimadoTotalKwhDia": 2.2,
  "nota": "Orden orientativo según la estimación diaria registrada para cada aparato..."
}
```

## Regla de recomendación

El backend filtra por `usuarioId` y `activo: true`; usa `consumoEstimadoKwhDia` del aparato y consejos de contenido con `categoria: consejo`, `publicado: true` y `categoriaDispositivo` igual a la categoría del dispositivo. Ordena aparatos por estimación descendente, desempata por nombre y devuelve como máximo tres recomendaciones. No suma lecturas manuales del hogar con estimaciones de dispositivos, no infiere que un aparato sea ineficiente y no cambia los datos del usuario.

Si falta un consejo para una categoría, la interfaz lo comunica. Un administrador puede publicar ese consejo desde Administración → Contenido e imágenes y asociarlo a la categoría del aparato.
