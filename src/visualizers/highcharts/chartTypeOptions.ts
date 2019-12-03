'use strict';

export interface ChartTypeOptions {
    chartType: string;
    plotOptions?: Highcharts.PlotOptions; // See: https://api.highcharts.com/highcharts/plotOptions
}

export const PERCENTAGE = 'percent';
export const STACKED = 'normal';
export const UNSTACKED = undefined;