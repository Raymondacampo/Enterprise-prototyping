# Enterprise Data Preparation & Quality AI

MVP de preparación de datos empresarial, agnóstico de ERP, con preservación del original, perfilamiento, score de calidad, duplicados, normalización, homologación básica, aprobación humana, exportación y auditoría reversible.

## Ejecución

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
streamlit run app.py
```

Abra la URL local y cargue uno o varios archivos de `data/`. Para probar: `pytest -q`.

## Arquitectura del MVP

`app.py` controla la experiencia; `core.py` contiene reglas puras y testeables; `data/` contiene únicamente datos sintéticos; `tests/` valida funciones críticas. Los cambios se proponen y nunca se aplican sin selección explícita. El hash del dataset, valor anterior, propuesto, regla, confianza, actor y tiempo se incluyen en la bitácora.

## OpenAI

La versión de demostración funciona offline. La evolución alfa usa Responses API con `store=false` y Structured Outputs para clasificación semántica, explicación y propuestas; las validaciones críticas permanecen determinísticas. El nombre comercial “GPT-5.6 Sol” debe mapearse al identificador API habilitado en la cuenta antes del piloto; no se inventa un slug. Nunca se envían datasets completos: solo campos minimizados o seudonimizados.

## Límites

El MVP no resuelve MDM completo, conectores ERP, RBAC empresarial, exactitud postal/fiscal oficial ni procesamiento masivo distribuido. No fusiona duplicados automáticamente.

