import io
import json
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from dotenv import load_dotenv
load_dotenv()

# Importamos directamente tus módulos intactos
from core import profile, quality, duplicates, propose, apply_changes
import openai_semantic

app = FastAPI(
    title="Enterprise Data Quality API",
    description="Backend local para análisis y preparación de datos"
)

# Permitimos conexiones desde los orígenes de desarrollo e instalación de Tauri/Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:1420", "tauri://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos Pydantic para validar entradas desde Next.js
class ApplyChangesRequest(BaseModel):
    df_json: str  # Representación JSON del DataFrame original
    changes: list  # Lista de propuestas devueltas por /propose
    accepted_indices: List[int]  # Índices de los cambios aceptados por el usuario

class HomologateRequest(BaseModel):
    values: List[str]
    catalog: List[str]
    field: str


# --- ENDPOINTS ---

@app.post("/api/parse-file")
async def parse_file(file: UploadFile = File(...)):
    """Recibe un CSV o XLSX y devuelve los datos e indicadores iniciales."""
    try:
        contents = await file.read()
        if file.filename and file.filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(contents))
        elif file.filename and file.filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Formato no soportado. Use CSV o Excel.")
        
        q_metrics = quality(df)
        
        return {
            "filename": file.filename,
            "metrics": q_metrics,
            "data": json.loads(df.to_json(orient="records")),
            "columns": list(df.columns)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze")
async def analyze_dataframe(df_json: str = Form(...)):
    """Ejecuta perfilado, detección de duplicados y propuesta de cambios deterministas."""
    try:
        df = pd.read_json(io.StringIO(df_json))
        
        prof = profile(df)
        dups = duplicates(df)
        prop = propose(df)
        
        return {
            "profile": prof,
            "duplicates": dups,
            "proposed_changes": prop
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/apply-changes")
async def apply_dataset_changes(payload: ApplyChangesRequest):
    """Aplica los cambios aceptados por el usuario y genera los DataFrames limpios y la bitácora."""
    try:
        df = pd.read_json(io.StringIO(payload.df_json))
        accepted_set = set(payload.accepted_indices)
        
        clean_df, audit_df = apply_changes(df, payload.changes, accepted_set)
        
        # Mapeo de métricas tras la limpieza
        q_before = quality(df)
        q_after = quality(clean_df)
        
        report = {
            "before": q_before,
            "after": q_after,
            "rows": len(df),
            "proposed_changes": len(payload.changes),
            "accepted_changes": len(payload.accepted_indices),
            "duplicate_candidates": len(duplicates(df))
        }
        
        return {
            "clean_data": json.loads(clean_df.to_json(orient="records")),
            "audit_trail": json.loads(audit_df.to_json(orient="records")),
            "report": report
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/homologate")
async def homologate_semantic(payload: HomologateRequest):
    """Capa semántica opcional usando OpenAI GPT-5.6 Sol."""
    try:
        result = openai_semantic.homologate(payload.values, payload.catalog, payload.field)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)