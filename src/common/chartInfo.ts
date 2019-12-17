'use strict';

import { IChartInfo, AggregationType, DrawChartStatus } from "./chartModels";

export class ChartInfo implements IChartInfo {
    public numberOfDataPoints: number;
    public wasDataLimited: boolean;
    public status: DrawChartStatus = DrawChartStatus.Success;
    public appliedAggregation?: AggregationType;
}