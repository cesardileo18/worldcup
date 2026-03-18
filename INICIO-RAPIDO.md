# 🚀 GUÍA RÁPIDA DE INICIO
# Mundial 2026 Pool - copamundialtest2026

## ✅ YA CONFIGURADO:
- ✅ Credenciales de Firebase (propias)
- ✅ Autenticación con Google habilitada

## 📝 PASOS PENDIENTES:

### 1️⃣ CONFIGURAR REALTIME DATABASE

Ve a: https://console.firebase.google.com/project/copamundialtest2026/database

1. Clic en **"Realtime Database"** en el menú izquierdo
2. Clic en **"Crear base de datos"**
3. Ubicación: **United States (us-central1)**
4. Reglas: **"Comenzar en modo bloqueado"**
5. Habilitar

### 2️⃣ CONFIGURAR STORAGE

Ve a: https://console.firebase.google.com/project/copamundialtest2026/storage

1. Clic en **"Storage"** en el menú izquierdo
2. Clic en **"Comenzar"**
3. Reglas: Predeterminadas
4. Ubicación: **United States (us-central1)**
5. Listo

### 3️⃣ INSTALAR DEPENDENCIAS

Abre tu terminal y ejecuta:

```bash
# Ir al proyecto
cd C:\Users\Usuario\Documents\Project\worldcup

# Instalar dependencias raíz
npm install

# Instalar dependencias del frontend
cd web
npm install

# Instalar dependencias de Cloud Functions
cd ..\functions
npm install

# Instalar dependencias de utils
cd ..\utils
npm install

# Volver a raíz
cd ..
```

### 4️⃣ INSTALAR FIREBASE CLI

```bash
npm install -g firebase-tools
firebase login
```

### 5️⃣ DESPLEGAR REGLAS DE SEGURIDAD

```bash
# Desde la raíz del proyecto
cd C:\Users\Usuario\Documents\Project\worldcup

# Desplegar reglas
firebase deploy --only database,storage
```

### 6️⃣ OBTENER SERVICE ACCOUNT (Para cargar datos)

1. Ve a: https://console.firebase.google.com/project/copamundialtest2026/settings/serviceaccounts/adminsdk
2. Pestaña **"Cuentas de servicio"**
3. Clic en **"Generar nueva clave privada"**
4. Descargar el archivo JSON
5. Guardarlo como **`service-account.json`** en la raíz del proyecto
   ```
   C:\Users\Usuario\Documents\Project\worldcup\service-account.json
   ```

⚠️ **IMPORTANTE:** Agrega `service-account.json` a `.gitignore` (ya está agregado)

### 7️⃣ CARGAR PARTIDOS DE EJEMPLO

```bash
cd utils
npm run load-matches
```

### 8️⃣ INICIAR LA APLICACIÓN

```bash
cd ..\web
npm run dev
```

Abre tu navegador en: **http://localhost:5173**

---

## 🎯 PRIMER USO

1. **Login:** Haz clic en "Sign in with Google"
2. **¡Serás Admin!** El primer usuario se vuelve administrador automáticamente
3. **Ver partidos:** Verás los 8 partidos de ejemplo
4. **Hacer predicciones:** Haz clic en un partido y predice el resultado
5. **Crear liga:** Ve a "Leagues" → "Create New League"

---

## 🛠️ COMANDOS ÚTILES

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo
npm run build            # Compilar para producción
npm run preview          # Vista previa de build

# Firebase
firebase deploy --only hosting     # Desplegar solo web
firebase deploy --only functions   # Desplegar solo funciones
firebase deploy                    # Desplegar todo

# Base de datos
cd utils
npm run load-matches              # Cargar partidos de ejemplo
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "Permission denied"
- Asegúrate de haber desplegado las reglas: `firebase deploy --only database,storage`

### No veo los partidos
- Verifica que ejecutaste: `cd utils && npm run load-matches`
- Revisa Firebase Console → Realtime Database → Debe haber datos en `/matches`

### No puedo hacer login
- Verifica que Google Auth esté habilitado en Firebase Console
- Borra cookies y caché del navegador

### Build falla
```bash
cd web
npm install
npm run build
```

---

## 📚 RECURSOS

- Firebase Console: https://console.firebase.google.com/project/copamundialtest2026
- Documentación: README.md
- Problemas: Crea un issue en el repo

---

## 🎮 ¡LISTO PARA EMPEZAR!

Sigue los pasos 1-8 en orden y tendrás tu app funcionando en ~15 minutos.

¡Buena suerte con tu quiniela del Mundial 2026! ⚽🏆
