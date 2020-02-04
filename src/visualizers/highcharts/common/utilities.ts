'use strict';

import { DraftColumnType, IColumn, IRow } from "../../../common/chartModels";

export class HC_Utilities {
    public static getYValue(columns: IColumn[], row: IRow, yAxisIndex: number): number {
        const originalValue = row[yAxisIndex];
        const column = columns[yAxisIndex];

        // Highcharts support only numeric y-axis data - if the y-axis isn't a number (can be a string that represents a number "0.005" for example) - convert it to number
        if(typeof originalValue === 'string') {
            if(column.type === DraftColumnType.Decimal) {
                return parseFloat(originalValue);
            } else if (column.type === DraftColumnType.Int) {
                return parseInt(originalValue);
            }

            return Number(originalValue);
        }
        
        return originalValue;  
    }
}