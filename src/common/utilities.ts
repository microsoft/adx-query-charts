'use strict';

import * as moment from 'moment';
import { IQueryResultData, IColumn, DraftColumnType } from './chartModels';

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
    * Adds the desired offset (from UTC) to the date, and return a valid Date object
    * @param dateStr - The string value that represents the date to transform.
    * @param utcOffset - The offset from UTC.
    * @returns A valid Date object.
    */
    public static getValidDate(dateStr: string, utcOffset: number): Date {
        const date = new Date(dateStr);
        
        if (date.toDateString() === 'Invalid Date') {
            return null;
        }
        
        const utcVal = date.toUTCString();
        const utcMoment = moment.utc(utcVal, 'ddd, DD MMM YYYY HH:mm:ss Z');
        
        if (!utcMoment.isValid()) {
            return null;
        }
        
        const dateWithOffset = utcMoment.utcOffset(utcOffset);
        let isoDateStr = dateWithOffset.format('YYYY-MM-DDTHH:mm:ss');

        // Since moment.utc doesn't update milliseconds add the milliseconds to the isoDateStr
        isoDateStr += '.' + (date.getMilliseconds() || 0);

        return new Date(isoDateStr);
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
}