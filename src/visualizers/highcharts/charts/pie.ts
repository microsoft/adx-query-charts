'use strict';

import * as _ from 'lodash';
import { HighchartsChart, ICategoriesAndSeries } from './highchartsChart';
import { ChartTypeOptions } from '../chartTypeOptions';
import { Utilities } from '../../../common/utilities';

export class Pie extends HighchartsChart {
    //#region Methods override

    protected getChartTypeOptions(): ChartTypeOptions {
        return {
            chartType: 'pie',
            plotOptions: {
                pie: {
                    innerSize: this.getInnerSize(),
                    showInLegend: true
                }
            }
        }
    }

    protected getStandardCategoriesAndSeries(xAxisColumnIndex: number, isDatetimeAxis: boolean, categoriesAndSeries: ICategoriesAndSeries): void {
        const yAxisColumn = this.options.chartOptions.columnsSelection.yAxes[0]; // We allow only 1 yAxis in pie charts
        const yAxisColumnIndex = Utilities.getColumnIndex(this.options.queryResultData, yAxisColumn);

        // Build the data for the pie
        const pieSeries = {
            name: yAxisColumn.name,
            data: []
        }

        this.options.queryResultData.rows.forEach((row) => {
            const xAxisValue = row[xAxisColumnIndex];
            const yAxisValue = row[yAxisColumnIndex];

            pieSeries.data.push({
                name: xAxisValue,
                y: yAxisValue 
            })
        });

        categoriesAndSeries.series.push(pieSeries);
        categoriesAndSeries.categories = undefined;
    }

    protected getSplitByCategoriesAndSeries(xAxisColumnIndex: number, isDatetimeAxis: boolean, categoriesAndSeries: ICategoriesAndSeries): void {
        const yAxisColumn = this.options.chartOptions.columnsSelection.yAxes[0]; // We allow only 1 yAxis in pie charts
        const yAxisColumnIndex = Utilities.getColumnIndex(this.options.queryResultData, yAxisColumn);
        const splitByIndexes = [xAxisColumnIndex];
        
        this.options.chartOptions.columnsSelection.splitBy.forEach((splitByColumn) => {
            splitByIndexes.push(Utilities.getColumnIndex(this.options.queryResultData, splitByColumn));
        });

        // Build the data for the multi-level pie
        let pieData = {};
        let pieLevelData = pieData;

        this.options.queryResultData.rows.forEach((row) => {
            const yAxisValue = row[yAxisColumnIndex];

            splitByIndexes.forEach((splitByIndex) => {  
                const splitByValue: string = <string>row[splitByIndex];
                let splitByMap = pieLevelData[splitByValue];

                if(!splitByMap) {
                    pieLevelData[splitByValue] = {
                        drillDown: {},
                        y: 0
                    };
                }

                pieLevelData[splitByValue].y += yAxisValue;
                pieLevelData = pieLevelData[splitByValue].drillDown;
            });

            pieLevelData = pieData;
        });

        categoriesAndSeries.series = this.spreadMultiLevelSeries(pieData);
        categoriesAndSeries.categories = undefined;
    }

    //#endregion Methods override

    protected getInnerSize(): string {
        return '0';
    }

    //#region Private methods

    private spreadMultiLevelSeries(pieData: any, level: number = 0, series: any[] = []): any[] {
        const chartOptions = this.options.chartOptions;
        const levelsCount = chartOptions.columnsSelection.splitBy.length + 1;
        const firstLevelSize =  Math.round(100 / levelsCount);

        for (let key in pieData) {
            let currentSeries = series[level];
            let pieLevelValue = pieData[key];

            if(!currentSeries) {
                let column = (level === 0) ? chartOptions.columnsSelection.xAxis : chartOptions.columnsSelection.splitBy[level - 1];
            
                currentSeries = {
                    name: column.name,
                    data: []
                };

                if(level === 0) {
                    currentSeries.size = `${firstLevelSize}%`;
                } else {
                    const prevLevelSizeStr = series[level - 1].size;
                    const prevLevelSize = Number(prevLevelSizeStr.substring(0, 2));

                    currentSeries.size = `${prevLevelSize + 10}%`;
                    currentSeries.innerSize = `${prevLevelSize}%`;
                }
            
                // We do not show labels for multi-level pie
                currentSeries.dataLabels = {
                    enabled: false
                }

                series.push(currentSeries);
            }
  
            currentSeries.data.push({
                name: key,
                y: pieLevelValue.y
            });

            let drillDown = pieLevelValue.drillDown;

            if(!_.isEmpty(drillDown)) {
                this.spreadMultiLevelSeries(drillDown, level + 1, series);
            }
        }

        return series;
    }

    //#endregion Private methods
}