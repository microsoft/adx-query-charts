'use strict';

//#region Imports

import * as Highcharts from 'highcharts';
import * as _ from 'lodash';
import { ResizeSensor } from 'css-element-queries';
import { Chart } from './charts/chart';
import { IVisualizer } from '../IVisualizer';
import { IVisualizerOptions } from '../IVisualizerOptions';
import { ChartFactory } from './charts/chartFactory';
import { ChartTheme } from '../../common/chartModels';
import { Changes, ChartChange } from '../../common/chartChange';
import { Utilities } from '../../common/utilities';
import { Themes } from './themes/themes';

//#endregion Imports

export class HighchartsVisualizer implements IVisualizer {
    private options: IVisualizerOptions;
    private highchartsChart: Highcharts.Chart;
    private basicHighchartsOptions: Highcharts.Options;
    private themeOptions: Highcharts.Options;       
    private currentChart: Chart;
    private chartContainerResizeSensor: ResizeSensor;

    public drawNewChart(options: IVisualizerOptions): void {
        this.options = options;
        this.currentChart = ChartFactory.create(options.chartOptions.chartType);
        this.basicHighchartsOptions = this.getHighchartsOptions();
        this.themeOptions = Themes.getThemeOptions(options.chartOptions.chartTheme);

        // Draw the chart
        this.draw();
    }
           
    public updateExistingChart(options: IVisualizerOptions, changes: Changes): void {
        // Make sure that there is an existing chart
        const chartContainer = document.querySelector('#' + this.options.elementId);
    
        if(!chartContainer || chartContainer.children.length === 0) {
            this.drawNewChart(options);

            return;
        }

        // Only the chart type was changed
        if(changes.count === 1 && changes.isPendingChange(ChartChange.ChartType)) {
            const oldChart = this.currentChart;
            const newChart = ChartFactory.create(options.chartOptions.chartType);

            // If the categories and series were changed - re-draw the chart
            if(oldChart.getSplitByCategoriesAndSeries !== newChart.getSplitByCategoriesAndSeries || 
                oldChart.getStandardCategoriesAndSeries !== newChart.getStandardCategoriesAndSeries) {
                this.drawNewChart(options);

                return;
            }

            this.currentChart = newChart;
            this.options = options;
            
            // Build the options that need to be updated
            let newOptions: Highcharts.Options = this.currentChart.getChartTypeOptions();

            // Apply the changes
            this.highchartsChart.update(newOptions);

            // Save the new options
            this.basicHighchartsOptions = _.merge({}, this.basicHighchartsOptions, newOptions);
        } else { // Every other change - redraw the chart
            // Redraw the chart
            this.drawNewChart(options);
        }
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
            this.draw();
        }
    }

    //#region Private methods

    private draw() {
        const highchartsOptions = _.merge({}, this.basicHighchartsOptions, this.themeOptions);

        this.destroyExistingChart();

        // Draw the chart
        this.highchartsChart = Highcharts.chart(this.options.elementId, highchartsOptions);
        
        this.handleResize();
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
                title: {
                    text: this.getXAxisTitle(),
                    align: 'middle'
                }
            },
            yAxis: this.getYAxis()
        };

        const categoriesAndSeries = this.getCategoriesAndSeries(isDatetimeAxis);
        const chartTypeOptions = this.currentChart.getChartTypeOptions();
        
        highchartsOptions = _.merge(highchartsOptions, chartTypeOptions, categoriesAndSeries);

        return highchartsOptions;
    }

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

    private getCategoriesAndSeries(isDatetimeAxis: boolean): Highcharts.Options {
        const columnsSelection = this.options.chartOptions.columnsSelection;
        const xAxisColumn = columnsSelection.xAxis;
        const xAxisColumnIndex = Utilities.getColumnIndex(this.options.queryResultData, xAxisColumn);  
        let categoriesAndSeries;

        if(columnsSelection.splitBy && columnsSelection.splitBy.length > 0) {
            categoriesAndSeries = this.currentChart.getSplitByCategoriesAndSeries(this.options, xAxisColumnIndex, isDatetimeAxis);
        } else {
            categoriesAndSeries = this.currentChart.getStandardCategoriesAndSeries(this.options, xAxisColumnIndex, isDatetimeAxis);
        }

        return {
            xAxis: {
                categories: categoriesAndSeries.categories
            },
            series: categoriesAndSeries.series
        }
    }

    //#endregion Private methods
}