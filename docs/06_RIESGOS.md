# 6. Matriz de riesgos

| Riesgo | P/I | Causa | Prevención / alerta | Mitigación-contingencia | Dueño |
|---|---|---|---|---|---|
| Falso merge | M/Crítico | similitud ambigua | no auto-merge; aceptación baja | subir umbral, rollback | Data steward |
| Exposición PII | M/Crítico | envío excesivo | minimización, DLP; payload anómalo | cortar API, rotar clave, incidente | CISO |
| Alucinación | M/Alto | contexto insuficiente | schema+evidencia; JSON inválido | fallback determinístico | AI Eng |
| Pérdida original | B/Crítico | overwrite | inmutabilidad/hash | restaurar versión | Platform |
| Score engañoso | M/Alto | pesos genéricos | pesos aprobados; divergencia KPI | recalibrar y versionar | DQ Lead |
| API caída/límite | M/Medio | red/cuota | timeout/retry; 429/5xx | modo offline | DevOps |
| Prompt injection en datos | M/Alto | texto malicioso | datos delimitados, sin tools | aislar registro y revisar | AI Eng |
| Catálogo incorrecto | M/Alto | maestro obsoleto | owner/versiones | revertir mapping | Data owner |
| Rendimiento | M/Medio | O(n²) | blocking/muestreo | DuckDB/índice/batch | Data Eng |
| Aislamiento tenant | B/Crítico | diseño/config | pruebas tenant | suspender, investigar | Security |
| Cambio de modelo/precio | M/Medio | proveedor | alias configurable; alerta costo | pin/evaluar alternativa | Product |
| Plazo 72h | A/Alto | scope creep | P0 congelado | diferir P1/P2 | PM |

