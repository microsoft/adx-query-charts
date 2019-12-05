'use strict';

//#region Imports

import * as _ from 'lodash';
import * as Highcharts from 'highcharts';
import { Themes } from '../themes/themes';
import { IVisualizerOptions } from '../../IVisualizerOptions';
import { ChartTypeOptions } from '../chartTypeOptions';
import { ChartTheme } from '../../../common/chartModels';
import { Utilities } from '../../../common/utilities';

//#endregion Imports

export interface ICategoriesAndSeries {
    categories?: string[];
    series: any[];
}

export abstract class Chart {
    public options: IVisualizerOptions;
    public highchartsChart: Highcharts.Chart;
    public basicHighchartsOptions: Highcharts.Options;
    public themeOptions: Highcharts.Options;       

    public constructor(options: IVisualizerOptions) {
        this.options = options;
        this.basicHighchartsOptions = this.getHighchartsOptions();
        this.themeOptions = Themes.getThemeOptions(options.chartOptions.chartTheme);
    }

    public draw(): void {                  
        const highchartsOptions = _.merge({}, this.basicHighchartsOptions, this.themeOptions);

        this.destroyExistingChart();
        this.highchartsChart = Highcharts.chart(this.options.elementId, highchartsOptions);
    }
  
    public changeTheme(newTheme: ChartTheme): void {
        if(this.options.chartOptions.chartTheme !== newTheme) {
            // Update new theme options
            this.themeOptions = Themes.getThemeOptions(newTheme);
            
            // Re-draw the a new chart with the new theme
            this.draw();
        }
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
            title: {
                text: chartOptions.title
            },
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
            this.getSplitByCategoriesAndSeries(xAxisColumnIndex, categoriesAndSeries, isDatetimeAxis);
        } else {
            this.getStandardCategoriesAndSeries(xAxisColumnIndex, categoriesAndSeries, isDatetimeAxis);
        }

        return categoriesAndSeries;
    }
    
    protected getStandardCategoriesAndSeries(xAxisColumnIndex: number, categoriesAndSeries: ICategoriesAndSeries, isDatetimeAxis: boolean = false): void {
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
    
    protected getSplitByCategoriesAndSeries( xAxisColumnIndex: number, categoriesAndSeries: ICategoriesAndSeries, isDatetimeAxis: boolean = false): void {
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

    private destroyExistingChart(): void {
        if(this.highchartsChart) {
            this.highchartsChart.destroy();
        }
    }

    //#endregion Private methods
}