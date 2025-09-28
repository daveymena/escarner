# 📄 Mi Escáner PDF

Una aplicación móvil y web **profesional** para escanear documentos usando la cámara y generar archivos PDF, construida con Next.js y Capacitor.

## ✨ Características Profesionales

### 🆕 **Tecnologías Profesionales Implementadas:**

#### 🤖 **Inteligencia Artificial y Visión por Computadora:**
- 🔍 **Detección automática de documentos** usando algoritmos de visión por computadora
- 📐 **Corrección automática de perspectiva** para documentos torcidos
- ✂️ **Recorte automático inteligente** que elimina fondos innecesarios
- 🌟 **Mejora automática de imagen** (brillo, contraste, nitidez, balance de color)
- 📊 **Detección de calidad en tiempo real** con indicador visual
- 🎯 **Algoritmos de borde** usando filtro de Sobel para detección precisa

#### 📚 **Modo de Escaneo Profesional:**
- ⚡ **Escaneo por lotes** con captura automática configurable
- 📷 **Captura manual adicional** durante modo batch
- ⏱️ **Intervalos configurables** (1-10 segundos)
- 🔄 **Procesamiento automático** de múltiples documentos
- 📈 **Indicadores visuales** de progreso y calidad

#### 🎨 **Características Avanzadas:**
- 🌙 **Modo oscuro/claro automático** con persistencia
- 🖼️ **Procesamiento avanzado** con 6 filtros profesionales
- 💾 **Compresión inteligente** (80% reducción sin pérdida visible)
- 📤 **Sistema de compartir completo** (WhatsApp, email, sistema, nube)
- 🔧 **Editor integrado** con vista previa en tiempo real

### ✅ **Características Originales:**
- 📷 **Escáner de documentos**: Toma fotos de alta calidad (90%) con la cámara del dispositivo
- 💾 **Almacenamiento local**: Guarda imágenes con nombres únicos usando timestamp
- 🖼️ **Galería interactiva**: Visualiza todas las imágenes escaneadas en una galería responsive
- 📄 **Generador de PDF**: Combina múltiples imágenes en un solo archivo PDF
- 📱 **Multiplataforma**: Funciona como aplicación web y como app móvil (Android/iOS)
- 🎨 **Diseño moderno**: Interfaz responsive con Tailwind CSS

## 🚀 Tecnologías Utilizadas

- **Next.js 14** - Framework React para aplicaciones web
- **Capacitor** - Plataforma para aplicaciones móviles híbridas
- **React Hooks** - Manejo de estado moderno
- **Tailwind CSS** - Framework CSS utilitario
- **jsPDF** - Generación de archivos PDF
- **@capacitor/camera** - Acceso a la cámara del dispositivo
- **@capacitor/filesystem** - Manejo del sistema de archivos
- **@capacitor/share** - Funcionalidades de compartir nativas
- **HTML5 Canvas** - Procesamiento avanzado de imágenes

## 🌟 Características Profesionales Implementadas

### 1. 🎨 **Modo Oscuro/Claro**
- **Tema automático** basado en preferencias del sistema
- **Toggle manual** para cambiar entre temas
- **Transiciones suaves** entre modos
- **Persistencia** del tema seleccionado

### 2. 🖼️ **Procesamiento Avanzado de Imágenes**
- **Filtros profesionales**: B/N, contraste, brillo, nitidez, suavizado
- **Editor integrado** con vista previa en tiempo real
- **Compresión inteligente** (80% calidad) para optimizar almacenamiento
- **Canvas HTML5** para procesamiento eficiente

### 3. 📤 **Sistema de Compartir Completo**
- **Compartir nativo** usando Capacitor Share API
- **Múltiples opciones**: WhatsApp, email, sistema, Google Drive
- **Modal interactivo** con opciones visuales
- **Fallbacks inteligentes** para diferentes plataformas

### 4. ⚡ **Optimizaciones de Rendimiento**
- **Carga diferida** de imágenes
- **Compresión automática** de archivos
- **Procesamiento en segundo plano**
- **Uso eficiente de memoria**

## 🛠️ Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Para desarrollo móvil: Android Studio (Android) o Xcode (iOS)

### 1. Clonar e instalar dependencias

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd mi-escaner-pdf

# Instalar dependencias
npm install
```

### 2. Configuración de Capacitor

El proyecto ya viene configurado con Capacitor. Los plugins necesarios están incluidos:

- `@capacitor/camera` - Para acceso a la cámara
- `@capacitor/filesystem` - Para guardado de archivos

## 💻 Desarrollo Web

### Ejecutar en modo desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en: `http://localhost:3000`

### Construir para producción

```bash
# Construir la aplicación
npm run build

# Iniciar en modo producción
npm start
```

## 📱 Desarrollo Móvil

### 1. Agregar plataformas móviles

```bash
# Para Android
npx cap add android

# Para iOS (macOS requerido)
npx cap add ios
```

### 2. Construir la aplicación web

```bash
# Construir la aplicación para producción
npm run build

# Copiar archivos web a las plataformas móviles
npx cap sync
```

### 3. Abrir en IDE móvil

```bash
# Para Android
npx cap open android

# Para iOS
npx cap open ios
```

### 4. Ejecutar en dispositivo/emulador

**Android:**
- En Android Studio: Ejecutar en dispositivo o emulador
- O usar: `npx cap run android`

**iOS:**
- En Xcode: Ejecutar en dispositivo o simulador
- O usar: `npx cap run ios`

## 📂 Estructura del Proyecto

```
mi-escaner-pdf/
├── src/
│   ├── app/
│   │   ├── page.js              # Página principal
│   │   ├── layout.js            # Layout de la aplicación
│   │   └── globals.css          # Estilos globales
│   └── components/
│       ├── ScannerButton.jsx    # Botón para escanear documentos
│       ├── ImageGallery.jsx     # Galería de imágenes escaneadas
│       └── PDFGenerator.jsx     # Generador de archivos PDF
├── capacitor.config.ts          # Configuración de Capacitor
├── package.json                 # Dependencias del proyecto
└── README.md                    # Este archivo
```

## 🎯 Uso de la Aplicación

### Flujo de uso típico:

1. **Abrir la aplicación** → Verás el título "📄 Mi Escáner PDF"
2. **Escanear documentos** → Presiona "📷 Escanear Documento"
3. **Capturar imagen** → Se abrirá la cámara para tomar la foto
4. **Vista previa** → La imagen aparecerá en la galería
5. **Escanear más** → Repite el proceso para múltiples documentos
6. **Generar PDF** → Presiona "📄 Generar PDF" para crear el archivo
7. **Confirmación** → Recibirás un mensaje de éxito

### Características de la interfaz:

- **Botón verde** para escanear documentos
- **Galería responsive** que se adapta al tamaño de pantalla
- **Modal** para ver imágenes en grande
- **Botón azul** para generar PDF
- **Mensajes informativos** para guiar al usuario

## 🔧 Configuración de Capacitor

El archivo `capacitor.config.ts` está configurado con:

```typescript
{
  appId: 'com.miapp.escaner',
  appName: 'Mi Escáner PDF',
  webDir: 'out',
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    },
    Filesystem: {
      permissions: ['read', 'write']
    }
  }
}
```

## 🚨 Solución de Problemas

### ⚠️ **Problema Principal: "Error accediendo a la verificacion" en Móvil**

**Solución Paso a Paso:**

1. **Reconstruir la aplicación:**
```bash
npx cap clean
npx cap sync
npx cap open android
```

2. **En Android Studio:**
- `File > Sync Project with Gradle Files`
- `Build > Clean Project`
- `Build > Rebuild Project`
- Ejecutar en dispositivo

3. **En configuración del dispositivo:**
- Configuración > Aplicaciones > Mi Escáner PDF
- Permisos > Cámara: **Permitir**
- Permisos > Almacenamiento: **Permitir**
- Permisos > Archivos y medios: **Permitir todo**

4. **Si persiste el error:**
```bash
# Desinstalar completamente y reinstalar
npx cap clean
rm -rf android/
npx cap add android
npx cap sync
npx cap open android
```

### 🔧 **Permisos Configurados:**

**Android (AndroidManifest.xml):**
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
```

### 📱 **Problemas comunes en móvil:**

**1. Error de permisos de cámara:**
- Desinstala y reinstala la app para resetear permisos
- En Android 13+: Otorga permisos de "Fotos y videos"
- Verifica que la cámara no esté siendo usada por otra app

**2. Error al guardar archivos:**
- Libera espacio en el dispositivo
- Verifica permisos de almacenamiento
- Reinicia el dispositivo

**3. Error al generar PDF:**
- Asegúrate de tener suficiente espacio
- Verifica que las imágenes no estén corruptas
- Reinicia la aplicación

**4. Cámara no disponible:**
- Reinicia el dispositivo
- Verifica en modo seguro
- Cierra otras aplicaciones que usen cámara

### 🌐 **Problemas en Web:**

**1. Permisos de navegador:**
- Usa HTTPS o localhost
- Permite cámara cuando el navegador lo solicite
- En Chrome: Haz clic en el ícono de cámara en la barra de direcciones

**2. Cámara no detectada:**
- Usa una versión reciente del navegador
- Verifica que la cámara no esté siendo usada por otra aplicación
- Prueba en modo incógnito

## 📝 Personalización

### Modificar estilos:
- Edita los estilos en `src/app/globals.css`
- Los componentes usan clases de Tailwind CSS

### Agregar funcionalidades:
- Modifica los componentes en `src/components/`
- Agrega nuevas rutas en `src/app/`

### Cambiar configuración:
- Edita `capacitor.config.ts` para modificar configuración móvil
- Modifica `next.config.mjs` para configuración de Next.js

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/) - Framework React
- [Capacitor](https://capacitorjs.com/) - Plataforma móvil
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [jsPDF](https://jspdf.kitchen/) - Generación de PDF

---

**¡Disfruta escaneando documentos con tu nueva aplicación! 📱✨**
