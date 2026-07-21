# 10. Guion de demostración (8 minutos)

1. 0:00–0:45: empresa migrará ERP; sus tres maestros contienen duplicados, formatos y catálogos incompatibles.
2. 0:45–1:30: mostrar CSV sintético y afirmar que el original queda inmutable.
3. 1:30–2:30: cargar clientes y observar perfil/score antes.
4. 2:30–3:30: revisar pares Pérez/Gómez con confianza y evidencia; no fusionar automáticamente.
5. 3:30–4:30: mostrar teléfonos/países normalizados y aceptar solo algunos cambios.
6. 4:30–5:30: cargar productos y homologar `und/unidad→UN`, `kg./kilo→KG`.
7. 5:30–6:30: descargar limpio y bitácora; evidenciar original, propuesta, regla, actor, timestamp y hash.
8. 6:30–7:15: comparar score antes/después y reducción de incidencias.
9. 7:15–8:00: explicar OpenAI, límites y roadmap.

Decisión clave del usuario: aceptar/rechazar cada cambio y confirmar mappings. Indicadores: completitud, unicidad, validez, duplicados candidatos, propuestas/aceptadas y tiempo estimado ahorrado (solo si se mide). Contingencia: ejecutar reglas offline y usar outputs locales; si falla UI, mostrar CSV de entrada/salida y reporte JSON; nunca simular una llamada online como real.

