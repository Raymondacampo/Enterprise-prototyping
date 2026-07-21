# 9. Protocolo de pruebas

| Nivel | Casos | Métrica/umbral | Resultado actual |
|---|---|---|---|
| Unitario | perfil, score, fuzzy, reversión | 100% funciones críticas | Automatizado |
| Funcional | carga→descargas | P0 pass=100% | Pendiente UI manual |
| Integración | XLSX, CSV, API/fallback | sin corrupción | CSV cubierto |
| Calidad | nulos, emails, duplicados | golden set aprobado | Dataset incluido |
| Adverso | Unicode, comas, prompt injection, extremos | no crash/no tool execution | Planificado |
| Seguridad | secretos, path, tenant, PII | 0 hallazgos críticos | Alfa |
| Rendimiento | 10k/100k/1M filas | definir p95 por ambiente | Alfa |

Procedimiento: congelar dataset/hash; ejecutar `pytest -q`; registrar ambiente; ejecutar flujo UI por cada maestro; comparar outputs con golden set; verificar original byte a byte; probar rechazo total y aceptación parcial; registrar defecto con severidad, evidencia, causa y fix; repetir regresión. Criterio Go: P0/P1=0, pruebas críticas verdes, reversión demostrada, score reproducible y demo offline disponible.

