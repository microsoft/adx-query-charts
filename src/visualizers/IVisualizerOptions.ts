'use strict';

import { IQueryResultData, IChartOptions, IChartInfo } from "../common/chartModels";

export interface IVisualizerOptions {
    elementId: string;
    queryResultData: IQueryResultData;
    chartOptions: IChartOptions;
    chartInfo: IChartInfo;
}