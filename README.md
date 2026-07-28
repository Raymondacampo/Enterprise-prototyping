# Enterprise Data Preparation & Quality AI

MVP de preparación de datos empresarial, agnóstico de ERP, con preservación del original, perfilamiento, score de calidad, duplicados, normalización, homologación básica, aprobación humana, exportación y auditoría reversible.

## Ejecución

BACKEND

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py
```

FRONTEND

```bash
cd frontend
npm install
npm run dev
```

Abra la URL local y cargue uno o varios archivos de `data/`. Para probar: `pytest -q`.

## Arquitectura del MVP

El backendesta desarrollado en `FastAPI`, utiliza `pydantic` para validar datos y gestionar esquemas, y librerias como `pandas` para la lectura de archivos csv y `SQLAlchemy` para la conexion e iteracion a base de datos.

`main.py` controla la experiencia; `core.py` contiene reglas puras y testeables; `data/` contiene únicamente datos sintéticos; `tests/` valida funciones críticas. Los cambios se proponen y nunca se aplican sin selección explícita. El hash del dataset, valor anterior, propuesto, regla, confianza, actor y tiempo se incluyen en la bitácora.

## OpenAI

Actualmente contamos con codigo muy sencillo con acceso al api de Open AI.
Se debe configurar los valores OPENAI_API_KEY, OPENAI_MODEL y DATA_RETENTION=false en su archivo .env para que funcione correctamente

## Límites

El MVP no resuelve MDM completo, conectores ERP, RBAC empresarial, exactitud postal/fiscal oficial ni procesamiento masivo distribuido. No fusiona duplicados automáticamente.

