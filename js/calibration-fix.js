/**
 * Script para mejorar la calibración de audio
 * Añadir justo antes del cierre del body </body>
 */
document.addEventListener('DOMContentLoaded', function() {
    // Verificar que los elementos existan
    const testCalibrationBtn = document.getElementById('test-calibration-btn');
    const knobSlider = document.getElementById('knob-slider');
    const statusBar = document.getElementById('status-bar');
    
    if (!testCalibrationBtn || !knobSlider || !statusBar) {
        console.error("No se encontraron los elementos necesarios para la calibración");
        return;
    }
    
    // Función mejorada para reproducir tono de calibración
    function playCalibrationTone() {
        try {
            // Asegurar que el AudioSystem esté inicializado
            if (!window.AudioSystem || !window.AudioSystem.isInitialized) {
                if (window.AudioSystem && typeof AudioSystem.init === 'function') {
                    AudioSystem.init();
                } else {
                    throw new Error("Sistema de audio no disponible o no inicializado");
                }
            }
            
            // Obtener valor del knob
            const knobValue = parseInt(knobSlider.value);
            
            // Frecuencia fija para calibración (2000 Hz)
            const frequency = 2000;
            
            // Mostrar información en la consola para depuración
            console.log("Intentando reproducir tono de calibración:");
            console.log("Frecuencia:", frequency);
            console.log("Valor del knob:", knobValue);
            
            if (window.AudioSystem.context && window.AudioSystem.context.state !== 'running') {
                console.log("Intentando reactivar contexto de audio suspendido...");
                window.AudioSystem.context.resume();
            }
            
            // Método alternativo de reproducción - más básico para máxima compatibilidad
            try {
                // Crear un contexto temporal solo para esta prueba
                const testContext = new AudioContext();
                const osc = testContext.createOscillator();
                const gain = testContext.createGain();
                
                // Calcular amplitud de manera similar a la función original
                let amplitude = Math.pow(10, ((knobValue - 100) - knobValue) / 20) * 0.75;
                amplitude = Math.min(amplitude, 0.75); // Limitar para seguridad
                
                // Configurar oscilador
                osc.type = 'sine';
                osc.frequency.value = frequency;
                
                // Configurar ganancia con fade-in/fade-out
                gain.gain.setValueAtTime(0, testContext.currentTime);
                gain.gain.linearRampToValueAtTime(amplitude, testContext.currentTime + 0.05);
                gain.gain.setValueAtTime(amplitude, testContext.currentTime + 0.95);
                gain.gain.linearRampToValueAtTime(0, testContext.currentTime + 1);
                
                // Conectar y reproducir
                osc.connect(gain);
                gain.connect(testContext.destination);
                osc.start();
                osc.stop(testContext.currentTime + 1);
                
                // Limpiar recursos después de reproducir
                setTimeout(() => {
                    testContext.close();
                }, 1100);
                
                // Informar al usuario
                statusBar.textContent = `Reproduciendo tono de calibración a ${frequency} Hz con valor de knob ${knobValue}`;
                console.log("Reproduciendo tono de calibración (método alternativo)");
                
                return true;
            } catch (innerError) {
                console.error("Error en método alternativo:", innerError);
                
                // Si falla el método alternativo, intentar con el método original
                return window.AudioSystem.playTone(frequency, knobValue);
            }
        } catch (error) {
            console.error("Error reproduciendo tono de calibración:", error);
            statusBar.textContent = `Error: ${error.message}. Intenta recargar la página.`;
            return false;
        }
    }
    
    // Reemplazar el manejador de eventos del botón de calibración
    testCalibrationBtn.addEventListener('click', function(e) {
        // Prevenir comportamiento predeterminado (por si acaso)
        e.preventDefault();
        
        // Intentar reproducir tono usando nuestra función mejorada
        const result = playCalibrationTone();
        
        // Cambiar estilo del botón para dar feedback visual
        if (result) {
            testCalibrationBtn.style.backgroundColor = '#4CAF50';
            setTimeout(() => {
                testCalibrationBtn.style.backgroundColor = '';
            }, 1000);
        } else {
            testCalibrationBtn.style.backgroundColor = '#f44336';
            setTimeout(() => {
                testCalibrationBtn.style.backgroundColor = '';
            }, 1000);
        }
    });
    
    // Añadir mensaje informativo
    console.log("Script de mejora de calibración cargado correctamente");
});
