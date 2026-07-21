# 2. Plan operativo de 72 horas

| Horas | Actividad / responsable | Dependencia | Salida y control |
|---|---|---|---|
| 0–4 | PO+Arquitecto: alcance, riesgos, DoD | sponsor | backlog congelado; gate G0 |
| 4–8 | Data engineer: datasets y contratos | campos mínimos | 3 CSV adversos validados |
| 8–12 | Dev: ingesta/perfil | entorno | carga y perfil unit-tested |
| 12–18 | Dev+DQ: score/reglas | catálogo | métricas reproducibles; G1 |
| 18–24 | ML engineer: duplicados | blocking fields | pares con evidencia |
| 24–30 | Dev: normalización/homologación | reglas | propuestas no destructivas |
| 30–36 | OpenAI engineer: schemas/prompts/fallback | API key | salida estructurada evaluada |
| 36–42 | Dev: aprobación/auditoría/reversión | UI | before/after y hashes; G2 |
| 42–48 | Dev: export/reportes | flujo completo | CSV+JSON descargables |
| 48–54 | QA: unitarias/funcionales/adversas | build | defectos P0/P1=0 |
| 54–60 | Security: secretos, PII, tenant | threat model | checklist y correcciones |
| 60–66 | PO: demo, comercial y concurso | métricas | ensayo ≤8 min; G3 |
| 66–70 | Equipo: regresión y contingencia | release candidate | demo offline empaquetada |
| 70–72 | Sponsor: aceptación y tag | evidencias | v0.1.0 y acta Go/No-Go |

Contingencias: sin API → reglas/diccionarios y respuestas precalculadas identificadas; Excel defectuoso → CSV UTF-8; librería falla → versión fijada; volumen alto → muestreo y DuckDB; precisión baja → elevar umbral y revisión total. Avance exige pruebas verdes, evidencia y cero pérdida del original. Terminado significa flujo E2E, tres datasets, descargas, logs, documentación y demo repetible.

