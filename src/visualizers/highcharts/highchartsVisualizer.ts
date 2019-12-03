'use strict';

//#region Imports

import * as _ from 'lodash';
import * as Highcharts from 'highcharts';
import { IVisualizer } from '../IVisualizer';
import { IVisualizerOptions } from '../IVisualizerOptions';
import { HighchartsChartFactory } from './charts/highchartsChartFactory';

//#endregion Imports

export class HighchartsVisualizer implements IVisualizer {
    public drawNewChart(options: IVisualizerOptions): void {
        const chart = HighchartsChartFactory.create(options);
        const highchartsOptions = chart.getHighchartsOptions();

        // Draw the chart
        Highcharts.chart(options.elementId, highchartsOptions);
    }
}