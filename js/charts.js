/**
 * Sistema de gráficos para la Curva de Audibilidad Humana
 * Utiliza Chart.js para crear y actualizar los gráficos
 */

const ChartsSystem = {
    // Referencias a los gráficos
    audibilityChart: null,
    audiogramChart: null,
    
    // Constantes ISO 1961. Robinson and Dadson (1956)
    umbralEstandar: [21.4, 11.2, 6, 4.2, 1, -3.9, 15.3, 12],
    
    // Método de inicialización
    init: function(frequencies) {
        // Crear configuración base para ambos gráficos
        this.createAudibilityChart(frequencies);
        this.createAudiogramChart(frequencies);
        
        return true;
    },
    
    // Crear gráfico de curva de audibilidad
    createAudibilityChart: function(frequencies) {
        const ctx = document.getElementById('audibility-chart').getContext('2d');
        
        this.audibilityChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: frequencies,
                datasets: [
                    {
                        label: 'Ambos oídos',
                        data: Array(frequencies.length).fill(0),
                        borderColor: 'rgb(0, 0, 0)',
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        borderWidth: 2,
                        tension: 0.1,
                        pointRadius: 4
                    },
                    {
                        label: 'Oído derecho',
                        data: Array(frequencies.length).fill(0),
                        borderColor: 'rgb(255, 0, 0)',
                        backgroundColor: 'rgba(255, 0, 0, 0.1)',
                        borderWidth: 2,
                        tension: 0.1,
                        pointRadius: 4,
                        hidden: true
                    },
                    {
                        label: 'Oído izquierdo',
                        data: Array(frequencies.length).fill(0),
                        borderColor: 'rgb(0, 255, 255)',
                        backgroundColor: 'rgba(0, 255, 255, 0.1)',
                        borderWidth: 2,
                        tension: 0.1,
                        pointRadius: 4,
                        hidden: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Curva de Audibilidad',
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw.toFixed(1)} dB`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Frecuencia temporal (Hz)'
                        },
                        type: 'logarithmic',
                        min: 100,
                        max: 15000
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Nivel de presión sonora (dB)'
                        },
                        min: -10,
                        max: 80,
                        ticks: {
                            stepSize: 10
                        }
                    }
                }
            }
        });
    },
    
    // Crear gráfico de audiograma
    createAudiogramChart: function(frequencies) {
        const ctx = document.getElementById('audiogram-chart').getContext('2d');
        
        // Generar datos para la línea de referencia
        const refPoints = this.generateLogPoints(100, 15000, 100);
        
        this.audiogramChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: frequencies,
                datasets: [
                    {
                        label: 'Línea de referencia',
                        data: Array(refPoints.length).fill(0),
                        borderColor: 'rgba(0, 0, 0, 0.5)',
                        borderWidth: 1,
                        borderDash: [5, 5],
                        pointRadius: 0,
                        tension: 0
                    },
                    {
                        label: 'Ambos oídos',
                        data: Array(frequencies.length).fill(0),
                        borderColor: 'rgb(0, 0, 0)',
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        borderWidth: 2,
                        tension: 0.1,
                        pointRadius: 4
                    },
                    {
                        label: 'Oído derecho',
                        data: Array(frequencies.length).fill(0),
                        borderColor: 'rgb(255, 0, 0)',
                        backgroundColor: 'rgba(255, 0, 0, 0.1)',
                        borderWidth: 2,
                        tension: 0.1,
                        pointRadius: 4,
                        hidden: true
                    },
                    {
                        label: 'Oído izquierdo',
                        data: Array(frequencies.length).fill(0),
                        borderColor: 'rgb(0, 255, 255)',
                        backgroundColor: 'rgba(0, 255, 255, 0.1)',
                        borderWidth: 2,
                        tension: 0.1,
                        pointRadius: 4,
                        hidden: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Audiograma',
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                if (context.datasetIndex === 0) {
                                    return 'Referencia: 0 dB';
                                }
                                return `${context.dataset.label}: ${context.raw.toFixed(1)} dB`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Frecuencia temporal (Hz)'
                        },
                        type: 'logarithmic',
                        min: 100,
                        max: 15000
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Nivel auditivo (dB re ISO 1961)'
                        },
                        min: -30,
                        max: 80,
                        ticks: {
                            stepSize: 10
                        },
                        reverse: true // Invertir eje Y como en la versión original
                    }
                }
            }
        });
    },
    
    // Generar puntos logarítmicos para gráficos
    generateLogPoints: function(min, max, count) {
        const points = [];
        const logMin = Math.log10(min);
        const logMax = Math.log10(max);
        const step = (logMax - logMin) / (count - 1);
        
        for (let i = 0; i < count; i++) {
            const value = Math.pow(10, logMin + step * i);
            points.push(value);
        }
        
        return points;
    },
    
    // Actualizar gráficos con los datos actuales
    updateCharts: function(dataConfig) {
        const { 
            frequencies, 
            valuesBoth, 
            valuesLeft, 
            valuesRight, 
            showBoth, 
            showLeft, 
            showRight,
            knobValue 
        } = dataConfig;
        
        // Actualizar visibilidad de datasets
        this.audibilityChart.data.datasets[0].hidden = !showBoth;
        this.audibilityChart.data.datasets[1].hidden = !showRight;
        this.audibilityChart.data.datasets[2].hidden = !showLeft;
        
        this.audiogramChart.data.datasets[1].hidden = !showBoth;
        this.audiogramChart.data.datasets[2].hidden = !showRight;
        this.audiogramChart.data.datasets[3].hidden = !showLeft;
        
        // Calcular y actualizar valores para la curva de audibilidad
        if (showBoth) {
            const dataBoth = valuesBoth.map(value => value - knobValue);
            this.audibilityChart.data.datasets[0].data = dataBoth;
            
            // Calcular audiograma (umbral estándar - valor corregido)
            const audiogramBoth = frequencies.map((_, index) => {
                return this.umbralEstandar[index] - dataBoth[index];
            });
            this.audiogramChart.data.datasets[1].data = audiogramBoth;
        }
        
        if (showRight) {
            const dataRight = valuesRight.map(value => value - knobValue);
            this.audibilityChart.data.datasets[1].data = dataRight;
            
            // Calcular audiograma
            const audiogramRight = frequencies.map((_, index) => {
                return this.umbralEstandar[index] - dataRight[index];
            });
            this.audiogramChart.data.datasets[2].data = audiogramRight;
        }
        
        if (showLeft) {
            const dataLeft = valuesLeft.map(value => value - knobValue);
            this.audibilityChart.data.datasets[2].data = dataLeft;
            
            // Calcular audiograma
            const audiogramLeft = frequencies.map((_, index) => {
                return  this.umbralEstandar[index] -dataLeft[index];
            });
            this.audiogramChart.data.datasets[3].data = audiogramLeft;
        }
        
        // Actualizar gráficos
        this.audibilityChart.update();
        this.audiogramChart.update();
    }
};
