'use strict';

//#region Imports

import { IVisualizerOptions } from './IVisualizerOptions';

//#endregion Imports

export interface IVisualizer {
    /**
     * Draw the chart on an existing DOM element
     * @param options - The information required to the visualizer to draw the chart
     */
    drawNewChart(options: IVisualizerOptions): void;
}