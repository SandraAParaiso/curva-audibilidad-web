/**
 * Script para corregir errores en app.js y mejorar la experiencia de audio
 * 
 * Este script consolida todas las correcciones en una implementación coherente:
 * 1. Corrige el error de params.limitedDb undefined
 * 2. Maneja adecuadamente el AudioContext para cumplir con políticas de autoplay
 * 3. Asegura que los sonidos se detengan después de 500ms (0.5 segundos)
 */
document.addEventListener('DOMContentLoaded', function() {
    // Comprobar que los objetos necesarios estén definidos
    if (typeof window.APP === 'undefined' || typeof AudioSystem === 'undefined') {
        console.error("No se pueden aplicar correcciones: APP o AudioSystem no están definidos");
        return;
    }
    
    console.log("Aplicando correcciones y mejoras al sistema de audio");
    
    // PARTE 1: Guardar referencias a las funciones originales (solo una vez)
    const originalPlayTone = APP.playTone;
    const originalTestCalibrationClick = APP.onTestCalibrationClick;
    
    // PARTE 2: Función mejorada para reanudar el contexto de audio
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
    
    // PARTE 3: Sobrescribir función playTone con todas las mejoras
    APP.playTone = function(frequency, sliderValue) {
        try {
            // Intentar reanudar el contexto primero si está suspendido
            if (AudioSystem.context && AudioSystem.context.state === 'suspended') {
                this.setStatus("Activando audio. Por favor espere...");
                
                AudioSystem.context.resume().then(() => {
                    console.log("AudioContext reanudado, ahora procesando reproducción");
                    // Llamar a esta misma función una vez que el contexto esté activo
                    this.playTone(frequency, sliderValue);
                }).catch(err => {
                    console.error("Error al reanudar AudioContext:", err);
                    this.setStatus("Error activando audio. Intente hacer clic en el botón 'Test de calibración' primero.");
                });
                
                return true; // Devolvemos true para evitar mensajes de error
            }
            
            // Detener cualquier tono anterior para evitar superposiciones
            AudioSystem.stopTone();
            
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
                // Actualizar estado de manera segura, comprobando si limitedDb existe
                if (params.limitedDb !== undefined) {
                    this.setStatus(`Reproduciendo ${frequency} Hz a ${params.limitedDb.toFixed(1)} dB (amplitud: ${params.amplitude.toFixed(4)})`);
                } else {
                    this.setStatus(`Reproduciendo ${frequency} Hz (amplitud: ${params.amplitude.toFixed(4)})`);
                }
            }
            
            return success;
        } catch (error) {
            console.error("Error reproduciendo tono:", error);
            this.setStatus(`Error reproduciendo tono: ${error.message}`);
            return false;
        }
    };
    
    // PARTE 4: Sobrescribir onTestCalibrationClick con todas las mejoras
    APP.onTestCalibrationClick = function() {
        try {
            // Intentar reanudar el contexto primero
            if (AudioSystem.context && AudioSystem.context.state === 'suspended') {
                this.setStatus("Activando audio. Por favor espere...");
                
                AudioSystem.context.resume().then(() => {
                    console.log("AudioContext reanudado, ahora reproduciendo sonido de calibración");
                    // Continuar con la reproducción una vez que el contexto esté activo
                    this._playCalibrationTone();
                }).catch(err => {
                    console.error("Error al reanudar AudioContext:", err);
                    this.setStatus("Error activando audio. Intente hacer clic en otro lugar de la página primero.");
                });
                
                return; // Salir y esperar a que se reanude el contexto
            }
            
            // Si el contexto ya está activo, reproducir el tono directamente
            this._playCalibrationTone();
            
        } catch (e) {
            console.error("Error en calibración:", e);
            this.setStatus(`Error en calibración: ${e.message}`);
        }
    };
    
    // PARTE 5: Método auxiliar para reproducir tono de calibración
    // Esto evita duplicación de código en onTestCalibrationClick
    APP._playCalibrationTone = function() {
        try {
            // Detener cualquier tono anterior
            AudioSystem.stopTone();
            
            // Usar un valor seguro para la amplitud (0.2 es moderado)
            const amplitude = 0.2;
            
            // Reproducir directamente con AudioSystem sin usar params
            const success = AudioSystem.playTone(2000, amplitude, 'both', 0.5);
            
            if (success) {
                // Actualizar estado con información segura
                this.setStatus(`Reproduciendo tono de calibración a 2000 Hz (amplitud: ${amplitude.toFixed(4)})`);
            } else {
                this.setStatus(`Error reproduciendo tono de calibración`);
            }
        } catch (e) {
            console.error("Error en reproducción de calibración:", e);
            this.setStatus(`Error en calibración: ${e.message}`);
        }
    };
    
    // PARTE 6: Agregar listeners a elementos interactivos específicos
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
            element.addEventListener('click', function() {
                console.log(`Interacción detectada en ${id}, intentando reanudar AudioContext`);
                resumeAudioContext();
            });
        }
    });
    
    // PARTE 7: Agregar listeners a todo el documento para cualquier interacción
    const userInteractionEvents = ['click', 'touchstart', 'keydown', 'mousedown'];
    userInteractionEvents.forEach(eventType => {
        document.addEventListener(eventType, resumeAudioContext);
    });
    
    console.log("Correcciones y mejoras aplicadas correctamente al sistema de audio");
});
