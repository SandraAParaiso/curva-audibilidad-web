/**
 * Script para corregir errores en app.js
 */
document.addEventListener('DOMContentLoaded', function() {
    // Sobreescribir la función playTone en APP para asegurar que maneja correctamente los parámetros
    if (window.APP && APP.playTone) {
        console.log("Sobrescribiendo APP.playTone para corregir errores");
        
        // Guardar referencia a la función original
        const originalPlayTone = APP.playTone;
        
        // Reemplazar con nuestra versión corregida
        APP.playTone = function(frequency, sliderValue) {
            try {
                // Generar parámetros del tono de manera segura
                const params = AudioSystem.generateToneParams(frequency, sliderValue, this.state.knobValue);
                
                // Verificar que todos los parámetros necesarios existan
                if (!params || typeof params.amplitude === 'undefined') {
                    throw new Error("Parámetros de tono inválidos");
                }
                
                // Determinar canal según el modo actual
                let ear = 'both';
                if (this.state.currentMode === 'left_ear') {
                    ear = 'left';
                } else if (this.state.currentMode === 'right_ear') {
                    ear = 'right';
                }
                
                // Reproducir tono con duración fija de 500ms
                const success = AudioSystem.playTone(params.frequency, params.amplitude, ear, 0.5);
                
                if (success) {
                    // Actualizar estado solo si la reproducción fue exitosa
                    if (params.limitedDb) {
                        this.setStatus(`Reproduciendo ${frequency} Hz a ${params.limitedDb.toFixed(1)} dB (amplitud: ${params.amplitude.toFixed(4)})`);
                    } else {
                        this.setStatus(`Reproduciendo ${frequency} Hz (amplitud: ${params.amplitude.toFixed(4)})`);
                    }
                }
                
                return success;
            } catch (error) {
                console.error("Error reproduciendo tono (versión corregida):", error);
                this.setStatus(`Error reproduciendo tono: ${error.message}`);
                return false;
            }
        };
    }
    
    // También sobrescribir el método onTestCalibrationClick para usar una duración fija
    if (window.APP && APP.onTestCalibrationClick) {
        console.log("Sobrescribiendo APP.onTestCalibrationClick");
        
        APP.onTestCalibrationClick = function() {
            // Reproducir tono de calibración (2000 Hz como en la versión original)
            try {
                // Usar directamente AudioSystem para evitar problemas con params
                const success = AudioSystem.playTone(2000, 0.2, 'both', 0.5);
                
                if (success) {
                    this.setStatus(`Reproduciendo tono de calibración a 2000 Hz`);
                }
            } catch (e) {
                console.error("Error en calibración:", e);
                this.setStatus(`Error en calibración: ${e.message}`);
            }
        };
    }
});

/**
 * Esta solución arregla el error "TypeError: params.limitedDb is undefined"
 * en la función onTestCalibrationClick
 * 


document.addEventListener('DOMContentLoaded', function() {
    // Verificar que APP y AudioSystem estén definidos
    if (typeof APP !== 'undefined' && typeof AudioSystem !== 'undefined') {
        console.log("Corrigiendo función onTestCalibrationClick para evitar error de limitedDb");
        
        // Sobrescribir completamente la función
        APP.onTestCalibrationClick = function() {
            try {
                // Detener cualquier tono anterior
                AudioSystem.stopTone();
                
                // Usar un valor seguro para la amplitud (0.2 es moderado)
                const amplitude = 0.2;
                
                // Reproducir directamente con AudioSystem sin usar params
                const success = AudioSystem.playTone(2000, amplitude, 'both', 0.5);
                
                if (success) {
                    // Actualizar estado con información segura (sin usar limitedDb)
                    this.setStatus(`Reproduciendo tono de calibración a 2000 Hz (amplitud: ${amplitude.toFixed(4)})`);
                } else {
                    this.setStatus(`Error reproduciendo tono de calibración`);
                }
            } catch (e) {
                console.error("Error en calibración:", e);
                this.setStatus(`Error en calibración: ${e.message}`);
            }
        };

        // También sobrescribir la función playTone para manejar el caso donde params.limitedDb es undefined
        const originalPlayTone = APP.playTone;
        APP.playTone = function(frequency, sliderValue) {
            try {
                // Generar parámetros del tono
                const params = AudioSystem.generateToneParams(frequency, sliderValue, this.state.knobValue);
                
                // Determinar canal según modo actual
                let ear = 'both';
                if (this.state.currentMode === 'left_ear') {
                    ear = 'left';
                } else if (this.state.currentMode === 'right_ear') {
                    ear = 'right';
                }
                
                // Reproducir tono (usar duration 0.5 para duración fija)
                AudioSystem.playTone(params.frequency, params.amplitude, ear, 0.5);
                
                // Actualizar estado de manera segura, comprobando si limitedDb existe
                if (params.limitedDb !== undefined) {
                    this.setStatus(`Reproduciendo ${frequency} Hz a ${params.limitedDb.toFixed(1)} dB (amplitud: ${params.amplitude.toFixed(4)})`);
                } else {
                    this.setStatus(`Reproduciendo ${frequency} Hz (amplitud: ${params.amplitude.toFixed(4)})`);
                }
                
                return true;
            } catch (error) {
                console.error("Error reproduciendo tono:", error);
                this.setStatus(`Error reproduciendo tono: ${error.message}`);
                return false;
            }
        };
    } else {
        console.error("No se pueden aplicar correcciones: APP o AudioSystem no están definidos");
    }
});

/**
 * Esta solución mejora la inicialización del AudioContext
 * para cumplir con las políticas de autoplay de los navegadores
 * 
 * Añade este código al final del archivo fix-app.js
 */

document.addEventListener('DOMContentLoaded', function() {
    // Comprobar que AudioSystem esté definido
    if (typeof AudioSystem !== 'undefined') {
        console.log("Mejorando manejo de políticas de autoplay para AudioContext");
        
        // Función mejorada para reanudar el contexto de audio
        function resumeAudioContext() {
            if (AudioSystem.context && AudioSystem.context.state === 'suspended') {
                AudioSystem.context.resume().then(() => {
                    console.log("AudioContext reanudado exitosamente");
                    // Actualizar el estado si APP está disponible
                    if (window.APP) {
                        APP.setStatus("Audio activado. Ya puede realizar la prueba de calibración.");
                    }
                }).catch(err => {
                    console.error("Error al reanudar AudioContext:", err);
                });
            }
        }
        
        // Mejorar el método onTestCalibrationClick para intentar reanudar el contexto primero
        if (window.APP) {
            const originalTestCalibration = APP.onTestCalibrationClick;
            APP.onTestCalibrationClick = function() {
                // Intentar reanudar el contexto primero
                if (AudioSystem.context && AudioSystem.context.state === 'suspended') {
                    AudioSystem.context.resume().then(() => {
                        console.log("AudioContext reanudado, ahora reproduciendo sonido");
                        originalTestCalibration.call(this);
                    }).catch(err => {
                        console.error("Error al reanudar AudioContext:", err);
                        this.setStatus("Error activando audio. Intente hacer clic en otro lugar de la página primero.");
                    });
                } else {
                    // Si ya está activo, proceder normalmente
                    originalTestCalibration.call(this);
                }
            };
            
            // También mejorar el método playTone
            const originalPlayTone = APP.playTone;
            APP.playTone = function(frequency, sliderValue) {
                // Intentar reanudar el contexto primero si está suspendido
                if (AudioSystem.context && AudioSystem.context.state === 'suspended') {
                    this.setStatus("Activando audio. Por favor espere...");
                    
                    AudioSystem.context.resume().then(() => {
                        console.log("AudioContext reanudado, ahora llamando a playTone original");
                        originalPlayTone.call(this, frequency, sliderValue);
                    }).catch(err => {
                        console.error("Error al reanudar AudioContext:", err);
                        this.setStatus("Error activando audio. Intente hacer clic en el botón 'Test de calibración' primero.");
                    });
                    
                    return true; // Devolvemos true para evitar mensajes de error
                } else {
                    // Si ya está activo, proceder normalmente
                    return originalPlayTone.call(this, frequency, sliderValue);
                }
            };
        }
        
        // Agregar listeners a más elementos interactivos específicos de la aplicación
        const interactiveElements = [
            'test-calibration-btn',
            'ready-btn',
            'knob-slider',
            'stop-sound-btn'
        ];
        
        interactiveElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                // Usar el evento click para intentar reanudar el contexto
                element.addEventListener('click', function(e) {
                    console.log(`Interacción detectada en ${id}, intentando reanudar AudioContext`);
                    resumeAudioContext();
                });
            }
        });
        
        // También agregar a todo el documento para cualquier interacción
        const userInteractionEvents = ['click', 'touchstart', 'keydown', 'mousedown'];
        userInteractionEvents.forEach(eventType => {
            document.addEventListener(eventType, function() {
                resumeAudioContext();
            }, { once: false }); // Permitir múltiples intentos
        });
        
        console.log("Mejoras para manejo de AudioContext instaladas");
    } else {
        console.error("No se puede mejorar AudioContext: AudioSystem no está definido");
    }
});
