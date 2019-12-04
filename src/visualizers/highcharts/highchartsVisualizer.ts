'use strict';

//#region Imports

import * as _ from 'lodash';
import { Chart } from './charts/chart';
import { IVisualizer } from '../IVisualizer';
import { IVisualizerOptions } from '../IVisualizerOptions';
import { ChartFactory } from './charts/chartFactory';
import { ChartTheme } from '../../common/chartModels';
import { ResizeSensor } from '../../external/css-element-queries/resizeSensor';

//#endregion Imports

export class HighchartsVisualizer implements IVisualizer {
    private currentChart: Chart;

    public drawNewChart(options: IVisualizerOptions): void {
        this.currentChart = ChartFactory.create(options);

        // Draw the chart
        this.currentChart.draw();
        
        // Highcharts handle resize only on window resize, we need to handle resize when the chart's container size changes
        const chartContainer = document.querySelector('#' + options.elementId);

        new ResizeSensor(chartContainer, () => {
            this.currentChart.highchartsChart.reflow();
        });
    }
    
    public changeTheme(newTheme: ChartTheme): void {
        // No existing chart - do nothing
        if(!this.currentChart) {
            return;
        }

        this.currentChart.changeTheme(newTheme);
    }
}