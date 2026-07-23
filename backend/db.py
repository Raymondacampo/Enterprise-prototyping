# backend/db.py
from typing import List, Dict, Any
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.engine import Engine
import pandas as pd


def build_connection_string(db_type: str, host: str, port: int, user: str, password: str, db_name: str) -> str:
    """Genera la URI de conexión de SQLAlchemy según el motor seleccionado."""
    db_type = db_type.lower()
    if db_type == "postgresql":
        return f"postgresql://{user}:{password}@{host}:{port}/{db_name}"
    elif db_type == "mysql":
        return f"mysql+pymysql://{user}:{password}@{host}:{port}/{db_name}"
    elif db_type == "sqlite":
        return f"sqlite:///{db_name}"
    else:
        raise ValueError(f"Motor de base de datos no soportado: {db_type}")

def test_db_connection(config: dict) -> list[str]:
    """Prueba la conexión y devuelve la lista de tablas disponibles."""
    url = build_connection_string(**config)
    engine = create_engine(url, connect_args={"connect_timeout": 5} if config["db_type"] != "sqlite" else {})
    
    with engine.connect() as conn:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        return tables

def fetch_table_data(config: dict, table_name: str, limit: int = 500) -> pd.DataFrame:
    """Extrae los registros de una tabla específica como un DataFrame de Pandas."""
    url = build_connection_string(**config)
    engine = create_engine(url)
    query = f"SELECT * FROM {table_name} LIMIT {limit}"
    return pd.read_sql(query, con=engine)

def generate_update_script(table_name: str, changes: list[dict], accepted_indices: set[int]) -> str:
    """Genera un script SQL auditado para aplicar los cambios aceptados."""
    sql_statements = []
    for idx in accepted_indices:
        ch = changes[idx]
        col = ch["column"]
        val = str(ch["proposed"]).replace("'", "''") # Escapar comillas simples
        row_id = ch.get("row")
        
        # Sentencia paramétrica genérica
        sql_statements.append(f"UPDATE {table_name} SET {col} = '{val}' WHERE id = {row_id};")
    
    return "\n".join(sql_statements)

    # backend/db.py (Añadir al final del archivo)
import sqlite3

def load_sql_file_to_sqlite(file_bytes: bytes) -> tuple[sqlite3.Connection, list[str]]:
    """Ejecuta un script .sql en una BD SQLite en memoria y retorna las tablas creadas."""
    sql_script = file_bytes.decode('utf-8', errors='ignore')
    
    # Crear conexión SQLite en memoria
    conn = sqlite3.connect(':memory:', check_same_thread=False)
    cursor = conn.cursor()
    
    # Ejecutar el script SQL
    cursor.executescript(sql_script)
    
    # Obtener los nombres de las tablas creadas
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0] for row in cursor.fetchall() if not row[0].startswith('sqlite_')]
    
    return conn, tables

def fetch_table_from_sqlite_conn(conn: sqlite3.Connection, table_name: str, limit: int = 500) -> pd.DataFrame:
    """Extrae datos de una tabla de la base de datos SQLite en memoria."""
    query = f"SELECT * FROM {table_name} LIMIT {limit}"
    return pd.read_sql_query(query, conn)