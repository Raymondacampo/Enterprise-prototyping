# backend/main.py
import io
import json
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

from core import profile, quality, duplicates, propose, apply_changes
import openai_semantic
import db # Importamos nuestro nuevo módulo de BD

app = FastAPI(
    title="Enterprise Data Quality API",
    description="Backend local para análisis y preparación de datos"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:1420", "tauri://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Modelos Pydantic ---
class ApplyChangesRequest(BaseModel):
    df_json: str
    changes: list
    accepted_indices: List[int]

class HomologateRequest(BaseModel):
    values: List[str]
    catalog: List[str]
    field: str

class DBConnectionConfig(BaseModel):
    db_type: str  # 'postgresql', 'mysql', 'sqlite'
    host: Optional[str] = "localhost"
    port: Optional[int] = 5432
    user: Optional[str] = ""
    password: Optional[str] = ""
    db_name: str

class DBFetchTableRequest(BaseModel):
    config: DBConnectionConfig
    table_name: str
    limit: Optional[int] = 500

class GenerateSQLScriptRequest(BaseModel):
    table_name: str
    changes: list
    accepted_indices: List[int]


# --- ENDPOINTS EXISTENTES Y NUEVOS ---

@app.post("/api/parse-file")
async def parse_file(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        if file.filename and file.filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(contents))
        elif file.filename and file.filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Formato no soportado.")
        
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
    try:
        df = pd.read_json(io.StringIO(df_json))
        return {
            "profile": profile(df),
            "duplicates": duplicates(df),
            "proposed_changes": propose(df)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/apply-changes")
async def apply_dataset_changes(payload: ApplyChangesRequest):
    try:
        df = pd.read_json(io.StringIO(payload.df_json))
        accepted_set = set(payload.accepted_indices)
        clean_df, audit_df = apply_changes(df, payload.changes, accepted_set)
        
        report = {
            "before": quality(df),
            "after": quality(clean_df),
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
    try:
        result = openai_semantic.homologate(payload.values, payload.catalog, payload.field)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- NUEVOS ENDPOINTS DE BASE DE DATOS ---

@app.post("/api/db/test")
async def test_database_connection(config: DBConnectionConfig):
    """Conecta a la BD del cliente y lista las tablas disponibles."""
    try:
        tables = db.test_db_connection(config.dict())
        return {"status": "success", "tables": tables}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error de conexión: {str(e)}")

@app.post("/api/db/fetch-table")
async def fetch_database_table(payload: DBFetchTableRequest):
    """Extrae los registros de una tabla para analizarlos en la app."""
    try:
        df = db.fetch_table_data(payload.config.dict(), payload.table_name, payload.limit)
        q_metrics = quality(df)
        return {
            "table_name": payload.table_name,
            "metrics": q_metrics,
            "data": json.loads(df.to_json(orient="records")),
            "columns": list(df.columns)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/db/generate-sql")
async def generate_sql_script(payload: GenerateSQLScriptRequest):
    """Genera un archivo .sql con las sentencias UPDATE para los cambios aceptados."""
    try:
        sql_content = db.generate_update_script(
            payload.table_name, payload.changes, set(payload.accepted_indices)
        )
        return {"sql": sql_content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

# backend/main.py (Añadir nuevo endpoint)

@app.post("/api/parse-sql-file")
async def parse_sql_file(file: UploadFile = File(...)):
    """Recibe un archivo .sql local, lo carga en memoria y retorna las tablas con sus datos."""
    try:
        contents = await file.read()
        conn, tables = db.load_sql_file_to_sqlite(contents)
        
        if not tables:
            raise HTTPException(status_code=400, detail="El archivo .sql no contiene sentencias de creación de tablas o datos.")
        
        # Leemos la primera tabla por defecto
        first_table = tables[0]
        df = db.fetch_table_from_sqlite_conn(conn, first_table)
        q_metrics = quality(df)
        
        return {
            "filename": file.filename,
            "tables": tables,
            "selected_table": first_table,
            "metrics": q_metrics,
            "data": json.loads(df.to_json(orient="records")),
            "columns": list(df.columns)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error procesando archivo .sql: {str(e)}")