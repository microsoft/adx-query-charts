'use strict';

//#region Imports

import * as _ from 'lodash';
import { Utilities } from '../../common/utilities';
import { IVisualizerOptions } from '../IVisualizerOptions';

//#endregion Imports

export interface ICategoriesAndSeries {
    categories?: string[];
    series: any[];
}

export class DataTransformer {
    //#region Public static methods

    public static getCategoriesAndSeries(options: IVisualizerOptions, isDatetimeAxis: boolean): ICategoriesAndSeries {
        const columnsSelection = options.chartOptions.columnsSelection;
        const xAxisColumn = columnsSelection.xAxis;
        const xAxisColumnIndex = Utilities.getColumnIndex(options.queryResultData, xAxisColumn);  
        let categoriesAndSeries = {
            series: [],
            categories: isDatetimeAxis ? undefined : [] 
        };
        
        if(columnsSelection.splitBy && columnsSelection.splitBy.length > 0) {
            DataTransformer.getSplitByCategoriesAndSeries(options, xAxisColumnIndex, isDatetimeAxis, categoriesAndSeries);
        } else {
            DataTransformer.getStandardCategoriesAndSeries(options, xAxisColumnIndex, isDatetimeAxis, categoriesAndSeries);
        }

        return categoriesAndSeries;
    }

    //#endregion Public static methods

    private static getStandardCategoriesAndSeries(options: IVisualizerOptions, xAxisColumnIndex: number, isDatetimeAxis: boolean, categoriesAndSeries: ICategoriesAndSeries): void {
        const chartOptions = options.chartOptions;
        const yAxesIndexes = _.map(chartOptions.columnsSelection.yAxes, (yAxisColumn) => {
            return Utilities.getColumnIndex(options.queryResultData, yAxisColumn);
        });

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
    }
    
    public static getSplitByCategoriesAndSeries(options: IVisualizerOptions, xAxisColumnIndex: number, isDatetimeAxis: boolean, categoriesAndSeries: ICategoriesAndSeries): void {
        if(isDatetimeAxis) {
            DataTransformer.getSplitByCategoriesAndSeriesForDateXAxis(options, xAxisColumnIndex, categoriesAndSeries);

            return;
        }

        const columnsSelection = options.chartOptions.columnsSelection;
        const yAxisColumn = columnsSelection.yAxes[0];
        const splitByColumn = columnsSelection.splitBy[0];
        const yAxisColumnIndex = Utilities.getColumnIndex(options.queryResultData, yAxisColumn);
        const splitByColumnIndex = Utilities.getColumnIndex(options.queryResultData, splitByColumn);
        const uniqueXValues = {};
        const uniqueSplitByValues = {};
      
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
    }

    private static getSplitByCategoriesAndSeriesForDateXAxis(options: IVisualizerOptions, xAxisColumnIndex: number, categoriesAndSeries: ICategoriesAndSeries): void {
        const columnsSelection = options.chartOptions.columnsSelection;
        const yAxisColumn = columnsSelection.yAxes[0];
        const splitByColumn = columnsSelection.splitBy[0];
        const yAxisColumnIndex = Utilities.getColumnIndex(options.queryResultData, yAxisColumn);
        const splitByColumnIndex = Utilities.getColumnIndex(options.queryResultData, splitByColumn);
        const splitByMap = {};

        options.queryResultData.rows.forEach((row) => {
            const splitByValue: string = <string>row[splitByColumnIndex];
            const yValue = row[yAxisColumnIndex];
            let xValue = row[xAxisColumnIndex];

            // For date the a-axis, convert it's value to ms as this is what expected by Highcharts
            const dateValue = Utilities.getValidDate(xValue, options.chartOptions.utcOffset);

            xValue = dateValue.valueOf();

            if(!splitByMap[splitByValue]) {
                splitByMap[splitByValue] = [];
            }

            splitByMap[splitByValue].push([xValue, yValue]);
        });

        for (let splitByValue in splitByMap) {
            categoriesAndSeries.series.push({
                name: splitByValue,
                data: splitByMap[splitByValue]
            });
        }
    }
}