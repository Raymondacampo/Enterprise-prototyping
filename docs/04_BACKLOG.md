# 4. Backlog técnico

| Épica / historia | Tareas | P | Est. | Dep. | Aceptación | Responsable | Estado |
|---|---|---:|---:|---|---|---|---|
| Ingesta: cargar CSV/XLSX | parser, preview, errores | P0 | 6h | entorno | archivos válidos y error seguro | Dev | Hecho MVP |
| Perfil: conocer estructura | tipos, nulos, cardinalidad | P0 | 6h | ingesta | métricas por columna | Data Eng | Hecho MVP |
| Calidad: medir score | dimensiones/reglas | P0 | 8h | perfil | score reproducible | DQ | Parcial MVP |
| Duplicados: ver candidatos | blocking, fuzzy, evidencia | P0 | 8h | perfil | pares con confianza | ML Eng | Hecho MVP |
| Homologar catálogo | diccionario, mapping | P0 | 6h | catálogo | unidad/país homologados | DQ | Hecho MVP |
| Aprobación humana | aceptar/rechazar | P0 | 6h | propuestas | nunca autoaplica | Dev | Hecho MVP |
| Auditoría | hash, before/after, actor | P0 | 6h | aprobación | export reversible | Dev | Hecho MVP |
| IA semántica | prompt, schema, eval | P1 | 10h | key | JSON válido y grounded | AI Eng | Diseñado |
| SQL/ERP conectores | adaptadores | P1 | 20h | credenciales | lectura incremental | Data Eng | Backlog |
| Multiusuario | FastAPI/Postgres/RBAC | P1 | 30h | arquitectura | aislamiento probado | Platform | Backlog |
| Observabilidad | métricas/costos/trazas | P1 | 12h | API | dashboards y alertas | DevOps | Backlog |
| MDM workflow | merge/survivorship | P2 | 40h | piloto | stewardship completo | Product | Backlog |

