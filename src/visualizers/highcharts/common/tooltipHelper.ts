'use strict';

import { DraftColumnType, DateFormat, IColumn, IChartOptions } from "../../../common/chartModels";
import { Utilities } from "../../../common/utilities";

export class TooltipHelper {
    public static getSingleTooltip(chartOptions: IChartOptions, context: Highcharts.TooltipFormatterContextObject, column: IColumn, originalValue: any, columnName?: string, valueSuffix: string = ''): string {
        let formattedValue = '';
        
        if(originalValue !== undefined) {
            formattedValue = TooltipHelper.getFormattedValue(chartOptions, originalValue, column.type);
        }

        return `<tr><td>${columnName || column.name}: </td><td><b>${formattedValue + valueSuffix}</b></td></tr>`;
    }

    private static getFormattedValue(chartOptions: IChartOptions, originalValue: number, columnType: DraftColumnType): string {
        if(chartOptions.numberFormatter && Utilities.isNumeric(columnType)) {
            return chartOptions.numberFormatter(originalValue);
        } else if(Utilities.isDate(columnType)) {
            return chartOptions.dateFormatter ? chartOptions.dateFormatter(originalValue, DateFormat.FullDate) : new Date(originalValue).toString();
        }

        return originalValue.toString();
    }
}