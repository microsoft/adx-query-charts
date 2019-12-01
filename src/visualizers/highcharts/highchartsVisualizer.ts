'use strict';

//#region Imports

import * as _ from 'lodash';
import * as Highcharts from 'highcharts';
import { IChartOptions } from '../../common/chartModels';
import { Utilities } from '../../common/utilities';
import { IVisualizer } from '../IVisualizer';
import { IVisualizerOptions } from '../IVisualizerOptions';
import { DataTransformer } from './dataTransformer';

//#endregion Imports

export class HighchartsVisualizer implements IVisualizer {
    public drawNewChart(options: IVisualizerOptions): void {
        const chartOptions = options.chartOptions;
        const isDatetimeAxis = Utilities.isDate(chartOptions.columnsSelection.xAxis.type);
        const categoriesAndSeries = DataTransformer.getCategoriesAndSeries(options, isDatetimeAxis);

        const highchartsOptions: Highcharts.Options = {
            chart: {
                type: 'column'
            },
            xAxis: {
                type: isDatetimeAxis ? 'datetime' : undefined,
                categories: categoriesAndSeries.categories,
                title: {
                    text: this.getXAxisTitle(options.chartOptions),
                    align: 'middle'
                }
            },
            yAxis: this.getYAxis(chartOptions),
            series: categoriesAndSeries.series
        };

        // Draw the chart
        Highcharts.chart(options.elementId, highchartsOptions);
    }
    
    //#region Private methods

    private getYAxis(chartOptions: IChartOptions): Highcharts.YAxisOptions {
        const yAxis = chartOptions.columnsSelection.yAxes[0];
        const yAxisOptions = {
            title: {
                text: yAxis.name
            }
        }
        
        return yAxisOptions;
    }

    private getXAxisTitle(chartOptions: IChartOptions): string {
        const xAxisColumn = chartOptions.columnsSelection.xAxis;

        return xAxisColumn.name;
    }

    //#endregion Private methods
}