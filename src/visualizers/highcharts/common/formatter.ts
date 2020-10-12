'use strict';

import * as _ from 'lodash';
import { HighchartsDateFormatToCommon } from "../highchartsDateFormatToCommon";
import { DraftColumnType, DateFormat, IColumn, IChartOptions } from "../../../common/chartModels";
import { Utilities } from "../../../common/utilities";

export class Formatter {
    public static getSingleTooltip(chartOptions: IChartOptions, column: IColumn, originalValue: any, columnName?: string, valueSuffix: string = ''): string {
        const maxLabelWidth: number = 100;
        let formattedValue = '';
        
        if(originalValue != undefined) {
            formattedValue = Formatter.getFormattedValue(chartOptions, originalValue, column.type);
            
            // Truncate the value if it's too long
            if(originalValue.length > maxLabelWidth) {
                formattedValue = formattedValue.slice(0, maxLabelWidth) + '...';
            }
        }

        return `<tr><td>${columnName || column.name}: </td><td><b>${formattedValue + valueSuffix}</b></td></tr>`;
    }
          
    public static getLabelsFormatter(chartOptions: IChartOptions, column: IColumn, useHTML: boolean): Highcharts.FormatterCallbackFunction<Highcharts.AxisLabelsFormatterContextObject<number>> {
        return function() {
            const dataPoint = this;
            const value = dataPoint.value;
            const formattedValue = Formatter.getFormattedValue(chartOptions, value, column.type, HighchartsDateFormatToCommon[dataPoint['dateTimeLabelFormat']]);

            return useHTML ? `<span title="${formattedValue}">${formattedValue}</span>` : formattedValue;
        }
    }

    private static getFormattedValue(chartOptions: IChartOptions, originalValue: any, columnType: DraftColumnType, dateFormat: DateFormat = DateFormat.FullDate): string {
        if(chartOptions.numberFormatter && Utilities.isNumeric(columnType) && typeof originalValue === 'number') {   
            return chartOptions.numberFormatter(originalValue);
        } else if(Utilities.isDate(columnType)) {
            return chartOptions.dateFormatter ? chartOptions.dateFormatter(originalValue, dateFormat) : new Date(originalValue).toString();
        }

        return originalValue != null ? originalValue.toString() : '';
    }
}