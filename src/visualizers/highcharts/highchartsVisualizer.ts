'use strict';

//#region Imports

import * as _ from 'lodash';
import { ResizeSensor } from 'css-element-queries';
import { Chart } from './charts/chart';
import { IVisualizer } from '../IVisualizer';
import { IVisualizerOptions } from '../IVisualizerOptions';
import { ChartFactory } from './charts/chartFactory';
import { ChartTheme } from '../../common/chartModels';

//#endregion Imports

export class HighchartsVisualizer implements IVisualizer {
    private currentChart: Chart;
    private chartContainerResizeSensor: ResizeSensor;

    public drawNewChart(options: IVisualizerOptions): void {
        this.currentChart = ChartFactory.create(options);

        // Draw the chart
        this.currentChart.draw();
        
        this.handleResize();
    }
    
    public changeTheme(newTheme: ChartTheme): void {
        // No existing chart - do nothing
        if(!this.currentChart) {
            return;
        }

        this.currentChart.changeTheme(newTheme);
    }

    // Highcharts handle resize only on window resize, we need to handle resize when the chart's container size changes
    private handleResize(): void {        
        const chartContainer = document.querySelector('#' + this.currentChart.options.elementId);
    
        if(this.chartContainerResizeSensor) {
            // Remove the previous resize sensor, and stop listening to resize events
            this.chartContainerResizeSensor.detach();
        }
    
        this.chartContainerResizeSensor = new ResizeSensor(chartContainer, () => {
            this.currentChart.highchartsChart.reflow();
        });
    }
}