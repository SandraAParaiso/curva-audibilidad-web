/**
 * Script de calibración simple para la Curva de Audibilidad
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log("Iniciando script de calibración simplificado");
    
    // Elementos clave
    const calibrationSection = document.getElementById('calibration-section');
    const knobSlider = document.getElementById('knob-slider');
    const knobValue = document.getElementById('knob-value');
    const testCalibrationBtn = document.getElementById('test-calibration-btn');
    const readyBtn = document.getElementById('ready-btn');
    const frequencySliders = document.querySelectorAll('.freq-slider');
    const frequencyTestBtns = document.querySelectorAll('.freq-test-btn');
    const statusBar = document.getElementById('status-bar');
    
    // Verificar que los elementos existan
    if (!calibrationSection || !knobSlider || !testCalibrationBtn || !readyBtn) {
        console.error("No se encontraron elementos esenciales para la calibración");
        return;
    }
    
    // Asegurar que el sistema de audio existe
    if (!window.AudioSystem) {
        console.error("AudioSystem no está disponible");
        statusBar.textContent = "Error: Sistema de audio no disponible. Recargue la página.";
        return;
    }
    
    // Inicializar audio al hacer clic en cualquier parte
    let audioInitialized = false;
    
    document.body.addEventListener('click', function() {
        if (!audioInitialized) {
            AudioSystem.init();
            audioInitialized = true;
            console.log("Audio inicializado con interacción del usuario");
        }
    }, { once: true });
    
    // Crear overlay de activación de audio
    const overlay = document.createElement('div');
    overlay.id = 'audio-activation-overlay';
    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:1000; display:flex; flex-direction:column; justify-content:center; align-items:center; color:white;';
    overlay.innerHTML = `
        <h2 style="margin-bottom:20px;">Activación de Audio</h2>
        <p style="margin-bottom:20px; text-align:center; max-width:80%;">Para utilizar esta aplicación, es necesario activar el audio primero.</p>
        <button id="activate-audio-btn" style="padding:15px 30px; background:#4CAF50; color:white; border:none; border-radius:5px; cursor:pointer; font-size:16px;">Activar Audio</button>
    `;
    
    document.body.appendChild(overlay);
    
    // Botón de activación de audio
    document.getElementById('activate-audio-btn').addEventListener('click', function() {
        // Inicializar audio
        AudioSystem.init();
        
        // Reproducir un tono silencioso para desbloquear audio en iOS/Safari
        try {
            const silentContext = new AudioContext();
            const silentOsc = silentContext.createOscillator();
            const silentGain = silentContext.createGain();
            silentGain.gain.value = 0.001; // Casi inaudible
            silentOsc.connect(silentGain);
            silentGain.connect(silentContext.destination);
            silentOsc.start();
            silentOsc.stop(silentContext.currentTime + 0.5);
            setTimeout(() => silentContext.close(), 1000);
        } catch (e) {
            console.log("Error desbloqueando audio:", e);
        }
        
        // Quitar overlay
        overlay.remove();
        
        // Indicar que estamos listos para calibrar
        statusBar.textContent = "Audio activado. Ahora ajuste el volumen y pruebe con el botón 'Test de calibración'";
    });
    
    // Reemplazar comportamiento del botón de calibración
    testCalibrationBtn.addEventListener('click', function() {
        const volume = parseInt(knobSlider.value);
        console.log("Probando calibración con volumen:", volume);
        
        // Usar método simplificado de calibración
        if (AudioSystem.playCalibrationTone(volume)) {
            statusBar.textContent = `Reproduciendo tono de calibración a volumen ${volume}%`;
            
            // Cambiar estilo del botón para feedback visual
            testCalibrationBtn.style.backgroundColor = '#4CAF50';
            setTimeout(() => {
                testCalibrationBtn.style.backgroundColor = '';
            }, 1000);
        } else {
            statusBar.textContent = "Error reproduciendo tono de calibración. Intente nuevamente.";
            
            // Feedback visual de error
            testCalibrationBtn.style.backgroundColor = '#f44336';
            setTimeout(() => {
                testCalibrationBtn.style.backgroundColor = '';
            }, 1000);
        }
    });
    
    // Manejar cambios en el knob
    knobSlider.addEventListener('input', function() {
        const value = this.value;
        knobValue.textContent = value;
    });
    
    // Manejar botón de "Listo para comenzar"
    readyBtn.addEventListener('click', function() {
        // Detener cualquier sonido actual
        AudioSystem.stopTone();
        
        // Habilitar sliders de frecuencia
        frequencySliders.forEach(slider => {
            slider.disabled = false;
        });
        
        // Habilitar botones de test
        frequencyTestBtns.forEach(btn => {
            btn.disabled = false;
        });
        
        // Deshabilitar sección de calibración
        knobSlider.disabled = true;
        testCalibrationBtn.disabled = true;
        readyBtn.disabled = true;
        
        // Habilitar demás elementos de la interfaz
        // Aquí puedes añadir código para habilitar otros elementos según sea necesario
        
        // Actualizar estado
        statusBar.textContent = "¡Listo! Ahora ajuste cada frecuencia hasta que deje de oír el tono.";
    });
});
