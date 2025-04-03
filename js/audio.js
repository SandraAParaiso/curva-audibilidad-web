/**
 * Sistema de Audio Simplificado para la Curva de Audibilidad Humana
 * Enfocado en la calibración inicial
 */

// Objeto principal para gestión de audio
const AudioSystem = {
    // Propiedades
    context: null,
    isInitialized: false,
    currentSound: null,
    
    // Método de inicialización
    init: function() {
        try {
            // Crear contexto de audio si no existe
            if (!this.context) {
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                this.context = new AudioContext();
                console.log("Audio context creado:", this.context.state);
            }
            
            // Si el contexto está suspendido, intentar activarlo
            if (this.context.state === 'suspended') {
                this.context.resume();
            }
            
            this.isInitialized = true;
            return true;
        } catch (e) {
            console.error("Error inicializando audio:", e);
            return false;
        }
    },
    
    // Método simple para reproducir un tono de calibración
    playCalibrationTone: function(volume) {
        try {
            // Inicializar si es necesario
            if (!this.isInitialized) {
                this.init();
            }
            
            // Detener sonido anterior si existe
            this.stopTone();
            
            // Valor seguro para volumen entre 0-100
            const safeVolume = Math.max(0, Math.min(100, volume));
            
            // Convertir valor de 0-100 a amplitud (0-1)
            // Con más limitación en volúmenes altos para seguridad
            const amplitude = Math.min((safeVolume / 100) * 0.5, 0.5);
            
            // Crear oscilador para 1000 Hz (tono estándar de calibración)
            const osc = this.context.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = 1000; // 1kHz es un tono estándar para calibración
            
            // Nodo de ganancia para controlar volumen
            const gainNode = this.context.createGain();
            gainNode.gain.value = amplitude;
            
            // Conectar nodos
            osc.connect(gainNode);
            gainNode.connect(this.context.destination);
            
            // Guardar referencia
            this.currentSound = {
                osc: osc,
                gain: gainNode
            };
            
            // Iniciar oscilador
            osc.start();
            
            console.log(`Reproduciendo tono de calibración a ${volume}% (amplitud: ${amplitude})`);
            return true;
        } catch (e) {
            console.error("Error en playCalibrationTone:", e);
            return false;
        }
    },
    
    // Método para detener el tono
    stopTone: function() {
        if (this.currentSound) {
            try {
                if (this.currentSound.osc) {
                    this.currentSound.osc.stop();
                    this.currentSound.osc.disconnect();
                }
                if (this.currentSound.gain) {
                    this.currentSound.gain.disconnect();
                }
            } catch (e) {
                console.error("Error deteniendo sonido:", e);
            }
            this.currentSound = null;
        }
    },
    
    // Función simplificada para generar parámetros de tono
    generateToneParams: function(frequency, sliderValue, knobValue = 0) {
        return {
            frequency: frequency,
            amplitude: (sliderValue / 100) * 0.5,
            sliderValue: sliderValue
        };
    },
    
    // Reproductor de tono para frecuencias específicas
    playTone: function(frequency, amplitude, ear = 'both') {
        try {
            // Asegurar que estamos inicializados
            if (!this.isInitialized) {
                this.init();
            }
            
            // Detener sonido anterior
            this.stopTone();
            
            // Crear oscilador
            const osc = this.context.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = frequency;
            
            // Nodo de ganancia
            const gainNode = this.context.createGain();
            gainNode.gain.value = Math.min(amplitude, 0.5); // Limitar para seguridad
            
            // Conexión básica
            osc.connect(gainNode);
            gainNode.connect(this.context.destination);
            
            // Guardar referencia
            this.currentSound = {
                osc: osc,
                gain: gainNode
            };
            
            // Iniciar oscilador
            osc.start();
            
            return true;
        } catch (e) {
            console.error("Error en playTone:", e);
            return false;
        }
    }
};

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    console.log("Sistema de audio básico cargado");
});
