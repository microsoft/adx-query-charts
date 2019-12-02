'use strict';

import { ChartType } from '../../common/chartModels';

export interface ChartTypeOptions {
    chartType: string;
    plotOptions?: Highcharts.PlotOptions;
}

const PERCENTAGE = 'percent';
const STACKED = 'normal';
const UNSTACKED = undefined;

// See: https://api.highcharts.com/highcharts/plotOptions
export const CommonChartTypeToHighcharts: { [key in ChartType]: ChartTypeOptions; } = {
    [ChartType.Line]: {
        chartType: 'line',
        plotOptions: {
            line:  {
                stacking: UNSTACKED
            }
        }
    },
    [ChartType.Scatter]: {
        chartType: 'scatter',
        plotOptions: {
            scatter:  {
                stacking: UNSTACKED
            }
        }
    },
    [ChartType.UnstackedArea]: {
        chartType: 'area',
        plotOptions: {
            area:  {
                stacking: UNSTACKED
            }
        }
    },
    [ChartType.StackedArea]: {
        chartType: 'area',
        plotOptions: {
            area: {
                stacking: STACKED
            }
        }
    },
    [ChartType.PercentageArea]: {
        chartType: 'area',
        plotOptions: {
            area: {
              stacking: PERCENTAGE
            }
        }
    },
    [ChartType.UnstackedColumn]: {
        chartType: 'column',
        plotOptions: {
            column: {
              stacking: UNSTACKED
            }
        }
    },
    [ChartType.StackedColumn]: {
        chartType: 'column',
        plotOptions: {
            column: {
                stacking: STACKED
            }
        }
    },
    [ChartType.PercentageColumn]: {
        chartType: 'column',
        plotOptions: {
            column: {
                stacking: PERCENTAGE
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