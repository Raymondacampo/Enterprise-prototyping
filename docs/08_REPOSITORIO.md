# 8. Repositorio del MVP

Contenido: aplicación Streamlit, motor desacoplado, capa semántica opcional OpenAI, configuración versionada, tres datasets sintéticos, pruebas, Dockerfile, variables de entorno de ejemplo y documentación de los 12 entregables. `README.md` contiene instalación y ejecución; `openai_semantic.py` documenta el contrato API; `core.py` es la API interna del MVP.

Control de versión recomendado: rama protegida `main`, PR obligatorio, secretos bloqueados, tags semánticos y CI con `pytest`. Primer tag: `v0.1.0-mvp`. API alfa propuesta: `POST /datasets`, `GET /datasets/{id}/profile`, `POST /datasets/{id}/analyze`, `GET /proposals`, `POST /proposals/{id}/decision`, `GET /exports/{version}`; OAuth2/RBAC e idempotency key obligatorios.

