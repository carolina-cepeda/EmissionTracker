# Bitácora de Prompts — EcoTrack `EmissionsTracker`

Proyecto: Dashboard de Emisiones en Tiempo Real (Vite + React 18 + TS strict + Tailwind + Supabase).
Metodología: Spec-to-Code iterativa con puntos de control entre fases.

---

## Fase 1 — Estructura

### Prompt usado (resumido)
"Actúa como Arquitecto de Software Frontend Senior. Entrega: (a) árbol de carpetas y archivos, (b) árbol de componentes con responsabilidad de cada uno, (c) interfaces/tipos TypeScript, (d) decisiones de arquitectura con justificación. No escribas implementación todavía. Termina con 'Punto de control 1'."

### Qué produjo la IA
- Árbol de 5 carpetas (`components/`, `hooks/`, `lib/`, `types/`) más primitivas en `components/ui/`.
- 7 componentes: `EmissionsTracker` (contenedor), `EmissionSummary`, `EmissionForm`, `EmissionList`, `EmissionCard`, `EmissionSkeleton`, `ui/{Button,Badge,Alert}`.
- Tipos: `Emission`, `NewEmission`, `EmissionCategory` (tupla `as const`), `EmissionFieldErrors`, `EmissionError`, `UseEmissionsResult`.
- 5 decisiones justificadas: capa repositorio + hook, esquema `category` como `text` validado en TS, actualización optimista con rollback, `created_at` de la BD como reloj maestro, cero dependencias extra de UI/forms.

### Problemas o mejoras detectadas
- La capa `emissionsRepository` no estaba en la especificación original (la UI no debe llamar a Supabase, pero el hook sí necesitaba un punto de acceso). Se añadió para que "la UI no llama a Supabase" sea una regla verificable por estructura de archivos.
- La especificación fijaba `co2_kg: numeric` en Postgres pero el tipo TS `number`: se documentó la normalización `Number(co2_kg)` en el repositorio en lugar de migrar la columna.
- Faltó un `Database` tipado para `@supabase/supabase-js` v2: sin él, `data` es `any` y `strict: true` queda violado de facto.
- SeSplanteó usar `clsx` como dependencia, pero se sustituyó por un helper local de 15 líneas (`src/lib/cn.ts`) para no crecer el bundle.

### Cómo cambió el código entre fases
- **Antes**: solo el prompt y el esquema de la tabla.
- **Después (entrada a Fase 2)**: archivos de tipos creados (`src/types/emission.ts`, `src/types/database.ts`) con `EmissionError` de 4 campos (`kind`, `message`, `detail`) y sin `scope`.

---

## Fase 2 — Lógica

### Prompt usado (resumido)
"Entrega el código completo de `useEmissions.ts` con estados `emissions/loading/error/submitting`, `fetchEmissions` al montar con cleanup, `addEmission` con actualización optimista y rollback, errores tipados y mensajes legibles, `useCallback` donde corresponda. Incluye `supabaseClient.ts`. Explica en 3 líneas el manejo de errores asíncronos."

### Qué produjo la IA
- `src/lib/supabaseClient.ts`: cliente único con `createClient<Database>()`, validación de env vars en arranque y sesión deshabilitada (app anónima).
- `src/lib/emissionsRepository.ts`: `listEmissions()`, `createEmission()`, `mapSupabaseError()` que traduce códigos PostgREST/Postgres (`42501`, `PGRST116`, `23505`, `22P02`…) a `EmissionErrorKind` con mensaje en español.
- `src/hooks/useEmissions.ts`: `refresh()` con `useCallback` + efecto de montaje, `addEmission()` con fila optimista (`id` temporal `optimistic-*`), reemplazo por la fila real y rollback por filtro, `isMounted` como ref para evitar `setState` tras desmontar.

### Problemas o mejoras detectadas
- `useEffect` de montaje + `useEffect` de cargaemedida producen **doble fetch en `StrictMode`** (montaje doble de desarrollo): el `isMounted` evita warnings pero no el doble request. Mitigable con `AbortController` o desactivando el doble montaje.
- El `error` del hook era ambiguo: un fallo de insert y un fallo de carga compartían el mismo estado, por lo que la UI no podía decidir dónde mostrar el mensaje.
- `setSubmitting(false)` en el `finally` con guard de `isMounted` deja el flag en `true` si el componente se desmonta durante el envío (irrelevante en la práctica, pero es una fuga de estado silenciosa).
- La validación existía en el hook (`validate`) pero **no en el formulario** (se desarrolló en Fase 3): riesgo de reglas duplicadas y divergentes.
- `noUncheckedIndexedAccess` y `exactOptionalPropertyTypes` rompieron la primera versión de `mapSupabaseError` (índices possibly `undefined` y `detail?: string` con `undefined` explícito). Se corrigió con `?? 'unknown'` y spread condicional del `detail`.

### Cómo cambió el código entre fases
- **Antes**: `EmissionError = { kind, message, detail? }`; sin repositorio; sin tipos de base de datos.
- **Después**: `EmissionError` ganó `scope: 'load' | 'submit'` (decidido en Fase 3), se añadió `src/types/database.ts`, el repositorio pasó a lanzar errores ya tipados con `scope`, y `mapSupabaseError` recibió el parámetro `scope`.
- **Antes**: `useEmissions` no distinguía origen del error.
- **Después**: `refresh()` → `scope: 'load'`, `addEmission()` → `scope: 'submit'`, y `isEmissionError()` pasó a exigir la presencia de `scope`.

---

## Fase 3 — UI y refinamiento

### Prompt usado (resumido)
"Entrega `EmissionsTracker.tsx`, `EmissionCard.tsx` y `EmissionForm.tsx` con: accesibilidad (labels, `aria-live`, `role="alert"`, foco visible, teclado), rendimiento (`useMemo` para totales y agrupados, `React.memo` en la card), Tailwind responsive con grid 1/2/3, badges por categoría, skeleton, estado vacío y error con botón 'Reintentar', validación (nombre no vacío, CO₂ numérico > 0, categoría obligatoria) y un resumen superior con el total."

### Qué produjo la IA
- `EmissionsTracker`: composición del resumen + formulario + lista; `useMemo` para `totalKg` y `byCategory`; separación de `loadError` y `submitError` por `scope`.
- `EmissionCard`: `React.memo`, badge por categoría, formato `Intl.NumberFormat`/`DateTimeFormat` en `es-ES`, estado "Guardando…" para filas optimistas, `aria-busy`.
- `EmissionForm`: formulario controlado, `useId` para ids únicos, validación por campo con `aria-invalid`/`aria-describedby`/`role="alert"`, foco al primer campo inválido, decimal con coma aceptado, limpieza del formulario solo si el insert devuelve `true`.
- `EmissionList` (skeleton ×6, error + Reintentar, vacío, grid 1/2/3), `EmissionSummary`, `EmissionSkeleton`, `ui/{Button,Badge,Alert}`, `lib/cn.ts`.
- Andamiaje completo y ejecutable: `package.json`, `tsconfig.json`, `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `main.tsx`, `App.tsx`, `index.css`, `vite-env.d.ts`.
- Verificación real: `npx tsc --noEmit` sin errores y `vite build` OK (88 módulos).

### Problemas o mejoras detectadas
- **"Tiempo real" no es real**: no hay Realtime de Supabase ni paginación; el título del producto promete más de lo que la Fase 3 entrega.
- La fila optimista se queda con `created_at` local y con id sintético si la respuesta del servidor es inconsistente; un `refresh()` tras fallo sería más robusto que el rollback local.
- La regla de validación está duplicada en hook y formulario (riesgo de divergencia) y el formulario no reutiliza el `validate` del hook.
- Sin tests: el hook es altamente testeable con Vitest + MSW; el `coverage` no se puede medir.
- Falta verificar las políticas RLS de `emissions` para la anon key: sin `select`/`insert` permisivos, la UI cairá en el error `permission`.
- La dependencia de `Intl` con locale `es-ES` depende del runtime del navegador (ok en navegadores modernos, pero puede variar en hardened ones).

### Cómo cambió el código entre fases
- **Antes (Fase 2)**: `EmissionError` sin `scope`; `types/emission.ts` sin `EmissionErrorScope`.
- **Después**: se añadió `scope` y su tipo; `mapSupabaseError(error, scope)`; `createEmission` lanza con `scope: 'submit'`; `EmissionList` recibe solo errores de carga y `EmissionForm` solo de envío.
- **Antes**: sin `src/lib/cn.ts`, se preveía `clsx`.
- **Después**: helper local `cn` con tipos `ClassValue` recursivos.
- **Antes**: proyecto sin scaffolding ejecutable.
- **Después**: proyecto completo con `npm run dev` / `build` / `typecheck` verificados.

---

## FASE 4 — Esta bitácora

Se documenta el prompt, la producción, los hallazgos y el diff conceptual de cada fase, más las lecciones de prompteo.

---

## Addendum — Modo demo para verificación local (post-Fase 4)

**Prompt**: "Haz los cambios necesarios para no hacer uso de credenciales de supabase de manera que se puedan usar datos Mock, para ello maneja una bandera para el Mock" (el usuario aún no tenía credenciales de Supabase).

**Qué produjo la IA**
- `supabaseClient.ts` dejó de lanzar en el import: ahora exporta `isMockMode` y un cliente perezoso `getSupabase()` que solo exige credenciales cuando se usa de verdad.
- `src/lib/mockEmissions.ts`: backend en memoria con 6 filas de ejemplo, latencia de 350 ms (para ver los skeletons) y simulación de fallo cuando el nombre contiene `error`.
- `emissionsRepository.ts` pasó a ser el único punto de conmutación (`isMockMode ? mock : Supabase`), de modo que hook y UI no cambian.
- `DemoBanner.tsx` visible solo en modo demo; `supabase/schema.sql` con tabla, índices y políticas RLS `select`/`insert` para `anon`.

**Problemas detectados**
- El `throw` en el import de `supabaseClient.ts` impedía arrancar la app sin `.env`: el fallo era de arranque, no de uso.
- El bundle de producción sin `.env` elimina `supabase-js` por tree-shaking (dead code por `isMockMode === true`), lo que es correcto para demo pero exige reconstruir con credenciales antes de desplegar.

**Cambio de código**: se añadió `getSupabase()`/`isMockMode`, `mockEmissions.ts`, `DemoBanner.tsx`, `supabase/schema.sql` y se actualizó `.env.example`; el hook, los tipos y los componentes de UI quedaron intactos gracias al punto de conmutación en el repositorio.

---

## Lecciones aprendidas sobre prompteo

1. **Pedir el "árbol de archivos" antes del código valió más que un prompt abierto**: fijó los límites (`types/`, `hooks/`, `lib/`, `components/`) y la separación UI/Supabase, y evitó que la implementación se dispersara. Un prompt como "haz un dashboard de emisiones" habría producido un `App.tsx` monolítico de 400 líneas.
2. **Los puntos de control entre fases son el mecanismo real de control de calidad**: cada fase da un chance de detectar de antemano lo que en la siguiente fase sería caro (el `scope` del error se detectó al final de la Fase 2 y se corrigió en la 3; el doble fetch de StrictMode, en la 2).
3. **Exigir "código completo y ejecutable, sin fragmentos" evita el modo de respuestas conippets**: obligó a decidir imports, tipos de props y manejo de errores, y reveló incompatibilidades con `strict`/`noUncheckedIndexedAccess` antes de la integración.
4. **Pedir la justificación de cada decisión (máx. N líneas) fuerza el razonamiento**: en la Fase 1 eso reveló que la capa repositorio no estaba en la especificación y que faltaba el tipo `Database` para Supabase v2; ninguno era evidente antes de justificarlos.
5. **Un requisito de "supuesto explícito en vez de pregunta" acelera sin perder rigor**: se assumiu el esquema de la tabla y el comportamiento del `numeric` sin bloquear el avance, dejando la decisión documentada y reversible.
6. **Pedir autocrítica al final de cada fase produce la hoja de ruta de la siguiente**: los 3 riesgos de la Fase 3 (Realtime, robustez de la fila optimista, tests/RLS) son la entrada natural de la Fase 4 o de un siguiente ciclo.
7. **La verificación ejecutable (`tsc --noEmit` + `build`) debe ser parte del prompt, no un extra**: es lo que convierte "el prompt pidió strict" en "el código realmente compila en strict".
---
Se pueden observar las imagenes del funcionamiento dentro de la carpeta imgs.