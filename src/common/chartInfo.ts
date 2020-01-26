'use strict';

import { IChartInfo, IDataTransformationInfo, DrawChartStatus } from "./chartModels";
import { ChartError } from "./errors/errors";

export class ChartInfo implements IChartInfo {
    public dataTransformationInfo: IDataTransformationInfo = {
        numberOfDataPoints: 0,
        isPartialData: false,
        isAggregationApplied: false
    };

    public status: DrawChartStatus = DrawChartStatus.Success;
    public error?: ChartError;
}