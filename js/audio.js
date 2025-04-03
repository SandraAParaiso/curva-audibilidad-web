/**
 * Sistema de Audio para la Curva de Audibilidad Humana
 * Esta implementación utiliza la Web Audio API para generar tonos puros
 * con posibilidad de control de amplitud y selección de canal (oído)
 */

// Asegurar compatibilidad con navegadores
window.AudioContext = window.AudioContext || window.webkitAudioContext;

// Objeto principal para gestión de audio
const AudioSystem = {
    // Propiedades
    context: null,
    oscillator: null,
    gainNode: null,
    panNode: null,
    isInitialized: false,
    
    // Método de inicialización
    init: function() {
        try {
            if (this.isInitialized) return true;
            
            // Crear contexto de audio
            this.context = new AudioContext();
            this.isInitialized = true;
            
            // Mostrar mensaje en consola
            console.log("Sistema de audio inicializado correctamente.");
            console.log("Frecuencia de muestreo:", this.context.sampleRate, "Hz");
            
            // Auto-reanudar contexto de audio para navegadores que lo requieran
            this.setupAutoResume();
            
            return true;
        } catch (error) {
            console.error("Error inicializando el sistema de audio:", error);
            return false;
        }
    },
    
    // Método para configurar auto-reactivación del contexto
    setupAutoResume: function() {
        // En algunos navegadores, el contexto de audio se suspende hasta que el usuario interactúa
        const resumeAudio = () => {
            if (this.context && this.context.state === 'suspended') {
                this.context.resume().then(() => {
                    console.log("Contexto de audio reactivado");
                });
            }
        };
        
        // Eventos que pueden desbloquear el audio
        const events = ['click', 'touchstart', 'keydown'];
        events.forEach(event => {
            document.addEventListener(event, resumeAudio, { once: true });
        });
    },
    
    // Método para generar y reproducir un tono
    playTone: function(frequency, amplitude, ear = 'both', duration = 0.5) {
        try {
            // Validar parámetros
            frequency = parseFloat(frequency);
            amplitude = parseFloat(amplitude);
            
            if (isNaN(frequency) || frequency <= 0) {
                throw new Error("Frecuencia inválida");
            }
            
            // Limitar amplitud por seguridad (como en la versión original)
            amplitude = Math.min(amplitude, 0.75);
            
            // Detener reproducción previa si existe
            this.stopTone();
            
            // Si el contexto está suspendido, intentar reactivarlo
            if (this.context.state === 'suspended') {
                this.context.resume();
            }
            
            // Crear oscilador
            this.oscillator = this.context.createOscillator();
            this.oscillator.type = 'sine'; // Onda sinusoidal (tono puro)
            this.oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
            
            // Crear nodo de ganancia para controlar amplitud
            this.gainNode = this.context.createGain();
            
            // Aplicar fade-in y fade-out para evitar clics
            const fadeDuration = 0.05; // 50ms
            this.gainNode.gain.setValueAtTime(0, this.context.currentTime);
            this.gainNode.gain.linearRampToValueAtTime(
                amplitude, 
                this.context.currentTime + fadeDuration
            );
            
            // Mantener amplitud constante durante la duración principal
            const sustainTime = this.context.currentTime + duration - fadeDuration;
            this.gainNode.gain.setValueAtTime(amplitude, sustainTime);
            
            // Fade-out al final
            this.gainNode.gain.linearRampToValueAtTime(
                0, 
                this.context.currentTime + duration
            );
            
            // Configurar canal estéreo según parámetro
            if (ear !== 'both') {
                try {
                    this.panNode = this.context.createStereoPanner();
                    this.panNode.pan.value = (ear === 'left') ? -1 : 1;
                    
                    // Conectar nodos: oscilador -> ganancia -> paneo -> salida
                    this.oscillator.connect(this.gainNode);
                    this.gainNode.connect(this.panNode);
                    this.panNode.connect(this.context.destination);
                } catch (error) {
                    // Fallback para navegadores que no soportan StereoPannerNode
                    console.log("StereoPannerNode no soportado, usando conexión estándar");
                    this.oscillator.connect(this.gainNode);
                    this.gainNode.connect(this.context.destination);
                }
            } else {
                // Conexión simple para ambos oídos
                this.oscillator.connect(this.gainNode);
                this.gainNode.connect(this.context.destination);
            }
            
            // Iniciar oscilador
            this.oscillator.start();
            
            // Programar parada automática
            setTimeout(() => {
                this.stopTone();
            }, duration * 1000);
            
            return true;
        } catch (error) {
            console.error("Error generando tono:", error);
            return false;
        }
    },
    
    // Método para detener reproducción
    stopTone: function() {
        try {
            if (this.oscillator) {
                this.oscillator.stop();
                this.oscillator.disconnect();
                this.oscillator = null;
            }
            
            if (this.gainNode) {
                this.gainNode.disconnect();
                this.gainNode = null;
            }
            
            if (this.panNode) {
                this.panNode.disconnect();
                this.panNode = null;
            }
            
            return true;
        } catch (error) {
            console.error("Error deteniendo tono:", error);
            return false;
        }
    },
    
    // Método para generar parámetros de tono desde valor de slider
    generateToneParams: function(frequency, sliderValue, knobValue = 0) {
        // Convertir valor del deslizador a dB (igual que en la versión original)
        const volumeDb = sliderValue - 100;
        
        // Aplicar corrección de calibración
        const correctedDb = volumeDb - knobValue;
        
        // Limitar volumen máximo para seguridad
        const limitedDb = Math.min(correctedDb, -10);
        
        // Calcular amplitud (convertir dB a amplitud lineal)
        // A = 10^(dB/20), limitado a 0.75 como en la versión original
        const amplitude = Math.min(Math.pow(10, limitedDb / 20) * 0.75, 0.75);
        
        return {
            frequency: frequency,
            sliderValue: sliderValue,
            volumeDb: volumeDb,
            correctedDb: correctedDb,
            limitedDb: limitedDb,
            amplitude: amplitude
        };
    }
};

// Inicializar sistema de audio cuando se cargue la página
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar el audio
    AudioSystem.init();
    console.log("Sistema de audio listo para usar");
});
