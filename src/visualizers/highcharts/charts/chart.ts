'use strict';

//#region Imports

import * as _ from 'lodash';
import * as Highcharts from 'highcharts';
import { TooltipHelper } from '../tooltipHelper';
import { IVisualizerOptions } from '../../IVisualizerOptions';
import { Utilities } from '../../../common/utilities';
import { IColumn, IChartOptions } from '../../../common/chartModels';
import { InvalidInputError } from '../../../common/errors/errors';
import { ErrorCode } from '../../../common/errors/errorCode';
import { ANIMATION_DURATION_MS } from '../common/constants';

//#endregion Imports

export interface ICategoriesAndSeries {
    categories?: string[];
    series: any[];
}

export abstract class Chart {
    private static defaultPlotOptions: Highcharts.PlotOptions = {
        series: {
            animation: {
                duration: ANIMATION_DURATION_MS
            }
        }
    };
    
    public getStandardCategoriesAndSeries(options: IVisualizerOptions): ICategoriesAndSeries {
        const chartOptions = options.chartOptions;
        const xColumn: IColumn = chartOptions.columnsSelection.xAxis;
        const isDatetimeAxis: boolean = Utilities.isDate(xColumn.type);
        const xAxisColumnIndex: number =  Utilities.getColumnIndex(options.queryResultData, xColumn);
        const yAxesIndexes = _.map(chartOptions.columnsSelection.yAxes, (yAxisColumn) => {
            return Utilities.getColumnIndex(options.queryResultData, yAxisColumn);
        });

        const categoriesAndSeries: ICategoriesAndSeries = {
            series: [],
            categories: isDatetimeAxis ? undefined : [] 
        };

        const seriesMap = {};

        options.queryResultData.rows.forEach((row) => {
            let xAxisValue: any = row[xAxisColumnIndex];
    
            // If the x-axis is a date, convert its value to milliseconds as this is what expected by 'Highcharts'
            if(isDatetimeAxis) {
                xAxisValue = Utilities.getDateValue(xAxisValue, chartOptions.utcOffset);

                if(!xAxisValue) {
                    throw new InvalidInputError(`The x-axis value '${row[xAxisColumnIndex]}' is an invalid date`, ErrorCode.InvalidDate);
                }
            } else {
                categoriesAndSeries.categories.push(xAxisValue);
            }

            _.forEach(yAxesIndexes, (yAxisIndex, i) => {
                const yAxisColumnName = chartOptions.columnsSelection.yAxes[i].name;
                const yAxisValue = row[yAxisIndex];
                
                if(!seriesMap[yAxisColumnName]) {
                    seriesMap[yAxisColumnName] = [];
                }

                const data = isDatetimeAxis? [xAxisValue, yAxisValue] : yAxisValue;
                
                seriesMap[yAxisColumnName].push(data);
            });
        });
            
        for (let yAxisColumnName in seriesMap) {
            categoriesAndSeries.series.push({
                name: yAxisColumnName,
                data: seriesMap[yAxisColumnName]
            });
        }

        return categoriesAndSeries;
    }
    
    public getSplitByCategoriesAndSeries(options: IVisualizerOptions): ICategoriesAndSeries {
        const xColumn: IColumn =  options.chartOptions.columnsSelection.xAxis;
        const isDatetimeAxis: boolean = Utilities.isDate(xColumn.type);
        const xAxisColumnIndex: number =  Utilities.getColumnIndex(options.queryResultData, xColumn);

        if(isDatetimeAxis) {
            return this.getSplitByCategoriesAndSeriesForDateXAxis(options, xAxisColumnIndex);
        }

        const columnsSelection = options.chartOptions.columnsSelection;
        const yAxisColumn = columnsSelection.yAxes[0];
        const splitByColumn = columnsSelection.splitBy[0];
        const yAxisColumnIndex = Utilities.getColumnIndex(options.queryResultData, yAxisColumn);
        const splitByColumnIndex = Utilities.getColumnIndex(options.queryResultData, splitByColumn);
        const uniqueXValues = {};
        const uniqueSplitByValues = {};            
        const categoriesAndSeries: ICategoriesAndSeries = {
            series: [],
            categories: undefined
        };

        options.queryResultData.rows.forEach((row) => {
        	const xValue = row[xAxisColumnIndex];
        	const yValue = row[yAxisColumnIndex];
        	const splitByValue = row[splitByColumnIndex];
        
        	if(!uniqueXValues[xValue]) {
        		uniqueXValues[xValue] = true;
        	}
        
        	if(!uniqueSplitByValues[splitByValue]) {
        		uniqueSplitByValues[splitByValue] = {};
        	}
        
        	uniqueSplitByValues[splitByValue][xValue] = yValue;
        });
        
        // Populate X-Axis
        categoriesAndSeries.categories = _.keys(uniqueXValues);

        // Populate Split by
        for (let splitByValue in uniqueSplitByValues) {
        	const currentSeries = {
        		name: splitByValue,
        		data: []
        	};
        
        	const xValueToYValueMap = uniqueSplitByValues[splitByValue];
        	
        	// Set a split-by value for each unique x value
        	categoriesAndSeries.categories.forEach((xValue) => {
        		const yValue = xValueToYValueMap[xValue] || null;
        
        		currentSeries.data.push(yValue);
        	});
        
        	categoriesAndSeries.series.push(currentSeries);
        }

        return categoriesAndSeries;
    }

    public getChartTypeOptions(): Highcharts.Options {
        return {
            chart: {
                type: this.getChartType()
            },
            plotOptions: { ...Chart.defaultPlotOptions, ...this.plotOptions() }
        };
    }
        
    public getChartTooltipFormatter(chartOptions: IChartOptions): Highcharts.TooltipFormatterCallbackFunction {
        return function () {
            const context = this;

            // X axis
            const xAxisColumn = chartOptions.columnsSelection.xAxis;
            const xColumnTitle = chartOptions.xAxisTitleFormatter ? chartOptions.xAxisTitleFormatter(xAxisColumn) : undefined;
            let tooltip = TooltipHelper.getSingleTooltip(chartOptions, context, xAxisColumn, this.x, xColumnTitle);

            // Y axis
            const yAxes = chartOptions.columnsSelection.yAxes;
            let yColumn;
            
            if(yAxes.length === 1) {
                yColumn = yAxes[0];
            } else { // Multiple y-axes - find the current y column
                const yColumnIndex = _.findIndex(yAxes, (col) => { 
                    return col.name === this.series.name 
                });

                yColumn = yAxes[yColumnIndex];
            }

            tooltip += TooltipHelper.getSingleTooltip(chartOptions, context, yColumn, this.y);
            
            // Split by
            const splitBy = chartOptions.columnsSelection.splitBy;

            if(splitBy && splitBy.length > 0) {
                tooltip += TooltipHelper.getSingleTooltip(chartOptions, context, splitBy[0], this.series.name);
            }
            
            return '<table>' + tooltip + '</table>';
        }
    }

    public verifyInput(options: IVisualizerOptions): void {    
        const columnSelection = options.chartOptions.columnsSelection;

        if(columnSelection.splitBy && columnSelection.splitBy.length > 1) {
            throw new InvalidInputError(`Multiple split-by columns selection isn't allowed for ${options.chartOptions.chartType}`, ErrorCode.InvalidColumnsSelection);
        }
    }

    //#region Abstract methods

    protected abstract getChartType(): string;

    protected abstract plotOptions(): Highcharts.PlotOptions;

    //#endregion Abstract methods

    //#region Private methods

    private getSplitByCategoriesAndSeriesForDateXAxis(options: IVisualizerOptions, xAxisColumnIndex: number): ICategoriesAndSeries {
        const columnsSelection = options.chartOptions.columnsSelection;
        const yAxisColumn = columnsSelection.yAxes[0];
        const splitByColumn = columnsSelection.splitBy[0];
        const yAxisColumnIndex = Utilities.getColumnIndex(options.queryResultData, yAxisColumn);
        const splitByColumnIndex = Utilities.getColumnIndex(options.queryResultData, splitByColumn);
        const splitByMap = {};
        const series = [];

        options.queryResultData.rows.forEach((row) => {
            const splitByValue: string = <string>row[splitByColumnIndex];
            const yValue = row[yAxisColumnIndex];
            let xValue = row[xAxisColumnIndex];

            // For date the a-axis, convert its value to ms as this is what expected by Highcharts
            xValue = Utilities.getDateValue(<string>xValue, options.chartOptions.utcOffset);
         
            if(!xValue) {
                throw new InvalidInputError(`The x-axis value '${row[xAxisColumnIndex]}' is an invalid date`, ErrorCode.InvalidDate);
            }

            if(!splitByMap[splitByValue]) {
                splitByMap[splitByValue] = [];
            }

            splitByMap[splitByValue].push([xValue, yValue]);
        });

        for (let splitByValue in splitByMap) {
            series.push({
                name: splitByValue,
                data: splitByMap[splitByValue]
            });
        }

        return {
            series: series
        }
    }

    //#endregion Private methods
}