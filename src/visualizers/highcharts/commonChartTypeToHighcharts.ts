'use strict';

import { ChartType } from '../../common/chartModels';

export interface ChartTypeOptions {
    chartType: string;
    plotOptions?: Highcharts.PlotOptions;
}

// See: https://api.highcharts.com/highcharts/plotOptions
export const CommonChartTypeToHighcharts: { [key in ChartType]: ChartTypeOptions; } = {
    [ChartType.Line]: {
        chartType: 'line',
        plotOptions: {
            line: {
              stacking: undefined
            }
        }
    },
    [ChartType.Scatter]: {
        chartType: 'scatter',
        plotOptions: {
            scatter: {
              stacking: undefined
            }
        }
    },
    [ChartType.Area]: {
        chartType: 'area',
        plotOptions: {
            area: {
              stacking: undefined
            }
        }
    },
    [ChartType.StackedArea]: {
        chartType: 'area',
        plotOptions: {
            area: {
              stacking: 'normal'
            }
        }
    },
    [ChartType.PercentageArea]: {
        chartType: 'area',
        plotOptions: {
            area: {
              stacking: 'percent'
            }
        }
    },
    [ChartType.Column]: {
        chartType: 'column',
        plotOptions: {
            column: {
              stacking: undefined
            }
        }
    },
    [ChartType.StackedColumn]: {
        chartType: 'column',
        plotOptions: {
            column: {
                stacking: 'normal'
            }
        }
    },
    [ChartType.PercentageColumn]: {
        chartType: 'column',
        plotOptions: {
            column: {
                stacking: 'percent'
            }
        }
    },
    [ChartType.Pie]: {
        chartType: 'pie',
        plotOptions: {
            pie: {
                innerSize: '0'
            }
        }
    },
    [ChartType.Donut]: {
        chartType: 'pie',
        plotOptions: {
            pie: {
                innerSize: '40%'
            }
        }
    },
}