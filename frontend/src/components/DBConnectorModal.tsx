// src/components/DBConnectorModal.tsx
'use client';

import { useState } from 'react';
import { testDBConnection, fetchDBTable } from '@/lib/api';

interface DBConnectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTableLoaded: (data: any, tableName: string) => void;
}

export function DBConnectorModal({ isOpen, onClose, onTableLoaded }: DBConnectorModalProps) {
  const [dbType, setDbType] = useState('postgresql');
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState(5432);
  const [user, setUser] = useState('postgres');
  const [password, setPassword] = useState('');
  const [dbName, setDbName] = useState('');

  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState('');

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setLoading(true);
    try {
      const config = { db_type: dbType, host, port: Number(port), user, password, db_name: dbName };
      const res = await testDBConnection(config);
      setTables(res.tables || []);
      if (res.tables.length > 0) setSelectedTable(res.tables[0]);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImportTable = async () => {
    if (!selectedTable) return;
    setLoading(true);
    try {
      const config = { db_type: dbType, host, port: Number(port), user, password, db_name: dbName };
      const res = await fetchDBTable(config, selectedTable);
      onTableLoaded(res, selectedTable);
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl text-xs">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            🔌 Conectar Base de Datos Empresarial
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-mono">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-slate-400 mb-1">Motor de Base de Datos</label>
            <select
              value={dbType}
              onChange={(e) => {
                setDbType(e.target.value);
                setPort(e.target.value === 'mysql' ? 3306 : 5432);
              }}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5"
            >
              <option value="postgresql">PostgreSQL</option>
              <option value="mysql">MySQL / MariaDB</option>
              <option value="sqlite">SQLite (Local)</option>
            </select>
          </div>

          {dbType !== 'sqlite' && (
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-slate-400 mb-1">Host / Servidor</label>
                <input
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Puerto</label>
                <input
                  type="number"
                  value={port}
                  onChange={(e) => setPort(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-400 mb-1">Base de Datos</label>
              <input
                type="text"
                value={dbName}
                onChange={(e) => setDbName(e.target.value)}
                placeholder="ej: produccion_db"
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2"
              />
            </div>
            {dbType !== 'sqlite' && (
              <div>
                <label className="block text-slate-400 mb-1">Usuario</label>
                <input
                  type="text"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2"
                />
              </div>
            )}
          </div>

          {dbType !== 'sqlite' && (
            <div>
              <label className="block text-slate-400 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2"
              />
            </div>
          )}

          <button
            onClick={handleTestConnection}
            disabled={loading || !dbName}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg border border-slate-700 transition-colors"
          >
            {loading ? 'Conectando...' : 'Probar Conexión y Listar Tablas'}
          </button>

          {tables.length > 0 && (
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <label className="block text-slate-300 font-medium">Seleccionar Tabla a Auditar</label>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="w-full bg-slate-950 border border-indigo-500/50 text-slate-200 rounded-lg p-2.5 font-mono"
              >
                {tables.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <button
                onClick={handleImportTable}
                disabled={loading}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors"
              >
                Cargar Tabla en Auditoría
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}