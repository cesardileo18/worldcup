# FIFA Prode 2026

Aplicación web de pronósticos para el Mundial de la FIFA 2026. Construida con React, TypeScript y Firebase.

### Jugar ahora

Accedé en vivo desde **[worldcup-2026.web.app](https://worldcup-2026.web.app/)**

> Estado: Beta pública activa.

---

## Funcionalidades

- Autenticación con Google (restringida a dominios autorizados)
- Pronósticos de partidos con puntaje en tiempo real
- Tabla de clasificación global y por liga privada
- Creación y unión a ligas privadas con link de invitación
- PWA instalable en mobile
- Sistema de puntos: marcador exacto (15 pts), resultado correcto (hasta 10 pts), resultado incorrecto (0 pts)
- Cierre de pronósticos: 10 minutos antes del inicio del partido
- Indicador de partido EN VIVO en el MatchCard
- Navegación adaptada por dispositivo: sidebar en desktop, bottom nav en mobile

---

## Control de acceso

Solo pueden iniciar sesión usuarios con correo de los siguientes dominios:

```
@dataiq.com
@dataiq.com.ar
@dataiq.com.cl
@dataiq.com.uy
@dataiq-latam.com
```

La validación ocurre en `web/src/firebase.ts` dentro de `signInWithDomainCheck()`. Si el correo no pertenece a un dominio autorizado, se cierra la sesión automáticamente y se muestra el mensaje: **"Tu cuenta no tiene acceso a esta aplicación."**

---

## Stack tecnológico

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4
- **Backend:** Firebase (Authentication, Realtime Database, Cloud Functions)
- **Hosting:** Firebase Hosting (PWA)
- **API de datos:** FIFA API v3 (api.fifa.com)

---

## Estructura del proyecto

```
worldcup-2026-pool/
├── web/                          # Aplicación React (frontend)
│   └── src/
│       ├── assets/               # Imágenes, banderas de países, logos
│       ├── components/
│       │   ├── ui/               # Componentes reutilizables (Button, Card, etc.)
│       │   └── features/         # Componentes de dominio (MatchCard, UserMenu, Sidebar, etc.)
│       ├── context/              # Proveedores de contexto (Auth, League, Match)
│       ├── hooks/                # Custom hooks (useAuth, useLeague, useMatches)
│       ├── routes/               # Páginas (Home, Leaderboard, JoinLeague, EditProfile, etc.)
│       ├── services/             # Servicios Firebase (matchService, predictionService, etc.)
│       └── utils/                # Funciones auxiliares
├── functions/                    # Firebase Cloud Functions (backend)
│   └── src/
│       └── index.ts              # Cálculo de puntos, actualización de scores, triggers
└── utils/                        # Scripts utilitarios
```

---

## Cómo funcionan los partidos

### Carga inicial

Al iniciar la app, `fetchMatches()` en `matchService.ts` verifica si el nodo `matches` existe en Firebase Realtime Database.

- Si **no existe**: hace una llamada a la FIFA API (`api.fifa.com/api/v3/calendar/matches`) con `count=500`, trae los 104 partidos del Mundial, los transforma y los guarda en Firebase.
- Si **ya existe**: devuelve los datos directamente desde Firebase sin volver a llamar a la API.

### Identificador de partidos (FIFA ID)

Cada partido usa como clave el `IdMatch` real de la FIFA API (ej: `400235501`), **no un número secuencial**. Esto garantiza sincronización directa con los resultados de la API sin búsquedas intermedias.

```
Firebase: matches/{fifaIdMatch} → { game, homeScore, awayScore, ... }
```

#### El problema anterior (IDs secuenciales)

Los partidos se guardaban con IDs generados por posición en el array de respuesta de la FIFA:

```ts
// ANTES — matchService.ts
results.forEach((item, index) => {
  const game = index + 1; // ← 1, 2, 3, 4... según el orden que devuelve FIFA
  matches[String(game)] = {
    game,
    fifaId: item.IdMatch, // ← el ID real de FIFA se guardaba pero NO se usaba como clave
  };
});
```

**El riesgo:** si la FIFA API devuelve los partidos en distinto orden (por filtros, paginación, caché, etc.), el partido `game: 1` podría ser un partido completamente diferente, **rompiendo todas las predicciones** ya guardadas con ese ID.

Además, la Cloud Function tenía que recorrer todos los partidos para encontrar el que coincidía con el `IdMatch` de la FIFA (búsqueda O(n)).

#### La solución (IDs FIFA como clave)

```ts
// AHORA — matchService.ts
results.forEach((item) => {
  const game = item.IdMatch; // ← "400235501", estable y único en la FIFA API
  matches[game] = {
    game,
    fifaId: item.IdMatch,
    // ...resto de campos
  };
});
```

La clave en Firebase **ES** el `IdMatch` de la FIFA. No importa el orden en que lleguen los partidos: el ID siempre identifica al mismo partido.

**Cloud Function — lookup O(1) directo:**

```ts
// ANTES: había que buscar el partido que tuviera fifaId === fifaMatch.IdMatch (O(n))

// AHORA — functions/index.ts
for (const fifaMatch of data.Results) {
  const match = matches[fifaMatch.IdMatch]; // lookup directo por clave
  if (match) {
    updates[`matches/${fifaMatch.IdMatch}/homeScore`] = homeScore;
    updates[`matches/${fifaMatch.IdMatch}/awayScore`] = awayScore;
  }
}
```

**Predicciones — misma clave:**

```
predictions/{userId}/{fifaMatchId} → { homePrediction, awayPrediction, points }
```

El trigger `updatePredictionPoints` recibe el `matchId` directamente del path de Firebase y accede a las predicciones sin ningún mapeo adicional.

### Actualización de scores (Cloud Function)

La función `updateMatchScores` corre cada 1 minuto (cron). Consulta la FIFA API para los partidos del día actual y actualiza en Firebase solo los scores que cambiaron. El frontend recibe los cambios en tiempo real mediante el listener `onValue` de Firebase.

### Diagrama de flujo

```
FIFA API (cada 1 min)
    ↓
updateMatchScores (Cloud Function)
    ↓
Firebase matches/{fifaId}/homeScore, awayScore
    ↓
updatePredictionPoints (trigger onValueWritten)
    ↓
Firebase predictions/{userId}/{matchId}/points
    ↓
updateUserScore (trigger onValueWritten)
    ↓
Firebase users/{userId}/score
    ↓
Frontend (listener en tiempo real) → re-render automático
```

---

## Cloud Functions

| Función | Trigger | Descripción |
|---|---|---|
| `updateMatchScores` | Cron cada 1 minuto | Consulta FIFA API y actualiza scores del día |
| `updatePredictionPoints` | `onValueWritten: matches/{matchId}` | Recalcula puntos de todos los usuarios para ese partido |
| `updateUserScore` | `onValueWritten: predictions/{userId}/{matchId}/points` | Actualiza el puntaje total del usuario con transacción |

### Sistema de puntos

- **15 pts** → Marcador exacto (ej: predijo 2-1, resultado 2-1)
- **Hasta 10 pts** → Ganador correcto: `10 - |diferencia de goles|` (mínimo 0)
- **0 pts** → Ganador incorrecto o sin pronóstico

---

## Componentes clave del frontend

### `MatchCard`
Renderiza cada partido. Maneja tres estados:
- **Sin jugar** (`homeScore = -1`): muestra `-` y permite cargar el pronóstico
- **En vivo** (`isLive`): muestra badge animado "EN VIVO"
- **Jugado** (`isPlayed`): muestra el score real y los puntos obtenidos con emoji (🥳/😄/😔)

El deadline de pronósticos es 10 minutos antes del `timestamp` del partido.

### `UserMenu`
Menú de usuario adaptado por dispositivo:
- **Desktop**: botón expandible con foto, puntos y posición. Al abrirse, el dropdown usa `createPortal` con posicionamiento `fixed` basado en `getBoundingClientRect()` para no afectar el layout del sidebar.
- **Mobile**: botón compacto en el navbar superior. El dropdown se despliega desde arriba como portal fijo.

Opciones del menú:
- Desktop: Mis pronósticos, Clasificación, Editar perfil, Cerrar sesión
- Mobile: Editar perfil, Reglas, Cerrar sesión

### `JoinLeague`
Página para unirse a una liga privada por link de invitación (`/join/:slug/:inviteCode`). Si el usuario no está autenticado, guarda el intent en `localStorage` bajo `pendingJoinLeague` y lo retoma automáticamente después del login con dominio verificado.

---

## Estructura de datos en Firebase

```
/matches
  /{fifaMatchId}
    game: string          # = fifaMatchId (ej: "400235501")
    fifaId: string        # id de la FIFA API
    homeScore: number     # -1 si no jugado
    awayScore: number     # -1 si no jugado
    home: string          # código de país (ej: "MEX")
    homeName: string      # nombre del equipo (ej: "Mexico")
    away: string
    awayName: string
    date: string          # ISO date string
    timestamp: number     # Unix timestamp (segundos)
    round: string         # etapa (ej: "Group Stage")
    group: string | null  # grupo (ej: "A") o null para eliminatorias
    location: string
    locationCity: string
    locationCountry: string

/predictions
  /{userId}
    /{matchId}
      homePrediction: number
      awayPrediction: number
      points: number
      updatedAt: number

/users
  /{userId}
    displayName: string
    userName: string
    email: string
    photoURL: string
    score: number

/leagues
  /{leagueId}
    name: string
    slug: string
    inviteCode: string
    members: { [userId]: true }
```

---

## Configuración del entorno

### Requisitos

- Node.js v18+
- Firebase CLI: `npm install -g firebase-tools`

### Instalación

```bash
# Clonar el repo
git clone <repo-url>
cd worldcup-2026-pool

# Instalar dependencias
npm install
cd web && npm install
cd ../functions && npm install
```

### Variables de entorno (web)

```bash
cd web
cp .env.example .env
```

Completar `web/.env` con los valores del proyecto Firebase:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

Los valores se encuentran en [Firebase Console](https://console.firebase.google.com/) → **Project Settings > General > Your apps**.

---

## Desarrollo

```bash
# Frontend
cd web
npm run dev       # servidor de desarrollo
npm run build     # build de producción
npm run lint      # linting

# Functions
cd functions
npm run build
firebase emulators:start
```

---

## Despliegue

```bash
# Todo
firebase deploy

# Solo frontend
firebase deploy --only hosting

# Solo functions (requerido al modificar index.ts)
cd functions && npm run build
firebase deploy --only functions
```

### Migrar la colección de partidos (al cambiar el ID)

Si se cambia el esquema de IDs en `matches`:

1. Compilar y deployar las functions: `cd functions && npm run build && firebase deploy --only functions`
2. Borrar el nodo `matches` en Firebase Console (Realtime Database)
3. Recargar la app → `fetchMatches()` detecta que no existe y repuebla automáticamente con los nuevos IDs desde la FIFA API

> Las predicciones usan el mismo ID de partido como clave. Si se migran los IDs hay que migrar también `/predictions`.

---

## Convenciones de código

- Indentación: 2 espacios
- Exports nombrados para todos los componentes y módulos
- Barrel files (`index.ts`) para imports limpios
- PascalCase para nombres de archivos de componentes y rutas
- TypeScript en modo strict

---

## Licencia

MIT — ver [LICENSE](LICENSE) para más detalles.
