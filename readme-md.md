# Curva de Audibilidad Humana

Esta aplicación web permite determinar la curva de audibilidad humana y el audiograma personal. Es una adaptación de una implementación originalmente desarrollada en MATLAB y posteriormente adaptada para Google Colab.

## 📋 Índice

- [Descripción](#descripción)
- [Funcionalidades](#funcionalidades)
- [Instrucciones de uso](#instrucciones-de-uso)
- [Implementación en GitHub Pages](#implementación-en-github-pages)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Notas de seguridad](#notas-de-seguridad)
- [Desarrollo técnico](#desarrollo-técnico)

## 📝 Descripción

La Curva de Audibilidad Humana es una representación gráfica que muestra la sensibilidad del oído humano a diferentes frecuencias de sonido. Esta aplicación permite determinar tu curva personal mediante pruebas de umbral auditivo en diferentes frecuencias.

El audiograma resultante es una herramienta diagnóstica que compara tu audición con los estándares ISO 1961 (Robinson and Dadson, 1956).

## ✨ Funcionalidades

- **Calibración personalizada** del volumen para adaptarse a diferentes dispositivos y entornos
- Pruebas separadas para **ambos oídos, oído izquierdo y oído derecho**
- Medición en **8 frecuencias** estándar: 125Hz, 250Hz, 500Hz, 1000Hz, 2000Hz, 4000Hz, 8000Hz y 12000Hz
- **Representación gráfica** automática de la curva de audibilidad y el audiograma
- **Guardado de datos** en formato CSV para análisis posterior
- **Interfaz intuitiva** con controles visuales y retroalimentación en tiempo real

## 🚀 Instrucciones de uso

1. **Calibración**:
   - Ajusta el deslizador de calibración hasta que puedas escuchar apenas el tono de referencia
   - Puedes usar el botón "Test de calibración" para reproducir un tono de 2000Hz al nivel actual
   - Una vez calibrado, haz clic en "¡Pulse para comenzar!"

2. **Medición**:
   - Para cada frecuencia, ajusta el deslizador vertical desde arriba hacia abajo
   - Detente justo en el punto donde ya no puedas escuchar el tono
   - Puedes usar el botón "Test" bajo cada frecuencia para verificar si aún escuchas el tono

3. **Selección de oído**:
   - Selecciona qué oído deseas evaluar (ambos, izquierdo, o derecho)
   - Puedes cambiar entre ellos en cualquier momento durante la prueba

4. **Visualización**:
   - Controla qué datos se muestran en los gráficos con las casillas de verificación
   - Puedes mostrar/ocultar datos de cada oído independientemente

5. **Guardado**:
   - Ingresa tus iniciales y edad
   - Haz clic en "Guardar datos" para descargar los resultados en formato CSV

## 📊 Implementación en GitHub Pages

Para implementar esta aplicación en GitHub Pages, sigue estos pasos:

1. **Crear un repositorio en GitHub**:
   - Crea un nuevo repositorio (por ejemplo, "curva-audibilidad")
   - Puedes hacerlo público o privado según tus preferencias

2. **Subir los archivos del proyecto**:
   - Clona el repositorio a tu máquina local
   - Copia todos los archivos y carpetas del proyecto al repositorio local
   - Realiza un commit y push de los cambios a GitHub

3. **Activar GitHub Pages**:
   - Ve a la configuración del repositorio (Settings)
   - Desplázate hacia abajo hasta la sección "GitHub Pages"
   - En "Source", selecciona la rama principal (main o master)
   - Selecciona la carpeta raíz (/)
   - Haz clic en "Save"

4. **Acceder a la aplicación**:
   - Después de unos minutos, la aplicación estará disponible en: 
   - `https://[tu-usuario-github].github.io/curva-audibilidad/`
   - GitHub te proporcionará la URL exacta en la sección de configuración

## 📁 Estructura del proyecto

```
/
├── index.html              # Página principal HTML
├── css/
│   └── styles.css          # Estilos CSS de la aplicación
├── js/
│   ├── app.js              # Lógica principal de la aplicación 
│   ├── audio.js            # Sistema de audio (Web Audio API)
│   └── charts.js           # Sistema de gráficos (Chart.js)
└── README.md               # Documentación del proyecto
```

## ⚠️ Notas de seguridad

- **Volumen limitado**: La aplicación limita automáticamente el volumen máximo para proteger tu audición
- **Uso de auriculares**: Se recomienda utilizar auriculares para obtener resultados más precisos
- **Ambiente silencioso**: Realiza la prueba en un entorno tranquilo para evitar interferencias
- **Discontinuar uso**: Si experimentas molestias auditivas, detén la prueba inmediatamente
- **No es un diagnóstico médico**: Esta aplicación no sustituye una evaluación audiométrica profesional

## 🔧 Desarrollo técnico

La aplicación está desarrollada utilizando tecnologías web estándar:

- **HTML5** para la estructura
- **CSS3** para los estilos
- **JavaScript** para la lógica de la aplicación
- **Web Audio API** para la generación y reproducción de tonos puros
- **Chart.js** para la visualización de datos

### Adaptación del código original

Esta versión web es una adaptación fiel del código original desarrollado para MATLAB y Google Colab. Se han mantenido:

- Los mismos parámetros de frecuencia (125Hz-12000Hz)
- Los umbrales de referencia ISO 1961
- La metodología de calibración y medición
- Los cálculos para el audiograma
- La representación gráfica logarítmica
- La limitación de seguridad para el volumen

### Compatibilidad

La aplicación es compatible con los principales navegadores modernos:
- Chrome (recomendado)
- Firefox
- Edge
- Safari

Para una experiencia óptima, se recomienda utilizar la última versión de Chrome o Firefox.