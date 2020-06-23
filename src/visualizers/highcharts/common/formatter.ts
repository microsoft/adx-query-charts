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
          
    public static getChartTooltipFormatter(chartOptions: IChartOptions): Highcharts.TooltipFormatterCallbackFunction {
        return function () {
            const context = this;

            // X axis
            const xAxisColumn = chartOptions.columnsSelection.xAxis;
            const xColumnTitle = chartOptions.xAxisTitleFormatter ? chartOptions.xAxisTitleFormatter(xAxisColumn) : undefined;
            let tooltip = Formatter.getSingleTooltip(chartOptions, xAxisColumn, context.x, xColumnTitle);

            // Y axis
            const yAxes = chartOptions.columnsSelection.yAxes;
            let yColumn;
            
            if(yAxes.length === 1) {
                yColumn = yAxes[0];
            } else { // Multiple y-axes - find the current y column
                const yColumnIndex = _.findIndex(yAxes, (col) => { 
                    return col.name === context.series.name 
                });

                yColumn = yAxes[yColumnIndex];
            }

            tooltip += Formatter.getSingleTooltip(chartOptions, yColumn, context.y);
            
            // Split by
            const splitBy = chartOptions.columnsSelection.splitBy;

            if(splitBy && splitBy.length > 0) {
                tooltip += Formatter.getSingleTooltip(chartOptions, splitBy[0], context.series.name);
            }
            
            return '<table>' + tooltip + '</table>';
        }
    }

    public static getLabelsFormatter(chartOptions: IChartOptions, column: IColumn, useHTML: boolean): Highcharts.FormatterCallbackFunction<Highcharts.AxisLabelsFormatterContextObject> {
        return function() {
            const dataPoint = this;
            const value = dataPoint.value;
            const formattedValue = Formatter.getFormattedValue(chartOptions, value, column.type, HighchartsDateFormatToCommon[dataPoint['dateTimeLabelFormat']]);

            return useHTML ? `<span title="${formattedValue}">${formattedValue}</span>` : formattedValue;
        }
    }

    private static getFormattedValue(chartOptions: IChartOptions, originalValue: number, columnType: DraftColumnType, dateFormat: DateFormat = DateFormat.FullDate): string {
        if(chartOptions.numberFormatter && Utilities.isNumeric(columnType) && typeof originalValue === 'number') {   
            return chartOptions.numberFormatter(originalValue);
        } else if(Utilities.isDate(columnType)) {
            return chartOptions.dateFormatter ? chartOptions.dateFormatter(originalValue, dateFormat) : new Date(originalValue).toString();
        }

        return originalValue.toString();
    }
}