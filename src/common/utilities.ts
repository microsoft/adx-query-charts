'use strict';

import { IQueryResultData, IColumn, DraftColumnType, ChartType } from './chartModels';

export class Utilities {
    // Returns the index of the column with the same name and type in the columns array
    public static getColumnIndex(queryResultData: IQueryResultData, columnToFind: IColumn): number {
        const columns: IColumn[] = queryResultData && queryResultData.columns;

        if (!columns) {
            return -1;
        }

        for (let i = 0; i < columns.length; i++) {
            const currentColumn: IColumn = columns[i];

            if (Utilities.areColumnsEqual(currentColumn, columnToFind)) {
                return i;
            }
        }

        return -1;
    } 
    
    /**
    * Returns the value of the local date after adding the desired offset (from UTC)
    * @param dateStr - The string value that represents the date to transform.
    * @param utcOffset - The offset in hours from UTC.
    * @returns The value of the date + the desired UTC offset
    */
    public static getDateValue(dateStr: string, utcOffset: number): number {
        const date = new Date(dateStr);
        
        if (date.toDateString() === 'Invalid Date') {
            return null;
        }
        
        // Add UTC offset to the date
        const utcOffsetInMilliseconds = utcOffset * 60 * 60 * 1000;
        const localDateValue = date.valueOf();
       
        return localDateValue + utcOffsetInMilliseconds;
    }

    public static isValidDate(str: string): boolean {
        const date = new Date(str);

        return date && date.toString() !== 'Invalid Date';
    }

    public static isNumeric(columnType: DraftColumnType): boolean {
        return columnType === DraftColumnType.Int ||
               columnType === DraftColumnType.Long ||
               columnType === DraftColumnType.Real ||
               columnType === DraftColumnType.Decimal;
    }

    public static isDate(columnType: DraftColumnType): boolean {
        return columnType === DraftColumnType.DateTime ||
               columnType === DraftColumnType.TimeSpan;
    }

    public static areColumnsEqual(first: IColumn, second: IColumn): boolean {
        return first.name == second.name && first.type == second.type;
    }

    public static isPieOrDonut(chartType: ChartType): boolean {
        return chartType === ChartType.Pie || chartType === ChartType.Donut;
    }
}