'use strict';

import * as _ from 'lodash';
import * as Highcharts from 'highcharts';
import { IVisualizerOptions } from '../../IVisualizerOptions';
import { ChartTypeOptions } from '../chartTypeOptions';
import { Utilities } from '../../../common/utilities';

export interface ICategoriesAndSeries {
    categories?: string[];
    series: any[];
}

export abstract class HighchartsChart {
    protected options: IVisualizerOptions; 

    public constructor(options: IVisualizerOptions) {
        this.options = options;
    }

    public getHighchartsOptions(): Highcharts.Options {
        const chartOptions = this.options.chartOptions;
        const chartTypeOptions = this.getChartTypeOptions();
        const isDatetimeAxis = Utilities.isDate(chartOptions.columnsSelection.xAxis.type);
        const categoriesAndSeries = this.getCategoriesAndSeries(isDatetimeAxis);

        const highchartsOptions: Highcharts.Options = {
            chart: {
                type: chartTypeOptions.chartType
            },
            plotOptions: chartTypeOptions.plotOptions,
            xAxis: {
                type: isDatetimeAxis ? 'datetime' : undefined,
                categories: categoriesAndSeries.categories,
                title: {
                    text: this.getXAxisTitle(),
                    align: 'middle'
                }
            },
            yAxis: this.getYAxis(),
            series: categoriesAndSeries.series
        };

        return highchartsOptions;
    }

    protected getCategoriesAndSeries(isDatetimeAxis: boolean): ICategoriesAndSeries {
        const columnsSelection = this.options.chartOptions.columnsSelection;
        const xAxisColumn = columnsSelection.xAxis;
        const xAxisColumnIndex = Utilities.getColumnIndex(this.options.queryResultData, xAxisColumn);  
        let categoriesAndSeries = {
            series: [],
            categories: isDatetimeAxis ? undefined : [] 
        };
        
        if(columnsSelection.splitBy && columnsSelection.splitBy.length > 0) {
            this.getSplitByCategoriesAndSeries(xAxisColumnIndex, isDatetimeAxis, categoriesAndSeries);
        } else {
            this.getStandardCategoriesAndSeries(xAxisColumnIndex, isDatetimeAxis, categoriesAndSeries);
        }

        return categoriesAndSeries;
    }  
    
    protected getStandardCategoriesAndSeries(xAxisColumnIndex: number, isDatetimeAxis: boolean, categoriesAndSeries: ICategoriesAndSeries): void {
        const chartOptions = this.options.chartOptions;
        const yAxesIndexes = _.map(chartOptions.columnsSelection.yAxes, (yAxisColumn) => {
            return Utilities.getColumnIndex(this.options.queryResultData, yAxisColumn);
        });

        const seriesMap = {};

        this.options.queryResultData.rows.forEach((row) => {
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
    
    protected getSplitByCategoriesAndSeries( xAxisColumnIndex: number, isDatetimeAxis: boolean, categoriesAndSeries: ICategoriesAndSeries): void {
        if(isDatetimeAxis) {
            this.getSplitByCategoriesAndSeriesForDateXAxis(this.options, xAxisColumnIndex, categoriesAndSeries);

            return;
        }

        const columnsSelection = this.options.chartOptions.columnsSelection;
        const yAxisColumn = columnsSelection.yAxes[0];
        const splitByColumn = columnsSelection.splitBy[0];
        const yAxisColumnIndex = Utilities.getColumnIndex(this.options.queryResultData, yAxisColumn);
        const splitByColumnIndex = Utilities.getColumnIndex(this.options.queryResultData, splitByColumn);
        const uniqueXValues = {};
        const uniqueSplitByValues = {};
      
        this.options.queryResultData.rows.forEach((row) => {
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

    protected getSplitByCategoriesAndSeriesForDateXAxis(options: IVisualizerOptions, xAxisColumnIndex: number, categoriesAndSeries: ICategoriesAndSeries): void {
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
            const dateValue = Utilities.getValidDate(<string>xValue, options.chartOptions.utcOffset);

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

    //#region Abstract methods

    protected abstract getChartTypeOptions(): ChartTypeOptions;

    //#endregion Abstract methods
        
    //#region Private methods

    private getYAxis(): Highcharts.YAxisOptions {
        const yAxis = this.options.chartOptions.columnsSelection.yAxes[0];
        const yAxisOptions = {
            title: {
                text: yAxis.name
            }
        }
        
        return yAxisOptions;
    }

    private getXAxisTitle(): string {
        const xAxisColumn = this.options.chartOptions.columnsSelection.xAxis;

        return xAxisColumn.name;
    }

    //#endregion Private methods
}