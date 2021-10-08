function Meteogram(hourlyData, container) {
    this.symbols = [];
    this.humidities = [];
    this.winds = [];
    this.temperatures = [];
    this.pressures = [];
  
    // Initialize
    this.hourlyData = hourlyData;
    this.container = container;
  
    // Run
    this.parseYrData();
  }
  
  /**
  * Mapping of the symbol code in yr.no's API to the icons in their public
  * GitHub repo, as well as the text used in the tooltip.
  *
  * https://api.met.no/weatherapi/weathericon/2.0/documentation
  */
  Meteogram.dictionary = {
    clearsky: {
        symbol: '01',
        text: 'Clear sky'
    },
    fair: {
        symbol: '02',
        text: 'Fair'
    },
    partlycloudy: {
        symbol: '03',
        text: 'Partly cloudy'
    },
    cloudy: {
        symbol: '04',
        text: 'Cloudy'
    },
    lightrainshowers: {
        symbol: '40',
        text: 'Light rain showers'
    },
    rainshowers: {
        symbol: '05',
        text: 'Rain showers'
    },
    heavyrainshowers: {
        symbol: '41',
        text: 'Heavy rain showers'
    },
    lightrainshowersandthunder: {
        symbol: '24',
        text: 'Light rain showers and thunder'
    },
    rainshowersandthunder: {
        symbol: '06',
        text: 'Rain showers and thunder'
    },
    heavyrainshowersandthunder: {
        symbol: '25',
        text: 'Heavy rain showers and thunder'
    },
    lightsleetshowers: {
        symbol: '42',
        text: 'Light sleet showers'
    },
    sleetshowers: {
        symbol: '07',
        text: 'Sleet showers'
    },
    heavysleetshowers: {
        symbol: '43',
        text: 'Heavy sleet showers'
    },
    lightsleetshowersandthunder: {
        symbol: '26',
        text: 'Light sleet showers and thunder'
    },
    sleetshowersandthunder: {
        symbol: '20',
        text: 'Sleet showers and thunder'
    },
    heavysleetshowersandthunder: {
        symbol: '27',
        text: 'Heavy sleet showers and thunder'
    },
    lightsnowshowers: {
        symbol: '44',
        text: 'Light snow showers'
    },
    snowshowers: {
        symbol: '08',
        text: 'Snow showers'
    },
    heavysnowshowers: {
        symbol: '45',
        text: 'Heavy show showers'
    },
    lightsnowshowersandthunder: {
        symbol: '28',
        text: 'Light snow showers and thunder'
    },
    snowshowersandthunder: {
        symbol: '21',
        text: 'Snow showers and thunder'
    },
    heavysnowshowersandthunder: {
        symbol: '29',
        text: 'Heavy snow showers and thunder'
    },
    lightrain: {
        symbol: '46',
        text: 'Light rain'
    },
    rain: {
        symbol: '09',
        text: 'Rain'
    },
    heavyrain: {
        symbol: '10',
        text: 'Heavy rain'
    },
    lightrainandthunder: {
        symbol: '30',
        text: 'Light rain and thunder'
    },
    rainandthunder: {
        symbol: '22',
        text: 'Rain and thunder'
    },
    heavyrainandthunder: {
        symbol: '11',
        text: 'Heavy rain and thunder'
    },
    lightsleet: {
        symbol: '47',
        text: 'Light sleet'
    },
    sleet: {
        symbol: '12',
        text: 'Sleet'
    },
    heavysleet: {
        symbol: '48',
        text: 'Heavy sleet'
    },
    lightsleetandthunder: {
        symbol: '31',
        text: 'Light sleet and thunder'
    },
    sleetandthunder: {
        symbol: '23',
        text: 'Sleet and thunder'
    },
    heavysleetandthunder: {
        symbol: '32',
        text: 'Heavy sleet and thunder'
    },
    lightsnow: {
        symbol: '49',
        text: 'Light snow'
    },
    snow: {
        symbol: '13',
        text: 'Snow'
    },
    heavysnow: {
        symbol: '50',
        text: 'Heavy snow'
    },
    lightsnowandthunder: {
        symbol: '33',
        text: 'Light snow and thunder'
    },
    snowandthunder: {
        symbol: '14',
        text: 'Snow and thunder'
    },
    heavysnowandthunder: {
        symbol: '34',
        text: 'Heavy snow and thunder'
    },
    fog: {
        symbol: '15',
        text: 'Fog'
    }
  };
  
  /**
  * Draw blocks around wind arrows, below the plot area
  */
  Meteogram.prototype.drawBlocksForWindArrows = function (chart) {
    const xAxis = chart.xAxis[0];
  
    for (
        let pos = xAxis.min, max = xAxis.max, i = 0;
        pos <= max + 36e5; pos += 36e5,
        i += 1
    ) {
  
        // Get the X position
        const isLast = pos === max + 36e5,
            x = Math.round(xAxis.toPixels(pos)) + (isLast ? 0.5 : -0.5);
  
        // Draw the vertical dividers and ticks
        const isLong = this.resolution > 36e5 ?
            pos % this.resolution === 0 :
            i % 2 === 0;
  
        chart.renderer
            .path([
                'M', x, chart.plotTop + chart.plotHeight + (isLong ? 0 : 28),
                'L', x, chart.plotTop + chart.plotHeight + 32,
                'Z'
            ])
            .attr({
                stroke: chart.options.chart.plotBorderColor,
                'stroke-width': 1
            })
            .add();
    }
  
    // Center items in block
    chart.get('windbarbs').markerGroup.attr({
        translateX: chart.get('windbarbs').markerGroup.translateX + 8
    });
  
  };
  
  /**
  * Build and return the Highcharts options structure
  */
  Meteogram.prototype.getChartOptions = function () {
    return {
        chart: {
            renderTo: this.container,
            marginBottom: 70,
            marginRight: 40,
            marginTop: 50,
            plotBorderWidth: 1,
            height: 310,
            alignTicks: false,
            width: 810
        },
  
        defs: {
            patterns: [{
                id: 'precipitation-error',
                path: {
                    d: [
                        'M', 3.3, 0, 'L', -6.7, 10,
                        'M', 6.7, 0, 'L', -3.3, 10,
                        'M', 10, 0, 'L', 0, 10,
                        'M', 13.3, 0, 'L', 3.3, 10,
                        'M', 16.7, 0, 'L', 6.7, 10
                    ].join(' '),
                    stroke: '#68CFE8',
                    strokeWidth: 1
                }
            }]
        },
  
        title: {
            text: 'Hourly Weather (For Next 5 Days)',
            align: 'center',
            style: {
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis'
            }
        },
  
        credits: {
            text: 'Forecast',
            href: '#',
            position: { 
                x: -40
            }
        },
  
        tooltip: {
            shared: true,
            useHTML: true,
            headerFormat:
                '<small>{point.timestamp:%A, %b %e, %H:%M}</small><br>'
        },
  
        xAxis: [{ // Bottom X axis
            type: 'datetime',
            tickInterval: 2 * 36e5, // two hours
            minorTickInterval: 36e5, // one hour
            tickLength: 0,
            gridLineWidth: 1,
            gridLineColor: 'rgba(128, 128, 128, 0.1)',
            startOnTick: false,
            endOnTick: false,
            minPadding: 0,
            maxPadding: 0,
            offset: 30,
            showLastLabel: true,
            fontSize: 5,
            labels: {
                format: '{value:%H}'
            },
            crosshair: true
        }, { // Top X axis
            linkedTo: 0,
            type: 'datetime',
            tickInterval: 24 * 3600 * 1000,
            labels: {
                format: '{value:<span style="font-size: 12px; font-weight: bold">%a</span> %b %e}',
                align: 'left',
                x: 3,
                y: -5
            },
            opposite: true,
            tickLength: 20,
            gridLineWidth: 1
        }],
  
        yAxis: [{ // temperature axis
            title: {
                text: null
            },
            labels: {
                format: '{value}°',
                style: {
                    fontSize: '10px'
                },
                x: -3
            },
            plotLines: [{ // zero plane
                value: 0,
                color: '#BBBBBB',
                width: 1,
                zIndex: 2
            }],
            maxPadding: 0.3,
            minRange: 8,
            tickInterval: 1,
            gridLineColor: 'rgba(128, 128, 128, 0.1)'
  
        }, { // humidity axis
            title: {
                text: null
            },
            labels: {
                enabled: false
            },
            gridLineWidth: 0,
            tickLength: 0,
            minRange: 10,
            min: 0
  
        }, { // Air pressure
            allowDecimals: false,
            title: { // Title on top of axis
                text: 'inHg',
                offset: 0,
                align: 'high',
                rotation: 0,
                style: {
                    fontSize: '10px',
                    color: Highcharts.getOptions().colors[3]
                },
                textAlign: 'left',
                x: 3
            },
            labels: {
                style: {
                    fontSize: '8px',
                    color: Highcharts.getOptions().colors[3]
                },
                y: 2,
                x: 3
            },
            gridLineWidth: 0,
            opposite: true,
            showLastLabel: false
        }],
  
        legend: {
            enabled: false
        },
  
        plotOptions: {
            series: {
                pointPlacement: 'between'
            }
        },
  
  
        series: [{
            name: 'Temperature',
            data: this.temperatures,
            type: 'spline',
            marker: {
                enabled: false,
                states: {
                    hover: {
                        enabled: true
                    }
                }
            },
            tooltip: {
                pointFormat: '<span style="color:{point.color}">\u25CF</span> ' +
                    '{series.name}: <b>{point.y}°F</b><br/>'
            },
            zIndex: 1,
            color: '#FF3333',
            negativeColor: '#48AFE8'
        }, {
            name: 'Humidity',
            data: this.humidities,
            type: 'column',
            color: 'rgb(149, 205, 250)',
            yAxis: 1,
            groupPadding: 0,
            pointPadding: 0,
            grouping: false,
            dataLabels: {
                enabled: true,
                filter: {
                    operator: '>',
                    property: 'y',
                    value: 0
                },
                style: {
                    fontSize: '8px',
                    color: 'gray'
                }
            },
            tooltip: {
                valueSuffix: ' %'
            }
        }, {
            name: 'Air pressure',
            color: Highcharts.getOptions().colors[3],
            data: this.pressures,
            marker: {
                enabled: false
            },
            shadow: false,
            tooltip: {
                valueSuffix: ' inHg'
            },
            dashStyle: 'shortdot',
            yAxis: 2
        }, {
            name: 'Wind',
            type: 'windbarb',
            id: 'windbarbs',
            color: Highcharts.getOptions().colors[1],
            lineWidth: 1.5,
            data: this.winds,
            vectorLength: 10,
            yOffset: -10,
            xOffset: -7,
            tooltip: {
                valueSuffix: ' mph'
            }
        }]
    };
  };
  
  /**
  * Post-process the chart from the callback function, the second argument
  * Highcharts.Chart.
  */
  Meteogram.prototype.onChartLoad = function (chart) {
    this.drawBlocksForWindArrows(chart);
  };
  
  /**
  * Create the chart. This function is called async when the data file is loaded
  * and parsed.
  */
  Meteogram.prototype.createChart = function () {
    this.chart = new Highcharts.Chart(this.getChartOptions(), chart => {
        this.onChartLoad(chart);
    });
  };
  
  Meteogram.prototype.parseYrData = function () {
  
    let pointStart;

    // Loop over hourly forecasts
    this.hourlyData.forEach((node, i) => {
        const x = Date.parse(node[0]),
            to = x + 36e5;
  
        if (to > pointStart + 24*5*36e5) {
            return;
        }
  
        this.temperatures.push({
            x,
            y: node[1],
        });
  
        this.humidities.push({
            x,
            y: node[2]
        });
  
        if (i % 2 === 0) {
            this.winds.push({
                x,
                value: node[3],
                direction: node[4]
            });
        }
  
        this.pressures.push({
            x,
            y: node[5]
        });
  
        if (i === 0) {
            pointStart = (x + to) / 2;
        }
    });
  
    // Create the chart when the data is loaded
    this.createChart();
  };
  // End of the Meteogram protype
  
  function renderMeteogramChart(hourlyData) {
      window.meteogram = new Meteogram(hourlyData, 'meteogram-container');
  }