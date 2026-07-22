'use client';

import { useState } from 'react';
import { homologateData } from '@/lib/api';

interface Proposal {
  source: string;
  target: string | null;
  confidence: number;
  reason: string;
  status: 'PROPOSED' | 'REVIEW';
}

export function SemanticHomologator({ columns, data }: { columns: string[]; data: any[] }) {
  const [selectedField, setSelectedField] = useState<string>('');
  const [catalogInput, setCatalogInput] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Proposal[]>([]);

  const handleHomologate = async () => {
    if (!selectedField || !catalogInput.trim()) {
      alert('Por favor selecciona un campo y define el catálogo de destino.');
      return;
    }

    setLoading(true);
    try {
      // Extraer valores únicos del campo seleccionado en el dataset
      const uniqueValues = Array.from(
        new Set(data.map((row) => String(row[selectedField] ?? '')).filter(Boolean))
      ).slice(0, 50); // Muestra máxima para enviar

      const catalog = catalogInput
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      const res = await homologateData(selectedField, uniqueValues, catalog);
      setResults(res.proposals || []);
    } catch (err: any) {
      alert(err.message || 'Error en la llamada a la IA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
      <div>
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            🤖
          </span>
          Homologación Semántica Asistida por IA
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Normaliza valores ambiguos proyectándolos contra un catálogo normativo definido.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Seleccionar Columna */}
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-2">Columna a analizar</label>
          <select
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg p-2.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="">-- Seleccionar columna --</option>
            {columns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>

        {/* Definir Catálogo */}
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-2">
            Catálogo permitido (separado por comas)
          </label>
          <input
            type="text"
            value={catalogInput}
            onChange={(e) => setCatalogInput(e.target.value)}
            placeholder="Ej: ACTIVO, INACTIVO, SUSPENDIDO"
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg p-2.5 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <button
        onClick={handleHomologate}
        disabled={loading}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-all disabled:opacity-50"
      >
        {loading ? 'Analizando con modelo semántico...' : 'Ejecutar Homologación IA'}
      </button>

      {/* Resultados de la IA */}
      {results.length > 0 && (
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <h4 className="text-xs font-semibold text-slate-300">Propuestas del Modelo:</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {results.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono"
              >
                <div className="flex items-center gap-3">
                  <span className="text-red-400">{item.source}</span>
                  <span className="text-slate-600">➔</span>
                  <span className="text-emerald-400 font-bold">{item.target ?? 'NULL (No mapeable)'}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-slate-400">{item.reason}</span>
                  <span
                    className={`px-2 py-0.5 rounded ${
                      item.status === 'PROPOSED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {Math.round(item.confidence * 100)}% conf
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}