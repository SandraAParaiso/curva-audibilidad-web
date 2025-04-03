/**
 * Script de diagnóstico de audio - incluir antes del cierre del body en index.html
 */
document.addEventListener('DOMContentLoaded', function() {
    // Crear un área de diagnóstico oculta
    const diagArea = document.createElement('div');
    diagArea.id = 'audio-diagnostics';
    diagArea.style.display = 'none'; // Oculto por defecto
    diagArea.style.padding = '10px';
    diagArea.style.backgroundColor = '#f8f9fa';
    diagArea.style.border = '1px solid #ddd';
    diagArea.style.marginTop = '20px';
    diagArea.style.fontFamily = 'monospace';
    diagArea.style.fontSize = '12px';
    diagArea.style.maxHeight = '200px';
    diagArea.style.overflow = 'auto';
    
    // Botón para mostrar/ocultar diagnóstico
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'Mostrar diagnóstico de audio';
    toggleBtn.style.marginTop = '10px';
    toggleBtn.classList.add('btn');
    
    toggleBtn.addEventListener('click', function() {
        if (diagArea.style.display === 'none') {
            diagArea.style.display = 'block';
            this.textContent = 'Ocultar diagnóstico de audio';
            runAudioDiagnostics();
        } else {
            diagArea.style.display = 'none';
            this.textContent = 'Mostrar diagnóstico de audio';
        }
    });
    
    // Agregar botón y área a la página
    document.querySelector('.status-bar').after(toggleBtn);
    toggleBtn.after(diagArea);
    
    // Función de diagnóstico
    function runAudioDiagnostics() {
        diagArea.innerHTML = '<h3>Diagnóstico del Sistema de Audio</h3>';
        
        // Comprobar soporte de Web Audio API
        addDiagLine('Soporte de Web Audio API:', !!window.AudioContext || !!window.webkitAudioContext);
        
        // Comprobar estado de inicialización
        if (typeof AudioSystem !== 'undefined') {
            addDiagLine('Sistema de audio cargado:', true);
            addDiagLine('Sistema inicializado:', AudioSystem.isInitialized);
            
            if (AudioSystem.context) {
                addDiagLine('Estado del contexto:', AudioSystem.context.state);
                addDiagLine('Frecuencia de muestreo:', AudioSystem.context.sampleRate + ' Hz');
                
                // Probar generación de tono simple
                const testToneBtn = document.createElement('button');
                testToneBtn.textContent = 'Probar tono simple';
                testToneBtn.classList.add('btn');
                testToneBtn.style.padding = '3px 8px';
                testToneBtn.style.margin = '5px 0';
                testToneBtn.style.fontSize = '11px';
                
                testToneBtn.addEventListener('click', function() {
                    try {
                        // Crear un contexto temporal para la prueba
                        const testContext = new AudioContext();
                        const testOsc = testContext.createOscillator();
                        const testGain = testContext.createGain();
                        
                        // Configurar un tono de prueba muy corto
                        testOsc.frequency.value = 440;
                        testGain.gain.value = 0.2;
                        
                        // Conectar y reproducir
                        testOsc.connect(testGain);
                        testGain.connect(testContext.destination);
                        
                        testOsc.start();
                        testOsc.stop(testContext.currentTime + 0.5);
                        
                        // Limpiar después de reproducir
                        setTimeout(() => {
                            testOsc.disconnect();
                            testGain.disconnect();
                            testContext.close();
                            addDiagLine('Prueba de tono completada:', true);
                        }, 600);
                        
                        addDiagLine('Iniciando prueba de tono...', true);
                    } catch (e) {
                        addDiagLine('Error en prueba de tono:', e.message);
                    }
                });
                
                diagArea.appendChild(testToneBtn);
            } else {
                addDiagLine('Contexto de audio:', 'No creado');
            }
        } else {
            addDiagLine('Sistema de audio cargado:', false);
        }
        
        // Comprobar navegador
        addDiagLine('Navegador:', navigator.userAgent);
        
        // Verificar política de autoplay
        if (navigator.userActivation) {
            addDiagLine('Interacción del usuario:', navigator.userActivation.hasBeenActive);
        } else {
            addDiagLine('API de activación:', 'No soportada');
        }
    }
    
    function addDiagLine(label, value) {
        const line = document.createElement('div');
        line.innerHTML = `<strong>${label}</strong> ${formatValue(value)}`;
        diagArea.appendChild(line);
    }
    
    function formatValue(value) {
        if (typeof value === 'boolean') {
            return value ? 
                '<span style="color: green">✓</span>' : 
                '<span style="color: red">✗</span>';
        }
        return value;
    }
});
