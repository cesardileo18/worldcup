# ✅ CHECKLIST DE CONFIGURACIÓN
# Mundial 2026 Pool

## 🔐 SEGURIDAD Y CONFIGURACIÓN INICIAL
- [x] ✅ Análisis de seguridad completado - No hay código malicioso
- [x] ✅ Credenciales de Firebase configuradas (propias)
- [x] ✅ Google Authentication habilitado

## 🔥 FIREBASE CONSOLE

### Realtime Database
- [ ] Crear Realtime Database
  - Ir a: https://console.firebase.google.com/project/copamundialtest2026/database
  - Clic en "Crear base de datos"
  - Ubicación: United States (us-central1)
  - Modo: Bloqueado

### Storage
- [ ] Crear Firebase Storage
  - Ir a: https://console.firebase.google.com/project/copamundialtest2026/storage
  - Clic en "Comenzar"
  - Ubicación: United States (us-central1)

### Service Account
- [ ] Descargar Service Account Key
  - Ir a: https://console.firebase.google.com/project/copamundialtest2026/settings/serviceaccounts/adminsdk
  - Clic en "Generar nueva clave privada"
  - Guardar como: `service-account.json` en la raíz del proyecto

## 📦 INSTALACIÓN LOCAL

### Dependencias
```bash
cd C:\Users\Usuario\Documents\Project\worldcup
```

- [ ] Instalar dependencias raíz
  ```bash
  npm install
  ```

- [ ] Instalar dependencias del frontend
  ```bash
  cd web
  npm install
  cd ..
  ```

- [ ] Instalar dependencias de Cloud Functions
  ```bash
  cd functions
  npm install
  cd ..
  ```

- [ ] Instalar dependencias de utilidades
  ```bash
  cd utils
  npm install
  cd ..
  ```

### Firebase CLI
- [ ] Instalar Firebase CLI
  ```bash
  npm install -g firebase-tools
  ```

- [ ] Login en Firebase
  ```bash
  firebase login
  ```

## 🚀 DESPLIEGUE Y CONFIGURACIÓN

### Reglas de Seguridad
- [ ] Desplegar reglas de Database y Storage
  ```bash
  firebase deploy --only database,storage
  ```

### Datos Iniciales
- [ ] Cargar partidos de ejemplo
  ```bash
  cd utils
  npm run load-matches
  ```

## 🧪 PRUEBA LOCAL

- [ ] Iniciar servidor de desarrollo
  ```bash
  cd web
  npm run dev
  ```

- [ ] Abrir en navegador: http://localhost:5173

- [ ] Hacer login con Google (serás el primer admin)

- [ ] Verificar que se ven los partidos

- [ ] Hacer una predicción de prueba

- [ ] Crear una liga de prueba

## 🌐 DESPLIEGUE A PRODUCCIÓN (Opcional)

- [ ] Compilar el frontend
  ```bash
  cd web
  npm run build
  cd ..
  ```

- [ ] Desplegar a Firebase Hosting
  ```bash
  firebase deploy --only hosting
  ```

- [ ] Desplegar Cloud Functions
  ```bash
  firebase deploy --only functions
  ```

- [ ] Acceder a la app en: https://copamundialtest2026.web.app

## 📝 NOTAS

### URLs Importantes:
- **Firebase Console:** https://console.firebase.google.com/project/copamundialtest2026
- **App Local:** http://localhost:5173
- **App Producción:** https://copamundialtest2026.web.app

### Archivos Importantes:
- `web/.env` - Credenciales de Firebase (NO subir a Git)
- `service-account.json` - Clave de servicio (NO subir a Git)
- `.firebaserc` - Configuración del proyecto
- `firebase.json` - Reglas de hosting

### Comandos Rápidos:
```bash
# Desarrollo
npm run dev              # (desde /web)

# Cargar datos
npm run load-matches     # (desde /utils)

# Desplegar
firebase deploy          # (desde raíz)
```

---

## 🎯 ESTADO ACTUAL

### ✅ Completado:
1. Análisis de seguridad
2. Credenciales configuradas
3. Google Auth habilitado

### ⏳ Pendiente:
1. Configurar Realtime Database
2. Configurar Storage
3. Instalar dependencias
4. Desplegar reglas
5. Cargar partidos
6. Probar localmente

---

**Último paso:** Marca cada checkbox con una "x" cuando completes cada tarea:
- [ ] → - [x]

¡Buena suerte! 🚀
