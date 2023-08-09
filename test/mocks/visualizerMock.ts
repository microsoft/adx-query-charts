'use strict';

import { Changes } from "../../src/common/chartChange";
import { ChartTheme } from "../../src/common/chartModels";
import { IVisualizer } from "../../src/visualizers/IVisualizer";
import { IVisualizerOptions } from "../../src/visualizers/IVisualizerOptions";

//#region Imports

//#endregion Imports

export class VisualizerMock implements IVisualizer {
    public drawNewChart(options: IVisualizerOptions): Promise<void> {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }
   
    public updateExistingChart(options: IVisualizerOptions, changes: Changes): Promise<void> {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }
    
    public changeTheme(newTheme: ChartTheme): Promise<void> {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }
	
    public downloadChartJPEGImage(onError?: (error: Error) => void): void {
        // Do nothing
    }
	
    public downloadChartPDF(onError?: (error: Error) => void): void {
        // Do nothing
    }
	
    public downloadChartPNGImage(onError?: (error: Error) => void): void {
        // Do nothing
    }
	
    public downloadChartSVG(onError?: (error: Error) => void): void {
        // Do nothing
    }
	
    public fullscreen(): void {
        // Do nothing
    }
	
    public print(): void {
        // Do nothing
    }
}