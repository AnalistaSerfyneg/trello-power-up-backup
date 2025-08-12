# Trello Power-Up - Importador de JSON

Este Power-Up permite a los usuarios de Trello importar tableros completos desde archivos JSON exportados de Trello.

## 🚀 Características

- ✅ Importación completa de tableros desde JSON
- ✅ Recreación automática de listas y tarjetas
- ✅ Interfaz intuitiva con drag & drop
- ✅ Manejo de errores robusto
- ✅ Compatible con Power-Ups de Trello

## 📋 Requisitos Previos

1. **Cuenta de Trello**: Necesitas una cuenta activa de Trello
2. **API Key y Token**: Obtén tus credenciales en [https://trello.com/app-key](https://trello.com/app-key)

## ⚙️ Configuración

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno
Edita el archivo `.env` y añade tus credenciales de Trello:

```env
API_KEY=tu_api_key_de_trello
API_TOKEN=tu_token_de_trello
PORT=3000
```

#### Cómo Obtener las Credenciales:
1. Ve a [https://trello.com/app-key](https://trello.com/app-key)
2. Copia tu **API Key**
3. Haz clic en "Token" para generar tu **API Token**
4. Autoriza la aplicación y copia el token generado

### 3. Iniciar el Servidor
```bash
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## 📱 Uso como Power-Up

### Configurar el Power-Up en Trello:
1. Abre un tablero en Trello
2. Ve a "Mostrar menú" → "Power-Ups"
3. Clic en "Desarrollar un Power-Up personalizado"
4. Usa la URL de tu aplicación: `http://localhost:3000`
5. El Power-Up aparecerá como botón en tu tablero

### Importar un Tablero:
1. Exporta un tablero desde Trello (Menú → Más → Imprimir y exportar → Exportar JSON)
2. Abre el Power-Up en tu tablero de Trello
3. Arrastra el archivo JSON o selecciónalo
4. Haz clic en "Importar Tablero"
5. ¡Tu tablero será recreado automáticamente!

## 🛠️ Estructura del Proyecto

```
├── server.js              # Servidor Express principal
├── package.json           # Dependencias y configuración
├── .env                   # Variables de entorno (credenciales)
├── README.md              # Documentación
├── public/                # Archivos estáticos
│   ├── index.html         # Interfaz de usuario
│   └── client.js          # Lógica del cliente
└── uploads/               # Carpeta temporal para archivos
```

## 🔧 Funcionalidades Técnicas

### Servidor (Express.js)
- **Ruta `/`**: Sirve la interfaz principal
- **Ruta `/import-json`**: Procesa archivos JSON y crea tableros
- **Multer**: Manejo seguro de archivos subidos
- **node-trello**: Integración con la API de Trello

### Cliente (JavaScript)
- **Drag & Drop**: Interfaz intuitiva para subir archivos
- **Validación**: Verificación de archivos JSON
- **Feedback**: Mensajes de estado en tiempo real
- **Power-Up Integration**: Compatible con Trello Power-Ups

### Seguridad
- ✅ Validación de tipos de archivo
- ✅ Límites de tamaño de archivo (50MB)
- ✅ Limpieza automática de archivos temporales
- ✅ Variables de entorno para credenciales sensibles

## 🐛 Solución de Problemas

### Error: "Credenciales no configuradas"
- Verifica que `API_KEY` y `API_TOKEN` estén en el archivo `.env`
- Asegúrate de que las credenciales sean válidas

### Error: "Solo se permiten archivos JSON"
- Verifica que el archivo tenga extensión `.json`
- Asegúrate de que el archivo sea un export válido de Trello

### Power-Up no aparece en Trello
- Verifica que el servidor esté ejecutándose
- Confirma que la URL del Power-Up sea correcta
- Revisa la consola del navegador para errores

## 📄 Licencia

MIT License - Libre para uso personal y comercial.