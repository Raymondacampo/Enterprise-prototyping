const API_BASE_URL = 'http://127.0.0.1:8000/api';

export async function homologateData(field: string, values: string[], catalog: string[]) {
  const response = await fetch(`${API_BASE_URL}/homologate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ field, values, catalog }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Error al ejecutar la homologación semántica.');
  }

  return response.json(); // Devuelve { proposals: [...] }
}

export async function parseFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/parse-file`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Error al procesar el archivo');
  return res.json();
}

export async function analyzeDataframe(dfJson: string) {
  const formData = new FormData();
  formData.append('df_json', dfJson);

  const res = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Error al analizar el dataset');
  return res.json();
}

export async function applyChanges(dfJson: string, changes: any[], acceptedIndices: number[]) {
  const res = await fetch(`${API_BASE_URL}/apply-changes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      df_json: dfJson,
      changes,
      accepted_indices: acceptedIndices,
    }),
  });

  if (!res.ok) throw new Error('Error al aplicar los cambios');
  return res.json();
}