# 12. Material del concurso

## Resumen y narrativa
Enterprise Data Preparation & Quality AI ataca el cuello de botella invisible de la transformación digital: datos corporativos que no están listos. Combina controles determinísticos para lo crítico con razonamiento semántico de OpenAI para similitud, clasificación, homologación y explicación, manteniendo decisión humana y evidencia reversible.

## Uso sustantivo de OpenAI
GPT-5.6 Sol se emplea en diseño y razonamiento complejo; en producto, la API clasifica casos ambiguos y produce propuestas estructuradas. Codex construye repositorio, ejecuta pruebas y corrige defectos. La evidencia incluye prompts versionados, schemas, logs de modelo/configuración/tokens/latencia (sin PII), commits, resultados de eval y video E2E. No se atribuye a OpenAI una regla determinística.

## Arquitectura visual
Fuentes ERP/archivos → staging inmutable → perfil y reglas → candidatos fuzzy/semánticos → propuestas GPT estructuradas → aprobación humana → datasets limpio/rechazado → auditoría/reportes.

## Video/pitch (90 segundos)
“Una migración no falla el día del go-live; empieza a fallar cuando clientes, proveedores y productos llegan duplicados e incompatibles. Nuestra solución perfila, encuentra anomalías, propone homologaciones y explica cada candidato. OpenAI aporta razonamiento donde las reglas no alcanzan; el código conserva el control donde equivocarse cuesta. Nada se sobrescribe. Una persona aprueba. En minutos obtenemos una base limpia, un score comparable y una bitácora reversible. Comenzamos con archivos sintéticos y avanzamos hacia conectores ERP, gobierno multiempresa y MDM. No es IA decorativa: es IA gobernada, medible y puesta exactamente donde crea valor.”

Métricas del concurso: tiempo por 1,000 registros, precision/recall de duplicados, exactitud de homologación, aceptación, reversión 100%, schema validity, costo y p95. Limitaciones: MVP local y reglas ejemplo. Roadmap: 72h MVP; 6 semanas alfa; 12 semanas piloto; 6–9 meses producto.

