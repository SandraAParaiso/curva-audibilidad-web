/**
 * Aplicación Principal: Curva de Audibilidad Humana
 * Adaptación del código original de MATLAB/Google Colab a una aplicación web
 */

// Constantes de la aplicación
const APP = {
    // Frecuencias a evaluar (Hz)
    frequencies: [125, 250, 500, 1000, 2000, 4000, 8000, 12000],
    
    // Estado de la aplicación
    state: {
        // Valores iniciales de los sliders
        slidersBoth: {},   // Valores para ambos oídos
        slidersLeft: {},   // Valores para oído izquierdo
        slidersRight: {},  // Valores para oído derecho
        
        // Modo actual
        currentMode: 'both_ears',  // 'both_ears', 'left_ear', 'right_ear'
        knobValue: 50,             // Valor del knob de calibración
        
        // Estado de visualización
        showBoth: true,
        showLeft: false,
        showRight: false,
        
        // Estado de la interfaz
        testingMode: false  // true cuando se ha pasado la calibración
    },
    
    // Referencias a elementos DOM
    elements: {},
    
    // Método de inicialización
    init: function() {
        // Inicializar valores de sliders
        this.frequencies.forEach(freq => {
            this.state.slidersBoth[freq] = 100;
            this.state.slidersLeft[freq] = 100;
            this.state.slidersRight[freq] = 100;
        });
        
        // Obtener referencias a elementos DOM
        this.getElements();
        
        // Configurar generación de sliders de frecuencia
        this.createFrequencySliders();
        
        // Configurar eventos
        this.setupEventListeners();
        
        // Inicializar gráficos
        ChartsSystem.init(this.frequencies);
        
        // Actualizar gráficos iniciales
        this.updateCharts();
        
        console.log("Aplicación inicializada correctamente");
    },
    
    // Obtener referencias a elementos DOM
    getElements: function() {
        // Elementos de calibración
        this.elements.knobSlider = document.getElementById('knob-slider');
        this.elements.knobValue = document.getElementById('knob-value');
        this.elements.testCalibrationBtn = document.getElementById('test-calibration-btn');
        this.elements.readyBtn = document.getElementById('ready-btn');
        
        // Elementos de selección de oídos
        this.elements.bothEarsRadio = document.getElementById('both-ears');
        this.elements.leftEarRadio = document.getElementById('left-ear');
        this.elements.rightEarRadio = document.getElementById('right-ear');
        
        // Elementos de visualización
        this.elements.showBothCheck = document.getElementById('show-both');
        this.elements.showLeftCheck = document.getElementById('show-left');
        this.elements.showRightCheck = document.getElementById('show-right');
        
        // Elementos de información personal
        this.elements.initialsField = document.getElementById('initials');
        this.elements.ageField = document.getElementById('age');
        this.elements.saveBtn = document.getElementById('save-btn');
        
        // Elementos de acción
        this.elements.recalibrateBtn = document.getElementById('recalibrate-btn');
        this.elements.restartBtn = document.getElementById('restart-btn');
        this.elements.stopSoundBtn = document.getElementById('stop-sound-btn');
        
        // Contenedor de sliders de frecuencia
        this.elements.frequencySlidersContainer = document.getElementById('frequency-sliders');
        
        // Barra de estado
        this.elements.statusBar = document.getElementById('status-bar');
    },
    
    // Crear sliders de frecuencia
    createFrequencySliders: function() {
        // Limpiar contenedor
        this.elements.frequencySlidersContainer.innerHTML = '';
        
        // Crear un slider para cada frecuencia
        this.frequencies.forEach(freq => {
            // Crear contenedor para el grupo de slider
            const sliderGroup = document.createElement('div');
            sliderGroup.classList.add('freq-slider-group');
            
            // Crear etiqueta de frecuencia
            const label = document.createElement('div');
            label.classList.add('freq-label');
            label.textContent = `${freq} Hz`;
            
            // Crear slider vertical
            const slider = document.createElement('input');
            slider.type = 'range';
            slider.min = 0;
            slider.max = 100;
            slider.value = 100;
            slider.classList.add('freq-slider');
            slider.setAttribute('orient', 'vertical');
            slider.disabled = true;
            slider.dataset.frequency = freq;
            
            // Crear botón de test
            const testBtn = document.createElement('button');
            testBtn.textContent = 'Test';
            testBtn.classList.add('btn', 'freq-test-btn');
            testBtn.disabled = true;
            testBtn.dataset.frequency = freq;
            
            // Añadir elementos al grupo
            sliderGroup.appendChild(label);
            sliderGroup.appendChild(slider);
            sliderGroup.appendChild(testBtn);
            
            // Añadir grupo al contenedor
            this.elements.frequencySlidersContainer.appendChild(sliderGroup);
            
            // Guardar referencia
            this.elements[`slider_${freq}`] = slider;
            this.elements[`testBtn_${freq}`] = testBtn;
            
            // Configurar eventos
            slider.addEventListener('input', (e) => this.onFrequencySliderChange(freq, e.target.value));
            testBtn.addEventListener('click', () => this.onFrequencyTestClick(freq));
        });
    },
    
    // Configurar eventos de la interfaz
    setupEventListeners: function() {
        // Eventos de calibración
        this.elements.knobSlider.addEventListener('input', this.onKnobChange.bind(this));
        this.elements.testCalibrationBtn.addEventListener('click', this.onTestCalibrationClick.bind(this));
        this.elements.readyBtn.addEventListener('click', this.onReadyClick.bind(this));
        
        // Eventos de selección de oídos
        this.elements.bothEarsRadio.addEventListener('change', this.onEarModeChange.bind(this));
        this.elements.leftEarRadio.addEventListener('change', this.onEarModeChange.bind(this));
        this.elements.rightEarRadio.addEventListener('change', this.onEarModeChange.bind(this));
        
        // Eventos de visualización
        this.elements.showBothCheck.addEventListener('change', this.onShowDataChange.bind(this));
        this.elements.showLeftCheck.addEventListener('change', this.onShowDataChange.bind(this));
        this.elements.showRightCheck.addEventListener('change', this.onShowDataChange.bind(this));
        
        // Eventos de botones de acción
        this.elements.saveBtn.addEventListener('click', this.onSaveClick.bind(this));
        this.elements.recalibrateBtn.addEventListener('click', this.onRecalibrateClick.bind(this));
        this.elements.restartBtn.addEventListener('click', this.onRestartClick.bind(this));
        this.elements.stopSoundBtn.addEventListener('click', this.onStopSoundClick.bind(this));
    },
    
    // Manejador de cambio en knob de calibración
    onKnobChange: function(e) {
        const value = parseInt(e.target.value);
        this.state.knobValue = value;
        this.elements.knobValue.textContent = value;
        
        // Actualizar gráficos
        this.updateCharts();
    },
    
    // Manejador de clic en botón de test de calibración
    onTestCalibrationClick: function() {
        // Reproducir tono de calibración (2000 Hz como en la versión original)
        this.playTone(2000, this.state.knobValue);
        this.setStatus(`Reproduciendo tono de calibración a 2000 Hz`);
    },
    
    // Manejador de clic en botón de preparado
    onReadyClick: function() {
        // Cambiar a modo de prueba
        this.state.testingMode = true;
        
        // Deshabilitar controles de calibración
        this.elements.knobSlider.disabled = true;
        this.elements.testCalibrationBtn.disabled = true;
        this.elements.readyBtn.disabled = true;
        
        // Habilitar sliders y botones de frecuencia
        this.frequencies.forEach(freq => {
            this.elements[`slider_${freq}`].disabled = false;
            this.elements[`testBtn_${freq}`].disabled = false;
        });
        
        // Habilitar selección de oídos
        this.elements.bothEarsRadio.disabled = false;
        this.elements.leftEarRadio.disabled = false;
        this.elements.rightEarRadio.disabled = false;
        
        // Habilitar visualización
        this.elements.showBothCheck.disabled = false;
        this.elements.showLeftCheck.disabled = false;
        this.elements.showRightCheck.disabled = false;
        
        // Habilitar campos y botones
        this.elements.initialsField.disabled = false;
        this.elements.ageField.disabled = false;
        this.elements.saveBtn.disabled = false;
        this.elements.recalibrateBtn.disabled = false;
        this.elements.restartBtn.disabled = false;
        
        // Actualizar estado
        this.setStatus("Comience ajustando las barras hasta que deje de oír cada tono");
    },
    
    // Manejador de cambio en modo de oído
    onEarModeChange: function(e) {
        if (e.target.checked) {
            if (e.target === this.elements.bothEarsRadio) {
                this.state.currentMode = 'both_ears';
            } else if (e.target === this.elements.leftEarRadio) {
                this.state.currentMode = 'left_ear';
            } else if (e.target === this.elements.rightEarRadio) {
                this.state.currentMode = 'right_ear';
            }
            
            // Actualizar sliders según el modo actual
            this.updateSlidersFromMode();
            
            // Actualizar estado
            this.setStatus(`Modo cambiado a: ${this.getModeName()}`);
        }
    },
    
    // Obtener nombre legible del modo actual
    getModeName: function() {
        switch (this.state.currentMode) {
            case 'both_ears': return 'Ambos oídos';
            case 'left_ear': return 'Oído izquierdo';
            case 'right_ear': return 'Oído derecho';
            default: return 'Desconocido';
        }
    },
    
    // Actualizar sliders según el modo actual
    updateSlidersFromMode: function() {
        // Obtener valores correspondientes al modo actual
        let values;
        if (this.state.currentMode === 'both_ears') {
            values = this.state.slidersBoth;
        } else if (this.state.currentMode === 'left_ear') {
            values = this.state.slidersLeft;
        } else if (this.state.currentMode === 'right_ear') {
            values = this.state.slidersRight;
        }
        
        // Actualizar valores de sliders
        this.frequencies.forEach(freq => {
            this.elements[`slider_${freq}`].value = values[freq];
        });
    },
    
    // Manejador de cambio en visualización de datos
    onShowDataChange: function(e) {
        if (e.target === this.elements.showBothCheck) {
            this.state.showBoth = e.target.checked;
        } else if (e.target === this.elements.showLeftCheck) {
            this.state.showLeft = e.target.checked;
        } else if (e.target === this.elements.showRightCheck) {
            this.state.showRight = e.target.checked;
        }
        
        // Actualizar gráficos
        this.updateCharts();
    },
    
    // Manejador de cambio en sliders de frecuencia
    onFrequencySliderChange: function(frequency, value) {
        // Almacenar valor según modo actual
        value = parseInt(value);
        
        if (this.state.currentMode === 'both_ears') {
            this.state.slidersBoth[frequency] = value;
        } else if (this.state.currentMode === 'left_ear') {
            this.state.slidersLeft[frequency] = value;
        } else if (this.state.currentMode === 'right_ear') {
            this.state.slidersRight[frequency] = value;
        }
        
        // Reproducir tono
        this.playTone(frequency, value);
        
        // Actualizar gráficos
        this.updateCharts();
    },
    
    // Manejador de clic en botones de test de frecuencia
    onFrequencyTestClick: function(frequency) {
        // Obtener valor actual según modo
        let value;
        if (this.state.currentMode === 'both_ears') {
            value = this.state.slidersBoth[frequency];
        } else if (this.state.currentMode === 'left_ear') {
            value = this.state.slidersLeft[frequency];
        } else if (this.state.currentMode === 'right_ear') {
            value = this.state.slidersRight[frequency];
        }
        
        // Reproducir tono
        this.playTone(frequency, value);
        
        // Actualizar estado
        this.setStatus(`Reproduciendo tono de ${frequency} Hz`);
    },
    
    // Manejador de clic en botón de guardar
    onSaveClick: function() {
        // Validar que se hayan introducido iniciales y edad
        const initials = this.elements.initialsField.value.trim();
        const age = this.elements.ageField.value.trim();
        
        if (!initials || !age) {
            alert("Por favor, introduzca sus iniciales y edad antes de guardar.");
            return;
        }
        
        try {
            // Crear objeto de datos
            const dataBoth = this.frequencies.map(f => this.state.slidersBoth[f] - this.state.knobValue);
            const dataLeft = this.frequencies.map(f => this.state.slidersLeft[f] - this.state.knobValue);
            const dataRight = this.frequencies.map(f => this.state.slidersRight[f] - this.state.knobValue);
            
            // Calcular audiogramas
            const audiogramBoth = this.frequencies.map((_, i) => {
                return ChartsSystem.umbralEstandar[i]-dataBoth[i];
            });
            
            const audiogramLeft = this.frequencies.map((_, i) => {
                return  ChartsSystem.umbralEstandar[i] - dataLeft[i] ;
            });
            
            const audiogramRight = this.frequencies.map((_, i) => {
                return  ChartsSystem.umbralEstandar[i] - dataRight[i];
            });
            
            // Crear objeto de datos
            const data = {
                info: {
                    initials: initials,
                    age: parseInt(age),
                    date: new Date().toISOString()
                },
                frequencies: this.frequencies,
                thresholds: {
                    both: dataBoth,
                    left: dataLeft,
                    right: dataRight
                },
                audiograms: {
                    both: audiogramBoth,
                    left: audiogramLeft,
                    right: audiogramRight
                }
            };
            
            // Convertir a CSV
            const csvData = this.generateCSV(data);
            
            // Descargar archivo
            this.downloadFile(csvData, `audibility_data_${initials}.csv`);
            
            // Actualizar estado
            this.setStatus("Datos guardados correctamente");
        } catch (error) {
            console.error("Error guardando datos:", error);
            alert("Error guardando datos: " + error.message);
        }
    },
    
    // Generar archivo CSV a partir de datos
    generateCSV: function(data) {
        // Cabecera
        let csv = "Frequency,Threshold_Both_Ears,Threshold_Left_Ear,Threshold_Right_Ear,";
        csv += "Audiogram_Both_Ears,Audiogram_Left_Ear,Audiogram_Right_Ear\n";
        
        // Datos por frecuencia
        for (let i = 0; i < data.frequencies.length; i++) {
            csv += `${data.frequencies[i]},`;
            csv += `${data.thresholds.both[i].toFixed(1)},`;
            csv += `${data.thresholds.left[i].toFixed(1)},`;
            csv += `${data.thresholds.right[i].toFixed(1)},`;
            csv += `${data.audiograms.both[i].toFixed(1)},`;
            csv += `${data.audiograms.left[i].toFixed(1)},`;
            csv += `${data.audiograms.right[i].toFixed(1)}\n`;
        }
        
        // Información adicional
        csv += "\nInformation\n";
        csv += `Initials,${data.info.initials}\n`;
        csv += `Age,${data.info.age}\n`;
        csv += `Date,${data.info.date}\n`;
        
        return csv;
    },
    
    // Descargar archivo
    downloadFile: function(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },
    
    // Manejador de clic en botón de recalibración
    onRecalibrateClick: function() {
        // Cambiar a modo de calibración
        this.state.testingMode = false;
        
        // Habilitar controles de calibración
        this.elements.knobSlider.disabled = false;
        this.elements.testCalibrationBtn.disabled = false;
        this.elements.readyBtn.disabled = false;
        
        // Deshabilitar sliders y botones de frecuencia
        this.frequencies.forEach(freq => {
            this.elements[`slider_${freq}`].disabled = true;
            this.elements[`testBtn_${freq}`].disabled = true;
        });
        
        // Deshabilitar selección de oídos
        this.elements.bothEarsRadio.disabled = true;
        this.elements.leftEarRadio.disabled = true;
        this.elements.rightEarRadio.disabled = true;
        
        // Deshabilitar visualización
        this.elements.showBothCheck.disabled = true;
        this.elements.showLeftCheck.disabled = true;
        this.elements.showRightCheck.disabled = true;
        
        // Deshabilitar campos y botones
        this.elements.initialsField.disabled = true;
        this.elements.ageField.disabled = true;
        this.elements.saveBtn.disabled = true;
        this.elements.recalibrateBtn.disabled = true;
        this.elements.restartBtn.disabled = true;
        
        // Actualizar estado
        this.setStatus("Modo de calibración. Ajuste el volumen y pulse 'Pulse para comenzar!'");
    },
    
    // Manejador de clic en botón de reinicio
    onRestartClick: function() {
        // Confirmar reinicio
        if (!confirm("¿Está seguro de que desea reiniciar la aplicación? Se perderán todos los datos no guardados.")) {
            return;
        }
        
        // Detener cualquier sonido en reproducción
        this.onStopSoundClick();
        
        // Reiniciar valores de sliders
        this.frequencies.forEach(freq => {
            this.state.slidersBoth[freq] = 100;
            this.state.slidersLeft[freq] = 100;
            this.state.slidersRight[freq] = 100;
        });
        
        // Reiniciar estado
        this.state.currentMode = 'both_ears';
        this.state.knobValue = 50;
        this.state.showBoth = true;
        this.state.showLeft = false;
        this.state.showRight = false;
        this.state.testingMode = false;
        
        // Reiniciar interfaz
        this.elements.knobSlider.value = 50;
        this.elements.knobValue.textContent = '50';
        this.elements.bothEarsRadio.checked = true;
        this.elements.leftEarRadio.checked = false;
        this.elements.rightEarRadio.checked = false;
        this.elements.showBothCheck.checked = true;
        this.elements.showLeftCheck.checked = false;
        this.elements.showRightCheck.checked = false;
        this.elements.initialsField.value = '';
        this.elements.ageField.value = '';
        
        // Reiniciar sliders
        this.frequencies.forEach(freq => {
            this.elements[`slider_${freq}`].value = 100;
        });
        
        // Llamar a recalibración para restaurar estados de habilitación
        this.onRecalibrateClick();
        
        // Actualizar gráficos
        this.updateCharts();
        
        // Actualizar estado
        this.setStatus("Aplicación reiniciada. Calibre el volumen y pulse 'Pulse para comenzar!'");
    },
    
    // Manejador de clic en botón de detener sonido
    onStopSoundClick: function() {
        AudioSystem.stopTone();
        this.setStatus("Reproducción de sonido detenida");
    },
    
    // Reproducir tono
    playTone: function(frequency, sliderValue) {
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
            
            // Reproducir tono
            AudioSystem.playTone(params.frequency, params.amplitude, ear);
            
            // Actualizar estado
            this.setStatus(`Reproduciendo ${frequency} Hz a ${params.limitedDb.toFixed(1)} dB (amplitud: ${params.amplitude.toFixed(4)})`);
            
            return true;
        } catch (error) {
            console.error("Error reproduciendo tono:", error);
            this.setStatus(`Error reproduciendo tono: ${error.message}`);
            return false;
        }
    },
    
    // Actualizar gráficos
    updateCharts: function() {
        // Preparar datos para gráficos
        const chartData = {
            frequencies: this.frequencies,
            valuesBoth: Object.values(this.state.slidersBoth),
            valuesLeft: Object.values(this.state.slidersLeft),
            valuesRight: Object.values(this.state.slidersRight),
            showBoth: this.state.showBoth,
            showLeft: this.state.showLeft,
            showRight: this.state.showRight,
            knobValue: this.state.knobValue
        };
        
        // Actualizar gráficos
        ChartsSystem.updateCharts(chartData);
    },
    
    // Actualizar barra de estado
    setStatus: function(message) {
        this.elements.statusBar.textContent = message;
    }
};

document.addEventListener("DOMContentLoaded", async () => {
    try {
        await AudioSystem.init(); // Asegurar que AudioSystem está listo
        await ChartsSystem.init(); // Asegurar que ChartsSystem está listo
        APP.init(); // Ahora podemos inicializar APP
    } catch (error) {
        console.error("Error al inicializar los sistemas:", error);
    }
});


// Inicializar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    APP.init();
});
