'use strict';

import { IQueryResultData, DraftColumnType, IColumn, IRow } from "../../../common/chartModels";

export class Utilities {
    public static getYValue(columns: IColumn[], row: IRow, yAxisIndex: number): number {
        const originalValue = row[yAxisIndex];
        const column = columns[yAxisIndex];

        if(column.type === DraftColumnType.Decimal && typeof originalValue === 'string') {
            return parseFloat(originalValue); // Highcharts support only numeric y-axis data
        }

        return <any>originalValue;
    }
}