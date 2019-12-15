'use strict';

//#region Imports

import * as Highcharts from 'highcharts';
import * as _ from 'lodash';
import { ResizeSensor } from 'css-element-queries';
import { Chart } from './charts/chart';
import { IVisualizer } from '../IVisualizer';
import { IVisualizerOptions } from '../IVisualizerOptions';
import { ChartFactory } from './charts/chartFactory';
import { ChartTheme, DateFormat, IChartOptions, IColumn, DraftColumnType } from '../../common/chartModels';
import { Changes, ChartChange } from '../../common/chartChange';
import { Utilities } from '../../common/utilities';
import { Themes } from './themes/themes';
import { HighchartsDateFormatToCommon } from './highchartsDateFormatToCommon';

//#endregion Imports

type ResolveFn = (value?: void | PromiseLike<void>) => void;

export class HighchartsVisualizer implements IVisualizer {
    private options: IVisualizerOptions;
    private highchartsChart: Highcharts.Chart;
    private basicHighchartsOptions: Highcharts.Options;
    private themeOptions: Highcharts.Options;       
    private currentChart: Chart;
    private chartContainerResizeSensor: ResizeSensor;

    public drawNewChart(options: IVisualizerOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const chartOptions = options.chartOptions;
    
            this.options = options;
            this.currentChart = ChartFactory.create(chartOptions.chartType);
            this.basicHighchartsOptions = this.getHighchartsOptions();
            this.themeOptions = Themes.getThemeOptions(chartOptions.chartTheme);
    
            if(chartOptions.onFinishDataTransformation) {
                this.onFinishDataTransformation(chartOptions, resolve);
            } else {
                // Draw the chart
                this.draw(resolve);
            }
        });
    }
           
    public updateExistingChart(options: IVisualizerOptions, changes: Changes): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // Make sure that there is an existing chart
            const chartContainer = document.querySelector('#' + this.options.elementId);
            const isChartExist = chartContainer && chartContainer.children.length > 0;
            const isChartTypeTheOnlyChange = changes.count === 1 && changes.isPendingChange(ChartChange.ChartType);

            if(isChartExist && isChartTypeTheOnlyChange) {
                const oldChart = this.currentChart;
                const newChart = ChartFactory.create(options.chartOptions.chartType);
    
                // We update the existing chart options only if the new chart categories and series builder method is the same as the previous chart's method
                if(oldChart.getSplitByCategoriesAndSeries === newChart.getSplitByCategoriesAndSeries && 
                   oldChart.getStandardCategoriesAndSeries === newChart.getStandardCategoriesAndSeries) {
                    this.currentChart = newChart;
                    this.options = options;
                    
                    // Build the options that need to be updated
                    let newOptions: Highcharts.Options = this.currentChart.getChartTypeOptions();
        
                    // Apply the changes
                    this.highchartsChart.update(newOptions);
        
                    // Save the new options
                    this.basicHighchartsOptions = _.merge({}, this.basicHighchartsOptions, newOptions);
                    
                    resolve();
    
                    return;
                }
            }

            // Every other change - Redraw the chart
            this.drawNewChart(options)
                .then(() => {
                    resolve();
                });
        });
    }

    public changeTheme(newTheme: ChartTheme): void {
        // No existing chart - do nothing
        if(!this.currentChart) {
            return;
        }

        if(this.options.chartOptions.chartTheme !== newTheme) {
            // Update new theme options
            this.themeOptions = Themes.getThemeOptions(newTheme);
            
            // Re-draw the a new chart with the new theme
            new Promise<void>((resolve, reject) => {
                this.draw(resolve);
            });           
        }
    }

    //#region Private methods

    private draw(finishDrawingResolveFn: ResolveFn): void {
        const highchartsOptions = _.merge({}, this.basicHighchartsOptions, this.themeOptions);

        this.destroyExistingChart();

        // Draw the chart
        this.highchartsChart = Highcharts.chart(this.options.elementId, highchartsOptions);
        
        this.handleResize();

        // Mark that the chart drawing was finished
        finishDrawingResolveFn();
    }

    // Highcharts handle resize only on window resize, we need to handle resize when the chart's container size changes
    private handleResize(): void {        
        const chartContainer = document.querySelector('#' + this.options.elementId);
    
        if(this.chartContainerResizeSensor) {
            // Remove the previous resize sensor, and stop listening to resize events
            this.chartContainerResizeSensor.detach();
        }
    
        this.chartContainerResizeSensor = new ResizeSensor(chartContainer, () => {
            this.highchartsChart.reflow();
        });
    }

    private getHighchartsOptions(): Highcharts.Options {
        const chartOptions = this.options.chartOptions;     
        const isDatetimeAxis = Utilities.isDate(chartOptions.columnsSelection.xAxis.type);

        let highchartsOptions: Highcharts.Options = {
            title: {
                text: chartOptions.title
            },
            xAxis: {
                type: isDatetimeAxis ? 'datetime' : undefined,
                labels: this.getLabelsFormatter(chartOptions, chartOptions.columnsSelection.xAxis),
                title: {
                    text: this.getXAxisTitle(chartOptions),
                    align: 'middle'
                }
            },
            yAxis: this.getYAxis(chartOptions),
            tooltip: {
                formatter: this.currentChart.getChartTooltipFormatter(chartOptions),
                shared: false,
                useHTML: true
            }
        };

        const categoriesAndSeries = this.getCategoriesAndSeries();
        const chartTypeOptions = this.currentChart.getChartTypeOptions();
        
        highchartsOptions = _.merge(highchartsOptions, chartTypeOptions, categoriesAndSeries);

        return highchartsOptions;
    }
  
    private getLabelsFormatter(chartOptions: IChartOptions, column: IColumn) {
        let formatter;

        if(chartOptions.numberFormatter && Utilities.isNumeric(column.type)) {
            formatter = function() {
                const dataPoint = this;

                return chartOptions.numberFormatter(dataPoint.value);
            }
        } else if(chartOptions.dateFormatter && Utilities.isDate(column.type)) {
            formatter = function() {
                const dataPoint = this;
                const dateFormat = HighchartsDateFormatToCommon[dataPoint.dateTimeLabelFormat] || DateFormat.FullDate;
        
                return chartOptions.dateFormatter(new Date(dataPoint.value), dateFormat);
            }
        }

        return {
            formatter: formatter
        };
    }

    private getYAxis(chartOptions: IChartOptions): Highcharts.YAxisOptions {
        const yAxis = this.options.chartOptions.columnsSelection.yAxes[0];
        const yAxisOptions = {
            title: {
                text: yAxis.name
            },
            labels: this.getLabelsFormatter(chartOptions, yAxis)
        }
        
        return yAxisOptions;
    }

    private getXAxisTitle(chartOptions: IChartOptions): string {
        const xAxisColumn = chartOptions.columnsSelection.xAxis;
        const xAxisTitleFormatter = chartOptions.xAxisTitleFormatter;

        if(xAxisTitleFormatter) {
            return xAxisTitleFormatter(xAxisColumn);
        }

        return xAxisColumn.name;
    }

    private destroyExistingChart(): void {
        if(this.highchartsChart) {
            this.highchartsChart.destroy();
        }
    }

    private getCategoriesAndSeries(): Highcharts.Options {
        const columnsSelection = this.options.chartOptions.columnsSelection; 
        let categoriesAndSeries;

        if(columnsSelection.splitBy && columnsSelection.splitBy.length > 0) {
            categoriesAndSeries = this.currentChart.getSplitByCategoriesAndSeries(this.options);
        } else {
            categoriesAndSeries = this.currentChart.getStandardCategoriesAndSeries(this.options);
        }

        return {
            xAxis: {
                categories: categoriesAndSeries.categories
            },
            series: categoriesAndSeries.series
        }
    }

    private onFinishDataTransformation(chartOptions: IChartOptions, resolve: ResolveFn): void {
        // Calculate the number of data points
        let numberOfDataPoints = 0;

        this.basicHighchartsOptions.series.forEach((currentSeries) => {
            numberOfDataPoints+= currentSeries['data'].length;
        });

        const drawChartResolver = chartOptions.onFinishDataTransformation({ 
            numberOfDataPoints: numberOfDataPoints 
        });

        // Continue drawing the chart only after drawChartResolver is resolved
        drawChartResolver.then((continueDraw: boolean) => {
            if(continueDraw) {
                this.draw(resolve);
            } else {
                resolve(); // Resolve without drawing the chart
            }
        });
    }

    //#endregion Private methods
}