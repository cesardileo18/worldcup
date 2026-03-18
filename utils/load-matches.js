/**
 * Script para cargar partidos iniciales del Mundial 2026
 * Ejecutar con: node utils/load-matches.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Inicializar Firebase Admin
const serviceAccountPath = path.join(__dirname, '..', 'service-account.json');

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://copamundialtest2026-default-rtdb.firebaseio.com'
  });
} catch (error) {
  console.error('❌ Error: No se encontró service-account.json');
  console.log('\n📝 Para obtener este archivo:');
  console.log('1. Ve a Firebase Console');
  console.log('2. Configuración del proyecto (⚙️) → Cuentas de servicio');
  console.log('3. Clic en "Generar nueva clave privada"');
  console.log('4. Guarda el archivo como "service-account.json" en la raíz del proyecto');
  process.exit(1);
}

const db = admin.database();

// Partidos de ejemplo - Fase de Grupos
// Nota: Las fechas son aproximadas del Mundial 2026
const sampleMatches = {
  // Grupo A
  1: {
    game: 1,
    fifaId: "400235450",
    homeTeam: "MEX",
    awayTeam: "CAN",
    homeScore: -1,
    awayScore: -1,
    timestamp: 1749657600, // 11 Jun 2026, 11:00 AM
    group: "A",
    stage: "GROUP",
    stadium: "Estadio Azteca",
    city: "Ciudad de México"
  },
  2: {
    game: 2,
    fifaId: "400235451",
    homeTeam: "USA",
    awayTeam: "TBD1",
    homeScore: -1,
    awayScore: -1,
    timestamp: 1749672000, // 11 Jun 2026, 3:00 PM
    group: "A",
    stage: "GROUP",
    stadium: "SoFi Stadium",
    city: "Los Angeles"
  },
  
  // Grupo B
  3: {
    game: 3,
    fifaId: "400235452",
    homeTeam: "ARG",
    awayTeam: "TBD2",
    homeScore: -1,
    awayScore: -1,
    timestamp: 1749744000, // 12 Jun 2026, 11:00 AM
    group: "B",
    stage: "GROUP",
    stadium: "AT&T Stadium",
    city: "Dallas"
  },
  4: {
    game: 4,
    fifaId: "400235453",
    homeTeam: "ESP",
    awayTeam: "TBD3",
    homeScore: -1,
    awayScore: -1,
    timestamp: 1749758400, // 12 Jun 2026, 3:00 PM
    group: "B",
    stage: "GROUP",
    stadium: "MetLife Stadium",
    city: "Nueva York/Nueva Jersey"
  },

  // Grupo C
  5: {
    game: 5,
    fifaId: "400235454",
    homeTeam: "BRA",
    awayTeam: "TBD4",
    homeScore: -1,
    awayScore: -1,
    timestamp: 1749830400, // 13 Jun 2026, 11:00 AM
    group: "C",
    stage: "GROUP",
    stadium: "Rose Bowl",
    city: "Los Angeles"
  },
  6: {
    game: 6,
    fifaId: "400235455",
    homeTeam: "FRA",
    awayTeam: "TBD5",
    homeScore: -1,
    awayScore: -1,
    timestamp: 1749844800, // 13 Jun 2026, 3:00 PM
    group: "C",
    stage: "GROUP",
    stadium: "BMO Field",
    city: "Toronto"
  },

  // Grupo D
  7: {
    game: 7,
    fifaId: "400235456",
    homeTeam: "GER",
    awayTeam: "TBD6",
    homeScore: -1,
    awayScore: -1,
    timestamp: 1749916800, // 14 Jun 2026, 11:00 AM
    group: "D",
    stage: "GROUP",
    stadium: "Lincoln Financial Field",
    city: "Philadelphia"
  },
  8: {
    game: 8,
    fifaId: "400235457",
    homeTeam: "ENG",
    awayTeam: "TBD7",
    homeScore: -1,
    awayScore: -1,
    timestamp: 1749931200, // 14 Jun 2026, 3:00 PM
    group: "D",
    stage: "GROUP",
    stadium: "Levi's Stadium",
    city: "San Francisco"
  }
};

async function loadMatches() {
  try {
    console.log('🏆 Cargando partidos del Mundial 2026...\n');
    
    const matchesRef = db.ref('matches');
    await matchesRef.set(sampleMatches);
    
    console.log('✅ Partidos cargados exitosamente!');
    console.log(`📊 Total de partidos: ${Object.keys(sampleMatches).length}`);
    console.log('\n🎮 Ahora puedes:');
    console.log('1. Iniciar la app: cd web && npm run dev');
    console.log('2. Hacer login con Google');
    console.log('3. Empezar a hacer predicciones');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al cargar partidos:', error);
    process.exit(1);
  }
}

loadMatches();
