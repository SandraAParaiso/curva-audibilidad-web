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
