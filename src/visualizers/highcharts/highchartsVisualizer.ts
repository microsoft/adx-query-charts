'use strict';

//#region Imports

import * as _ from 'lodash';
import * as Highcharts from 'highcharts';
import { Chart } from './charts/chart';
import { IVisualizer } from '../IVisualizer';
import { IVisualizerOptions } from '../IVisualizerOptions';
import { ChartFactory } from './charts/chartFactory';
import { ChartTheme } from '../../common/chartModels';
import { Themes } from './themes/themes';

//#endregion Imports

export class HighchartsVisualizer implements IVisualizer {
    private currentChart: Chart;

    public drawNewChart(options: IVisualizerOptions): void {
        this.currentChart = ChartFactory.create(options);

        // Draw the chart
        this.currentChart.draw();
    }
    
    public changeTheme(newTheme: ChartTheme): void {
        // No existing chart - do nothing
        if(!this.currentChart) {
            return;
        }

        this.currentChart.changeTheme(newTheme);
    }
}