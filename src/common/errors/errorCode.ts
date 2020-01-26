'use strict';

export enum ErrorCode {
    InvalidQueryResultData = 'InvalidQueryResultData',
    InvalidColumnsSelection = 'InvalidColumnsSelection',
    UnsupportedTypeInColumnsSelection = 'UnsupportedTypeInColumnsSelection',
    InvalidChartContainerElementId = 'InvalidChartContainerElementId',
    InvalidDate = 'InvalidDate',
    FailedToCreateVisualization = 'FailedToCreateVisualization',
    PieContainsOnlyZeros = 'PieContainsOnlyZeros'
}