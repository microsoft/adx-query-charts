'use strict';

import { IQueryResultData, IChartOptions } from "../common/chartModels";

export interface IVisualizerOptions {
    elementId: string;
    queryResultData: IQueryResultData;
    chartOptions: IChartOptions
}