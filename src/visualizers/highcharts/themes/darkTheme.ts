'use strict';

const textMainColor: string = '#ffffff';
const labelsColor: string = '#e0e0e3';
const lineColor: string = '#707073';
const minorGridLineColor: string = '#505053';
const dataLabelsColor: string = '#f0f0f3';
const hiddenStyleColor: string = '#606063';
const strokeColor: string = '000000';

export const DarkThemeOptions: Highcharts.Options = {
    colors: ['#0078D4', '#CB4936', '#BEDFFF', '#038387', '#F6C0FF', '#D90086', '#A4E1D2', '#6E5DB7', '#C7D3FF', '#FFCA8A'],
    chart: {
        backgroundColor: '#111111',
    },
    title: {
        style: {
            color: textMainColor
        }
    },
    xAxis: {
        gridLineColor: '#E10420',
        labels: {
            style: {
                color: labelsColor
            }
        },
        lineColor: lineColor,
        minorGridLineColor: minorGridLineColor,
        tickColor: lineColor,
        title: {
            style: {
                color: textMainColor
            }
        }
    },
    yAxis: {
        gridLineColor: lineColor,
        labels: {
            style: {
                color: labelsColor
            }
        },
        lineColor: lineColor,
        minorGridLineColor: minorGridLineColor,
        tickColor: lineColor,
        title: {
            style: {
                color: textMainColor
            }
        }
    },
    tooltip: {
        backgroundColor: 'rgba(2, 2, 2, 0.85)',
        style: {
            color: '#faf9f8'
        }
    },
    plotOptions: {
        series: {
            dataLabels: {
                color: dataLabelsColor
            },
            marker: {
                lineColor: '#333'
            }
        },
        boxplot: {
            fillColor: minorGridLineColor
        },
        errorbar: {
            color: 'white'
        }
    },
    legend: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        itemStyle: {
            color: labelsColor
        },
        itemHoverStyle: {
            color: '#FFF'
        },
        itemHiddenStyle: {
            color: hiddenStyleColor
        },
        title: {
            style: {
                color: '#C0C0C0'
            }
        },
        navigation: {
            style: {
                fontWeight: 'bold',
                color: textMainColor,
            }
        }
    },
    credits: {
        style: {
            color: '#666'
        }
    },
    drilldown: {
        activeAxisLabelStyle: {
            color: dataLabelsColor
        },
        activeDataLabelStyle: {
            color: dataLabelsColor
        }
    },
    navigation: {
        buttonOptions: {
            symbolStroke: '#DDDDDD',
            theme: {
                fill: minorGridLineColor
            }
        }
    },
    // scroll charts
    rangeSelector: {
        buttonTheme: {
            fill: minorGridLineColor,
            stroke: strokeColor,
            style: {
                color: '#CCC'
            },
            states: {
                hover: {
                    fill: lineColor,
                    stroke: strokeColor,
                    style: {
                        color: 'white'
                    }
                },
                select: {
                    fill: '#000003',
                    stroke: strokeColor,
                    style: {
                        color: 'white'
                    }
                }
            }
        },
        inputBoxBorderColor: minorGridLineColor,
        inputStyle: {
            backgroundColor: '#333',
            color: 'silver'
        },
        labelStyle: {
            color: 'silver'
        }
    },
    navigator: {
        handles: {
            backgroundColor: '#666',
            borderColor: '#AAA'
        },
        outlineColor: '#CCC',
        maskFill: 'rgba(255,255,255,0.1)',
        series: {
            color: '#7798BF',
            lineColor: '#A6C7ED'
        },
        xAxis: {
            gridLineColor: minorGridLineColor
        }
    },
    scrollbar: {
        barBackgroundColor: '#808083',
        barBorderColor: '#808083',
        buttonArrowColor: '#CCC',
        buttonBackgroundColor: hiddenStyleColor,
        buttonBorderColor: hiddenStyleColor,
        rifleColor: '#FFF',
        trackBackgroundColor: '#404043',
        trackBorderColor: '#404043'
    }
};