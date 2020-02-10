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
            const localDate = new Date(originalValue); // HC gets the local date + utc offset addition
            const utcDateValue = localDate.valueOf() + (localDate.getTimezoneOffset() * 60 * 1000);

            return chartOptions.dateFormatter ? chartOptions.dateFormatter(new Date(utcDateValue), DateFormat.FullDate) : utcDateValue.toString();
        }

        return originalValue.toString();
    }
}