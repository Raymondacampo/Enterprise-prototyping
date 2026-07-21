# 1. Blueprint técnico del MVP

## Visión y alcance
Plataforma agnóstica de ERP que convierte exportaciones Excel/CSV en datasets diagnosticados, normalizados y auditables antes de migraciones, integraciones, BI, MDM o IA. El MVP procesa clientes, proveedores y productos; no modifica fuentes ni fusiona registros automáticamente.

## Casos de uso y flujo
Ingesta → validación estructural → perfil → reglas de calidad → candidatos duplicados → propuestas de normalización/homologación → revisión humana → dataset limpio/rechazado → bitácora y reporte antes/después.

## Arquitectura
- UI Streamlit; servicio Python/Pandas; validación Pydantic/Pandera en alfa; RapidFuzz para candidatos; CSV en MVP, DuckDB/PostgreSQL en alfa.
- OpenAI Responses API: razonamiento semántico, clasificación, explicación y propuestas con salida estructurada. Código: tipos, regex, métricas, reglas críticas, hashes, aplicación/reversión.
- Entidades: `DatasetVersion`, `Profile`, `QualityRule`, `Issue`, `DuplicateCandidate`, `ChangeProposal`, `Approval`, `AuditEvent`, `CatalogMapping`.

## Agentes y límites
| Agente | Entrada → salida | Herramientas | Decisión/límite | Humano, log y métrica |
|---|---|---|---|---|
| Descubrimiento | muestra → esquema | profiler, GPT | sugiere semántica; no altera tipos | confirma llave; precisión de tipo |
| Perfil | tabla → estadísticas | Pandas | determinístico | log de versión; cobertura |
| Calidad | perfil+reglas → issues | regex/SQL | reglas críticas sin IA | aprueba excepciones; falsos positivos |
| Duplicados | campos → pares | RapidFuzz/embeddings | solo candidatos | decide merge; precision@k |
| Homologación | valores+catálogo → mappings | diccionario/GPT | no crea maestro definitivo | data steward aprueba; aceptación |
| Normalización | registro → propuestas | reglas/GPT | no sobrescribe | aprobación; tasa de reversión |
| Reglas | contexto → borrador de regla | GPT/Pydantic | regla inactiva por defecto | owner publica; defect escape |
| Auditor | eventos → hallazgos | hashes/SQL | read-only | auditor revisa; cobertura de log |
| Explicación | evidencia → texto | GPT | cita evidencia suministrada | usuario valida; groundedness |
| Reportes | métricas → informe | plantillas/GPT | cifras vienen del motor | responsable firma; consistencia |

## Seguridad y trazabilidad
Tenant y claves por cliente; cifrado en tránsito/reposo; RBAC; secretos fuera del repo; minimización/seudonimización; `store=false`; sin datos reales en demo. Original inmutable, versiones con SHA-256, lineage, aprobación separada, idempotencia y reversión. Para producción: SSO, KMS, DLP, residencia y ZDR sujetos a contrato.

## Stack y justificación
Python/Pandas acelera el MVP; DuckDB permite SQL analítico local; PostgreSQL y FastAPI entran en alfa multiusuario; Streamlit reduce tiempo de UI; RapidFuzz bloquea candidatos eficientemente; Pydantic/Structured Outputs fijan contratos; pytest automatiza controles; Docker garantiza portabilidad. Great Expectations, Spark, Kubernetes y orquestadores multiagente se difieren por costo/plazo.

## Integraciones y repositorio
Conectores futuros: SQL Server/PostgreSQL/MySQL y APIs; adaptadores para SAP B1/S4, Dynamics BC/GP y NetSuite mediante staging. Estructura: `app.py`, `core.py`, `data/`, `tests/`, `docs/`, configuración y README.

## Aceptación, pruebas y límites
Carga CSV/XLSX; perfil y score visibles; candidatos duplicados; ≥1 catálogo homologado; aceptar/rechazar; original preservado; export limpio/auditoría/reporte; tres maestros sintéticos; pruebas críticas en verde. Límites: volumen de laptop, reglas RD de ejemplo, sin validación fiscal/postal oficial ni conectores directos.

## Evolución
Alfa: API, DuckDB/Postgres, autenticación, OpenAI estructurado. Piloto: conectores, reglas del cliente y evaluación etiquetada. Producto: multi-tenant, MDM workflow, observabilidad, marketplace de reglas y despliegue privado.

