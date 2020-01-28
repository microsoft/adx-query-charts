'use strict';

import { IVisualizer } from "../../src/visualizers/IVisualizer";
import { IVisualizerOptions } from "../../src/visualizers/IVisualizerOptions";
import { Changes } from "../../src/common/chartChange";
import { ChartTheme } from "../../src/common/chartModels";

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
	
    public downloadChartJPGImage(onError?: (error: Error) => void): void {
        // Do nothing
    }
}