'use strict';

import { IChartInfo, AggregationType, DrawChartStatus } from "./chartModels";

export class ChartInfo implements IChartInfo {
    public numberOfDataPoints: number = 0;
    public isPartialData: boolean = false;
    public isAggregationApplied: boolean = false;
    public status: DrawChartStatus = DrawChartStatus.Success;
}