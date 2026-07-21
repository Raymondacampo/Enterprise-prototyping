'use client';

import { useState, useMemo } from 'react';
import { parseFile, analyzeDataframe, applyChanges } from '@/lib/api';

// --- Types ---
type TabType = 'datos' | 'perfil' | 'duplicados' | 'cambios';

interface ProposedChange {
  row: number;
  column: string;
  original: any;
  proposed: any;
  rule: string;
}

interface MetricProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  color?: 'blue' | 'emerald' | 'amber' | 'indigo' | 'purple';
}

// --- Inline Icon Components for zero external dependency issues ---
function IconDatabase({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21 3.582 4 8 4s8-1.79 8-4" />
    </svg>
  );
}

function IconCheckCircle({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconShieldCheck({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function IconSparkles({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function IconUpload({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  );
}

function IconSearch({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function IconArrowRight({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

export default function Home() {
  const [fileData, setFileData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [selectedChanges, setSelectedChanges] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('datos');

  // Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);
    try {
      const parsed = await parseFile(file);
      setFileData(parsed);

      const jsonString = JSON.stringify(parsed.data);
      const resAnalysis = await analyzeDataframe(jsonString);
      setAnalysis(resAnalysis);
      
      // Auto-select all suggested changes by default for high efficiency
      if (resAnalysis?.proposed_changes) {
        setSelectedChanges(resAnalysis.proposed_changes.map((_: any, i: number) => i));
      }
    } catch (err) {
      alert('Error procesando el archivo en el backend.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleChangeSelection = (index: number) => {
    setSelectedChanges((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const selectAllChanges = () => {
    if (!analysis?.proposed_changes) return;
    if (selectedChanges.length === analysis.proposed_changes.length) {
      setSelectedChanges([]);
    } else {
      setSelectedChanges(analysis.proposed_changes.map((_: any, i: number) => i));
    }
  };

  const handleApplyChanges = async () => {
    if (!selectedChanges.length || !analysis?.proposed_changes) return;
    setApplying(true);
    try {
      const changesToApply = selectedChanges.map((idx) => analysis.proposed_changes[idx]);
      const updatedData = await applyChanges(fileData.data, changesToApply, selectedChanges);
      setFileData((prev: any) => ({ ...prev, data: updatedData }));
      alert('¡Cambios aplicados exitosamente!');
    } catch (err) {
      alert('Error aplicando cambios');
      console.error(err);
    } finally {
      setApplying(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Header Banner */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-xl shadow-lg shadow-indigo-500/20 text-white">
              <IconSparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Enterprise Data Preparation AI</h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full uppercase tracking-wider">
                  MVP Auditable
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Preservación de datos originales · Protocolo de verificación humana
              </p>
            </div>
          </div>

          {fileName && (
            <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-lg text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-400">Archivo activo:</span>
              <span className="font-mono font-medium text-slate-200">{fileName}</span>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Upload Zone */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-900/80 to-slate-900/40 border border-slate-800/80 rounded-2xl p-8 transition-all duration-200 hover:border-slate-700">
          <div className="max-w-xl mx-auto text-center space-y-4">
            <div className="inline-flex p-4 bg-slate-800/60 border border-slate-700/50 rounded-2xl text-indigo-400 shadow-inner">
              <IconUpload className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-200">Cargar conjunto de datos</h2>
              <p className="text-sm text-slate-400 mt-1">
                Soporta archivos <code className="text-indigo-300 font-mono text-xs bg-slate-800 px-1.5 py-0.5 rounded">.CSV</code> y <code className="text-indigo-300 font-mono text-xs bg-slate-800 px-1.5 py-0.5 rounded">.XLSX</code> para diagnóstico instantáneo
              </p>
            </div>

            <div className="relative inline-block mt-2">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                id="file-upload"
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-sm font-medium shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
              >
                <span>Seleccionar archivo local</span>
              </label>
            </div>

            {loading && (
              <div className="flex items-center justify-center gap-3 text-indigo-400 text-sm pt-2">
                <svg className="animate-spin h-4 w-4 text-indigo-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Analizando estructura y reglas de calidad...</span>
              </div>
            )}
          </div>
        </section>

        {/* Dashboard Content upon Data Loaded */}
        {fileData && (
          <div className="space-y-6">
            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Score Global"
                value={`${fileData.metrics?.global ?? 0}%`}
                subtitle="Salud general del dataset"
                icon={<IconShieldCheck className="w-5 h-5 text-indigo-400" />}
                color="indigo"
              />
              <MetricCard
                title="Completitud"
                value={`${fileData.metrics?.completeness ?? 0}%`}
                subtitle="Registros sin nulos"
                icon={<IconCheckCircle className="w-5 h-5 text-emerald-400" />}
                color="emerald"
              />
              <MetricCard
                title="Unicidad"
                value={`${fileData.metrics?.uniqueness ?? 0}%`}
                subtitle="Sin filas duplicadas"
                icon={<IconDatabase className="w-5 h-5 text-blue-400" />}
                color="blue"
              />
              <MetricCard
                title="Validez"
                value={`${fileData.metrics?.validity ?? 0}%`}
                subtitle="Conforme a tipo de dato"
                icon={<IconSparkles className="w-5 h-5 text-purple-400" />}
                color="purple"
              />
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-slate-800 flex items-center justify-between gap-4 overflow-x-auto pb-px">
              <div className="flex space-x-1">
                <TabButton
                  active={activeTab === 'datos'}
                  onClick={() => setActiveTab('datos')}
                  label="Explorador de Datos"
                  count={fileData.data?.length}
                />
                <TabButton
                  active={activeTab === 'perfil'}
                  onClick={() => setActiveTab('perfil')}
                  label="Perfil y Esquema"
                  count={analysis?.profile?.length}
                />
                <TabButton
                  active={activeTab === 'duplicados'}
                  onClick={() => setActiveTab('duplicados')}
                  label="Duplicados Detected"
                  count={analysis?.duplicates?.length}
                  badgeColor={analysis?.duplicates?.length ? 'amber' : 'default'}
                />
                <TabButton
                  active={activeTab === 'cambios'}
                  onClick={() => setActiveTab('cambios')}
                  label="Propuestas de Limpieza"
                  count={analysis?.proposed_changes?.length}
                  badgeColor={analysis?.proposed_changes?.length ? 'indigo' : 'default'}
                />
              </div>

              {activeTab === 'cambios' && analysis?.proposed_changes?.length > 0 && (
                <div className="flex items-center gap-3 pb-2">
                  <button
                    onClick={selectAllChanges}
                    className="text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {selectedChanges.length === analysis.proposed_changes.length
                      ? 'Deseleccionar todos'
                      : 'Seleccionar todos'}
                  </button>
                  <button
                    onClick={handleApplyChanges}
                    disabled={applying || selectedChanges.length === 0}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-medium transition-all"
                  >
                    {applying ? 'Aplicando...' : `Aplicar (${selectedChanges.length})`}
                  </button>
                </div>
              )}
            </div>

            {/* Main Content Card Container */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
              {activeTab === 'datos' && (
                <div className="p-6">
                  <EnhancedDataTable data={fileData.data} />
                </div>
              )}

              {activeTab === 'perfil' && analysis && (
                <div className="p-6">
                  <ProfileView profileData={analysis.profile} />
                </div>
              )}

              {activeTab === 'duplicados' && analysis && (
                <div className="p-6">
                  {analysis.duplicates && analysis.duplicates.length > 0 ? (
                    <EnhancedDataTable data={analysis.duplicates} highlightRow />
                  ) : (
                    <EmptyState message="No se han encontrado registros duplicados en este conjunto de datos." />
                  )}
                </div>
              )}

              {activeTab === 'cambios' && analysis && (
                <div className="p-6">
                  {analysis.proposed_changes && analysis.proposed_changes.length > 0 ? (
                    <ProposedChangesList
                      changes={analysis.proposed_changes}
                      selectedIndices={selectedChanges}
                      onToggle={toggleChangeSelection}
                    />
                  ) : (
                    <EmptyState message="El modelo no detectó anomalías que requieran ajustes automáticos." />
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// --- Component: Metric Card ---
function MetricCard({ title, value, subtitle, icon, color = 'indigo' }: MetricProps) {
  const colorStyles = {
    indigo: 'from-indigo-500/10 border-indigo-500/20 text-indigo-400',
    emerald: 'from-emerald-500/10 border-emerald-500/20 text-emerald-400',
    blue: 'from-blue-500/10 border-blue-500/20 text-blue-400',
    amber: 'from-amber-500/10 border-amber-500/20 text-amber-400',
    purple: 'from-purple-500/10 border-purple-500/20 text-purple-400',
  };

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br via-slate-900 to-slate-900 ${colorStyles[color]} border p-5 rounded-2xl flex flex-col justify-between shadow-lg`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700/50">
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <div className="text-3xl font-extrabold text-white tracking-tight">{value}</div>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

// --- Component: Tab Button ---
function TabButton({
  active,
  onClick,
  label,
  count,
  badgeColor = 'default',
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
  badgeColor?: 'default' | 'indigo' | 'amber';
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative py-3 px-4 font-medium text-sm transition-all duration-150 flex items-center gap-2 border-b-2 -mb-px ${
        active
          ? 'border-indigo-500 text-indigo-400 font-semibold'
          : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
      }`}
    >
      <span>{label}</span>
      {typeof count === 'number' && (
        <span
          className={`text-[11px] font-mono px-2 py-0.5 rounded-full transition-colors ${
            active
              ? 'bg-indigo-500/20 text-indigo-300'
              : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// --- Component: Enhanced Interactive Data Table ---
function EnhancedDataTable({ data, highlightRow }: { data: any[]; highlightRow?: boolean }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 15;

  if (!data || data.length === 0) {
    return <EmptyState message="Sin datos disponibles." />;
  }

  const headers = Object.keys(data[0]);

  // Search filter
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter((row) =>
      headers.some((h) => String(row[h] ?? '').toLowerCase().includes(term))
    );
  }, [data, searchTerm, headers]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="space-y-4">
      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2">
        <div className="relative w-full sm:w-72">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            placeholder="Buscar en registros..."
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
          />
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Mostrando <span className="text-slate-200 font-semibold">{paginatedData.length}</span> de{' '}
          <span className="text-slate-200 font-semibold">{filteredData.length}</span> filas
        </div>
      </div>

      {/* Table Box */}
      <div className="border border-slate-800/80 rounded-xl overflow-x-auto max-h-[460px] scrollbar-thin scrollbar-thumb-slate-800">
        <table className="w-full text-left text-xs text-slate-300 border-collapse">
          <thead className="bg-slate-950/90 text-slate-400 uppercase tracking-wider font-mono text-[10px] sticky top-0 backdrop-blur-md z-10 border-b border-slate-800">
            <tr>
              <th className="p-3 text-center border-r border-slate-800/60 w-12 text-slate-600">#</th>
              {headers.map((h) => (
                <th key={h} className="p-3 font-semibold border-r border-slate-800/60 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {paginatedData.map((row, i) => (
              <tr
                key={i}
                className={`transition-colors hover:bg-slate-800/40 ${
                  highlightRow ? 'bg-amber-500/5' : i % 2 === 0 ? 'bg-slate-900/30' : 'bg-transparent'
                }`}
              >
                <td className="p-3 text-center text-slate-600 border-r border-slate-800/40 text-[10px]">
                  {page * pageSize + i + 1}
                </td>
                {headers.map((h) => {
                  const val = row[h];
                  const isNull = val === null || val === undefined || val === '';
                  return (
                    <td key={h} className="p-3 max-w-xs truncate border-r border-slate-800/40">
                      {isNull ? (
                        <span className="italic text-[10px] text-slate-600 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800/50">
                          null
                        </span>
                      ) : (
                        <span className="text-slate-200">{String(val)}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 text-xs">
          <span className="text-slate-400">
            Página {page + 1} de {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 font-medium transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 font-medium transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Component: Profile View (Data Quality & Types Breakdown) ---
function ProfileView({ profileData }: { profileData: any[] }) {
  if (!profileData || profileData.length === 0) {
    return <EmptyState message="No se generó perfil de columnas." />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {profileData.map((item: any, idx: number) => {
        const nullPercentage = item.null_percentage || 0;
        const completeness = 100 - nullPercentage;

        return (
          <div key={idx} className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
              <span className="font-semibold text-sm text-slate-200 truncate">{item.column || item.columna}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-400 border border-slate-700/50">
                {item.type || item.tipo || 'String'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Completitud</span>
                <span className="font-mono text-slate-200 font-medium">{completeness}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    completeness > 90
                      ? 'bg-emerald-500'
                      : completeness > 70
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${completeness}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/50">
                <span className="text-slate-500 block">Valores Nulos</span>
                <span className="font-mono text-slate-300 font-semibold">{item.nulls ?? item.nulos ?? 0}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/50">
                <span className="text-slate-500 block">Valores Únicos</span>
                <span className="font-mono text-slate-300 font-semibold">{item.unique ?? item.unicos ?? 'N/A'}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Component: Proposed Changes Diff View ---
function ProposedChangesList({
  changes,
  selectedIndices,
  onToggle,
}: {
  changes: ProposedChange[];
  selectedIndices: number[];
  onToggle: (index: number) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <h3 className="text-sm font-semibold text-slate-200">
          Sugerencias de Limpieza Automática ({changes.length})
        </h3>
        <span className="text-xs text-slate-400">
          Haz clic en la casilla para aceptar el cambio
        </span>
      </div>

      <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
        {changes.map((item, idx) => {
          const isSelected = selectedIndices.includes(idx);
          return (
            <div
              key={idx}
              onClick={() => onToggle(idx)}
              className={`group flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900/90 border-indigo-500/50 shadow-md shadow-indigo-500/5'
                  : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-900/50'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {}} // handled by parent onClick container
                className="mt-1 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500/20 bg-slate-900 h-4 w-4 cursor-pointer"
              />

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-500">Fila {item.row}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-indigo-400 font-semibold">{item.column}</span>
                  </div>
                  <span className="text-[10px] font-medium bg-slate-800/80 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700/50">
                    {item.rule}
                  </span>
                </div>

                {/* Diff Comparison */}
                <div className="flex items-center gap-3 font-mono text-xs pt-1">
                  <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-3 py-1.5 rounded-lg line-through truncate max-w-[200px]">
                    {String(item.original ?? 'empty')}
                  </div>
                  <IconArrowRight className="text-slate-500 flex-shrink-0" />
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg font-medium truncate max-w-[200px]">
                    {String(item.proposed)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Component: Empty State Fallback ---
function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-12 text-center space-y-3">
      <div className="w-12 h-12 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-500 flex items-center justify-center mx-auto">
        <IconDatabase className="w-6 h-6" />
      </div>
      <p className="text-sm text-slate-400 max-w-sm mx-auto">{message}</p>
    </div>
  );
}