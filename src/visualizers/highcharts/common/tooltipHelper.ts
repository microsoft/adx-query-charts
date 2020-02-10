'use strict';

import { DraftColumnType, DateFormat, IColumn, IChartOptions } from "../../../common/chartModels";
import { Utilities } from "../../../common/utilities";

export class TooltipHelper {
    public static getSingleTooltip(chartOptions: IChartOptions, context: Highcharts.TooltipFormatterContextObject, column: IColumn, originalValue: any, columnName?: string, valueSuffix: string = ''): string {
        let formattedValue = '';
        
        if(originalValue !== undefined) {
            formattedValue = TooltipHelper.getFormattedValue(chartOptions, originalValue, column.type);
        }

        return `<tr><td style="color:${context.color}">${columnName || column.name}: </td><td><b>${formattedValue + valueSuffix}</b></td></tr>`;
    }

    private static getFormattedValue(chartOptions: IChartOptions, originalValue: number, columnType: DraftColumnType): string {
        if(chartOptions.numberFormatter && Utilities.isNumeric(columnType)) {
            return chartOptions.numberFormatter(originalValue);
        } else if(Utilities.isDate(columnType)) {
            const localWithOffsetDate = new Date(originalValue); // HC gets the local date + utc offset addition
            const utcWithOffsetDateValue = localWithOffsetDate.valueOf() + (localWithOffsetDate.getTimezoneOffset() * 60 * 1000); // Add the local offset. This way the utc offset addition is added to the UTC, and not to the local
            const utcWithOffsetDate = new Date(utcWithOffsetDateValue);

            return chartOptions.dateFormatter ? chartOptions.dateFormatter(utcWithOffsetDate, DateFormat.FullDate) : utcWithOffsetDate.toString();
        }

        return originalValue.toString();
    }
}