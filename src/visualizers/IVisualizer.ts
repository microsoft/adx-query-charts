'use strict';

//#region Imports

import { IVisualizerOptions } from './IVisualizerOptions';
import { ChartTheme } from '../common/chartModels';
import { Changes } from '../common/chartChange';

//#endregion Imports

export interface IVisualizer {
    /**
     * Draw the chart on an existing DOM element
     * @param options - The information required to the visualizer to draw the chart
     */
    drawNewChart(options: IVisualizerOptions): Promise<void>;
     
    /**
     * Update an existing chart
     * @param options - The information required to the visualizer to draw the chart
     * @param changes - The changes to apply
     */
    updateExistingChart(options: IVisualizerOptions, changes: Changes): Promise<void>;
       
    /**
     * Change the theme of an existing chart
     * @param newTheme - The theme to apply
     */
    changeTheme(newTheme: ChartTheme): void;
}