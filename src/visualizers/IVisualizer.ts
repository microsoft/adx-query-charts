'use strict';

//#region Imports

import { Changes } from '../common/chartChange';
import { ChartTheme } from '../common/chartModels';
import { IVisualizerOptions } from './IVisualizerOptions';

//#endregion Imports

export interface IVisualizer {
    /**
     * Draw the chart on an existing DOM element
     * @param options - The information required to the visualizer to draw the chart
     * @returns Promise that is resolved when the chart is finished drawing 
     */
    drawNewChart(options: IVisualizerOptions): Promise<void>;
     
    /**
     * Update an existing chart
     * @param options - The information required to the visualizer to draw the chart
     * @param changes - The changes to apply
     * @returns Promise that is resolved when the chart is finished drawing
     */
    updateExistingChart(options: IVisualizerOptions, changes: Changes): Promise<void>;
       
    /**
     * Change the theme of an existing chart
     * @param newTheme - The theme to apply
     * @returns Promise that is resolved when the theme is applied
     */
    changeTheme(newTheme: ChartTheme): Promise<void>;
		
    /**
     * Download the chart as JPEG image
     * @param onError - [Optional] A callback that will be called if the module failed to export the chart image
     */
    downloadChartJPEGImage(onError?: (error: Error) => void): void;
		
    /**
     * Download the chart as PNG image
     * @param onError - [Optional] A callback that will be called if the module failed to export the chart image
     */
    downloadChartPNGImage(onError?: (error: Error) => void): void;
		
    /**
     * Download the chart as PDF
     * @param onError - [Optional] A callback that will be called if the module failed to export the chart image
     */
    downloadChartPDF(onError?: (error: Error) => void): void;
		
    /**
     * Download the chart as SVG image
     * @param onError - [Optional] A callback that will be called if the module failed to export the chart image
     */
    downloadChartSVG(onError?: (error: Error) => void): void;
		
    /**
     * Open fullscreen version
     */
    fullscreen(onError?: (error: Error) => void): void;
		
    /**
     * print chart
     */
    print(onError?: (error: Error) => void): void;
}