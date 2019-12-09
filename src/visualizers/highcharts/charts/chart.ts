'use strict';

//#region Imports

import * as _ from 'lodash';
import * as Highcharts from 'highcharts';
import { IVisualizerOptions } from '../../IVisualizerOptions';
import { Utilities } from '../../../common/utilities';

//#endregion Imports

export interface ICategoriesAndSeries {
    categories?: string[];
    series: any[];
}

export abstract class Chart {
    public getStandardCategoriesAndSeries(options: IVisualizerOptions, xAxisColumnIndex: number, isDatetimeAxis: boolean = false): ICategoriesAndSeries {
        const chartOptions = options.chartOptions;
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
    
            // If the x-axis is a date, convert it's value to milliseconds as this is what expected by 'Highcharts'
            if(isDatetimeAxis) {
                const dateValue = Utilities.getValidDate(xAxisValue, chartOptions.utcOffset);

                xAxisValue = dateValue.valueOf();
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
    
    public getSplitByCategoriesAndSeries(options: IVisualizerOptions, xAxisColumnIndex: number, isDatetimeAxis: boolean = false): ICategoriesAndSeries {
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
            const dateValue = Utilities.getValidDate(<string>xValue, options.chartOptions.utcOffset);

            xValue = dateValue.valueOf();

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

    public getChartTypeOptions(): Highcharts.Options {
        return {
            chart: {
                type: this.getChartType()
            },
            plotOptions: this.plotOptions()
        };
    }

    //#region Abstract methods

    protected abstract getChartType(): string;

    protected abstract plotOptions(): Highcharts.PlotOptions;

    //#endregion Abstract methods
}