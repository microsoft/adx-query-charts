'use strict';

//#region Imports

import * as _ from 'lodash';
import * as Highcharts from 'highcharts';
import { HC_Utilities } from '../common/utilities';
import { IVisualizerOptions } from '../../IVisualizerOptions';
import { Utilities } from '../../../common/utilities';
import { IColumn, IRowValue, IChartOptions, IDataPoint } from '../../../common/chartModels';
import { InvalidInputError } from '../../../common/errors/errors';
import { ErrorCode } from '../../../common/errors/errorCode';
import { Formatter } from '../common/formatter';

//#endregion Imports

export interface ICategoriesAndSeries {
    categories?: IRowValue[];
    series: any[];
}

export abstract class Chart {
    private defaultPlotOptions: Highcharts.PlotOptions;
    
    public constructor(chartOptions: IChartOptions) {
        this.defaultPlotOptions = this.getDefaultPlotOptions(chartOptions);
    }
        
    //#region Virtual methods

    public /*virtual*/ getStandardCategoriesAndSeries(options: IVisualizerOptions): ICategoriesAndSeries {
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
            let xAxisValue: IRowValue = row[xAxisColumnIndex];
    
            // If the x-axis is a date, convert its value to milliseconds as this is what expected by 'Highcharts'
            if(isDatetimeAxis) {
                xAxisValue = Utilities.getDateValue(<string>xAxisValue);

                if(!xAxisValue) {
                    throw new InvalidInputError(`The x-axis value '${row[xAxisColumnIndex]}' is an invalid date`, ErrorCode.InvalidDate);
                }
            } else {
                categoriesAndSeries.categories.push(xAxisValue);
            }

            _.forEach(yAxesIndexes, (yAxisIndex, i) => {
                const yAxisColumnName = chartOptions.columnsSelection.yAxes[i].name;
                const yAxisValue = HC_Utilities.getYValue(options.queryResultData.columns, row, yAxisIndex);
                
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
    
    public /*virtual*/ getSplitByCategoriesAndSeries(options: IVisualizerOptions): ICategoriesAndSeries {
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
            categories: []
        };

        options.queryResultData.rows.forEach((row) => {
        	const xValue = row[xAxisColumnIndex];
        	const yValue = HC_Utilities.getYValue(options.queryResultData.columns, row, yAxisColumnIndex);
        	const splitByValue = row[splitByColumnIndex];
        
        	if(!uniqueXValues[xValue]) {
                uniqueXValues[xValue] = true;
                
                // Populate X-Axis
                categoriesAndSeries.categories.push(xValue);
        	}
        
        	if(!uniqueSplitByValues[splitByValue]) {
        		uniqueSplitByValues[splitByValue] = {};
        	}
        
        	uniqueSplitByValues[splitByValue][xValue] = yValue;
        });
        
        // Populate Split by
        for (let splitByValue in uniqueSplitByValues) {
        	const currentSeries = {
        		name: splitByValue,
        		data: []
        	};
        
        	const xValueToYValueMap = uniqueSplitByValues[splitByValue];
        	
        	// Set a split-by value for each unique x value
        	categoriesAndSeries.categories.forEach((xValue) => {
        		let yValue = xValueToYValueMap[xValue];
        
                if(yValue === undefined) {
                    yValue = null;
                }
                
        		currentSeries.data.push(yValue);
        	});
        
        	categoriesAndSeries.series.push(currentSeries);
        }

        return categoriesAndSeries;
    }

    public /*virtual*/ sortSeriesByName(series: any[]): any[] {
        const sortedSeries = _.sortBy(series, 'name');

        return sortedSeries;
    }

    public /*virtual*/ getChartTypeOptions(): Highcharts.Options {
        return {
            chart: {
                type: this.getChartType()
            },
            plotOptions: { ...this.defaultPlotOptions, ...this.plotOptions() }
        };
    }

    public /*virtual*/ getChartTooltipFormatter(chartOptions: IChartOptions): Highcharts.TooltipFormatterCallbackFunction {
        const self = this;

        return function () {
            const dataPoint: IDataPoint = self.getDataPoint(chartOptions, this.point);

            // X axis
            const xColumnTitle: string = chartOptions.xAxisTitleFormatter ? chartOptions.xAxisTitleFormatter(dataPoint.x.column) : undefined;
            let tooltip: string = Formatter.getSingleTooltip(chartOptions, dataPoint.x.column, dataPoint.x.value, xColumnTitle);

            // Y axis
            tooltip += Formatter.getSingleTooltip(chartOptions, dataPoint.y.column, dataPoint.y.value);

            // Split by
            if(dataPoint.splitBy) {
                tooltip += Formatter.getSingleTooltip(chartOptions, dataPoint.splitBy.column, dataPoint.splitBy.value);
            }

            return '<table>' + tooltip + '</table>';
        }
    }

    public /*virtual*/ verifyInput(options: IVisualizerOptions): void {    
        const columnSelection = options.chartOptions.columnsSelection;

        if(columnSelection.splitBy && columnSelection.splitBy.length > 1) {
            throw new InvalidInputError(`Multiple split-by columns selection isn't allowed for ${options.chartOptions.chartType}`, ErrorCode.InvalidColumnsSelection);
        }
    }

    protected /*virtual*/ getDataPoint(chartOptions: IChartOptions, point: Highcharts.Point): IDataPoint {
        // Y axis
        const yAxes = chartOptions.columnsSelection.yAxes;
        let yAxisColumn;

        if (yAxes.length === 1) {
            yAxisColumn = yAxes[0];
        } else { // Multiple y-axes - find the current y column
            const yColumnIndex = _.findIndex(yAxes, (col) => { 
                return col.name === point.series.name 
            });

            yAxisColumn = yAxes[yColumnIndex];
        }

        const dataPointInfo: IDataPoint = {
            x: {
                column: chartOptions.columnsSelection.xAxis,
                value: point.category
            },
            y: {
                column: yAxisColumn,
                value: point.y
            },
        };

        // Split by
        const splitBy = chartOptions.columnsSelection.splitBy;

        if(splitBy && splitBy.length > 0) {
            dataPointInfo.splitBy = {
                column: splitBy[0],
                value: point.series.name
            }
        }

        return dataPointInfo;
    }

    //#endregion Virtual methods

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
            const yValue = HC_Utilities.getYValue(options.queryResultData.columns, row, yAxisColumnIndex);
            const dateOriginalValue: string = <string>row[xAxisColumnIndex];

            // For date a-axis, convert its value to milliseconds as this is what expected by Highcharts
            const dateNumericValue: number = Utilities.getDateValue(dateOriginalValue);
         
            if(!dateNumericValue) {
                throw new InvalidInputError(`The x-axis value '${dateOriginalValue}' is an invalid date`, ErrorCode.InvalidDate);
            }

            if(!splitByMap[splitByValue]) {
                splitByMap[splitByValue] = [];
            }

            splitByMap[splitByValue].push([dateNumericValue, yValue]);
        });
        
        const combinationSetup = options.chartOptions.customVizualizerChartOptions.combination;

        for (let splitByValue in splitByMap) {
            series.push({
                name: splitByValue,
                data: splitByMap[splitByValue],
                type: combinationSetup[splitByValue] || undefined
            });
        }

        return {
            series: series
        }
    }

    private getDefaultPlotOptions(chartOptions: IChartOptions): Highcharts.PlotOptions {
        const defaultPlotOptions = {
            series: {
                animation: {
                    duration: chartOptions.animationDurationMS
                },
                marker: {
                    radius: 2 // The radius of the chart's point marker
                }
            }
        };

        if (chartOptions.onDataPointClicked) {
            const self = this;
            const clickableSeries: Highcharts.PlotSeriesOptions = {
                cursor: 'pointer',
                point: {
                    events: {
                        click: function () {
                            const dataPoint: IDataPoint = self.getDataPoint(chartOptions, /*point*/ this);      

                            chartOptions.onDataPointClicked(dataPoint);
                        }
                    }
                }
            }

            _.merge(defaultPlotOptions.series, clickableSeries);
        }

        return defaultPlotOptions;
    }

    //#endregion Private methods
}