'use strict';

import * as _ from 'lodash';
import { HC_Utilities } from '../common/utilities';
import { Chart, ICategoriesAndSeries } from './chart';
import { Formatter } from '../common/formatter';
import { IVisualizerOptions } from '../../IVisualizerOptions';
import { Utilities } from '../../../common/utilities';
import { IColumn, IChartOptions, IDataPoint } from '../../../common/chartModels';
import { InvalidInputError, EmptyPieError } from '../../../common/errors/errors';
import { ErrorCode } from '../../../common/errors/errorCode';
import { chart } from 'highcharts';

interface IPieSeriesData {
    name: string;
    y: number; 
}

interface IPieSeries {
    name: string;
    data: IPieSeriesData[];
}

export class Pie extends Chart {
    //#region Methods override
 
    public /*override*/ getStandardCategoriesAndSeries(options: IVisualizerOptions): ICategoriesAndSeries {
        const xColumn: IColumn = options.chartOptions.columnsSelection.xAxis;
        const xAxisColumnIndex: number =  Utilities.getColumnIndex(options.queryResultData, xColumn);    
        const yAxisColumn = options.chartOptions.columnsSelection.yAxes[0]; // We allow only 1 yAxis in pie charts
        const yAxisColumnIndex = Utilities.getColumnIndex(options.queryResultData, yAxisColumn);

        // Build the data for the pie
        const pieSeries: IPieSeries = {
            name: yAxisColumn.name,
            data: []
        }

        options.queryResultData.rows.forEach((row) => {
            const xAxisValue = <string>row[xAxisColumnIndex];
            const yAxisValue = HC_Utilities.getYValue(options.queryResultData.columns, row, yAxisColumnIndex);

            // Ignore empty/zero y values since they can't be placed on the pie chart
            if(yAxisValue) {
                pieSeries.data.push({
                    name: xAxisValue,
                    y: yAxisValue
                });
            }
        });

        this.validateNonEmptyPie(pieSeries);

        return {
            series: [pieSeries]
        }
    }

    public /*override*/ getSplitByCategoriesAndSeries(options: IVisualizerOptions): ICategoriesAndSeries {
        const yAxisColumn = options.chartOptions.columnsSelection.yAxes[0]; // We allow only 1 yAxis in pie charts
        const yAxisColumnIndex = Utilities.getColumnIndex(options.queryResultData, yAxisColumn);
        const keyIndexes = this.getAllPieKeyIndexes(options);
        
        // Build the data for the multi-level pie
        let pieData = {};
        let pieLevelData = pieData;

        options.queryResultData.rows.forEach((row) => {
            const yAxisValue = HC_Utilities.getYValue(options.queryResultData.columns, row, yAxisColumnIndex);

            // Ignore empty/zero y values since they can't be placed on the pie chart
            if (yAxisValue) {
                keyIndexes.forEach((keyIndex) => {  
                    const keyValue: string = <string>row[keyIndex];
                    let keysMap = pieLevelData[keyValue];

                    if(!keysMap) {
                        pieLevelData[keyValue] = {
                            drillDown: {},
                            y: 0
                        };
                    }

                    pieLevelData[keyValue].y += yAxisValue;
                    pieLevelData = pieLevelData[keyValue].drillDown;
                });

                pieLevelData = pieData;
            }
        });

        const series = this.spreadMultiLevelSeries(options, pieData);

        return {
            series: series
        }
    }
    
    public /*override*/ sortSeriesByName(series: any[]): any[] {
        const allData = _.flatMap(series, 'data');
        const sortedData = _.sortBy(allData, 'name');

        sortedData.forEach((data, i) => {
            data.legendIndex = ++i;
        });

        return series;
    }

    public /*override*/ getChartTooltipFormatter(chartOptions: IChartOptions): Highcharts.TooltipFormatterCallbackFunction {
        const self = this;

        return function () {
            const context: Highcharts.TooltipFormatterContextObject = this;
            const dataPoint: IDataPoint = self.getDataPoint(chartOptions, context.point);

            // Key
            let keyColumn: IColumn = dataPoint.x.column;
            let keyColumnName: string = keyColumn.name;

            if (keyColumn === chartOptions.columnsSelection.xAxis) {
                keyColumnName = chartOptions.xAxisTitleFormatter ? chartOptions.xAxisTitleFormatter(keyColumn) : undefined;     
            }

            let tooltip: string = Formatter.getSingleTooltip(chartOptions, keyColumn, dataPoint.x.value, keyColumnName);  

            // Y axis
            tooltip += Formatter.getSingleTooltip(chartOptions, dataPoint.y.column, dataPoint.y.value, /*columnName*/ undefined, self.getPercentageSuffix(context));

            return '<table>' + tooltip + '</table>';
        }
    }
       
    public /*override*/ verifyInput(options: IVisualizerOptions): void {    
        const columnSelection = options.chartOptions.columnsSelection;

        if(columnSelection.yAxes.length > 1) {
            throw new InvalidInputError(`Multiple y-axis columns selection isn't allowed for ${options.chartOptions.chartType}`, ErrorCode.InvalidColumnsSelection);
        }
    }

    protected /*override*/ getChartType(): string {
        return 'pie';
    };

    protected /*override*/ plotOptions(): Highcharts.PlotOptions {
        const self = this;

        return {
            pie: {
                innerSize: this.getInnerSize(),
                showInLegend: true,
                dataLabels: {
                    formatter: function() {
                        return `<b>${this.point.name}</b>${self.getPercentageSuffix(this)}`;
                    },
                    style: {
                        textOverflow: 'ellipsis'
                    }
                }
            }
        }
    }

    protected /*override*/ getDataPoint(chartOptions: IChartOptions, point: Highcharts.Point): IDataPoint {
        const xColumn: IColumn = chartOptions.columnsSelection.xAxis;
        const splitBy = chartOptions.columnsSelection.splitBy;
        let seriesColumn: IColumn;

        // Try to find series column in the split-by columns
        if (splitBy && splitBy.length > 0) {
            // Find the current key column
            const keyColumnIndex = _.findIndex(splitBy, (col) => { 
                return col.name === point.series.name; 
            });

            seriesColumn = splitBy[keyColumnIndex];
        }
                 
        // If the series column isn't one of the splitBy columns -> it's the x axis column
        if (!seriesColumn) {
            seriesColumn = xColumn;     
        }

        const dataPointInfo: IDataPoint = {
            x: {
                column: seriesColumn,
                value: point.name
            },
            y: {
                column: chartOptions.columnsSelection.yAxes[0], // We allow only 1 y axis in pie chart
                value: point.y
            }
        };

        return dataPointInfo;
    }

    //#endregion Methods override

    protected getInnerSize(): string {
        return '0';
    }

    //#region Private methods

    private spreadMultiLevelSeries(options: IVisualizerOptions, pieData: any, level: number = 0, series: any[] = []): IPieSeries[] {
        const chartOptions = options.chartOptions;
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

            this.validateNonEmptyPie(currentSeries);       

            let drillDown = pieLevelValue.drillDown;

            if(!_.isEmpty(drillDown)) {
                this.spreadMultiLevelSeries(options, drillDown, level + 1, series);
            }
        }

        return series;
    }

    /**
     * Returns an array that includes all the indexes of the columns that represent a pie slice key
     * @param chartOptions 
     */
    private getAllPieKeyIndexes(options: IVisualizerOptions) {
        const xColumn: IColumn = options.chartOptions.columnsSelection.xAxis;
        const xAxisColumnIndex: number =  Utilities.getColumnIndex(options.queryResultData, xColumn);
        const keyIndexes = [xAxisColumnIndex];
        
        options.chartOptions.columnsSelection.splitBy.forEach((splitByColumn) => {
            keyIndexes.push(Utilities.getColumnIndex(options.queryResultData, splitByColumn));
        });

        return keyIndexes;
    }

    private validateNonEmptyPie(pieSeries: IPieSeries): void {    
        // Make sure that the pie data contains non-empty values (not only zero / null / undefined / negative values), otherwise the pie can't be drawn
        const isEmptyPie: boolean = _.every(pieSeries.data, (currentData) => !currentData.y || currentData.y < 0);

        if(isEmptyPie) {
            throw new EmptyPieError();
        }
    }

    private getPercentageSuffix(context: { percentage?: number }): string {
        const percentageRoundValue = Number(Math.round(<any>(context.percentage + 'e2')) + 'e-2'); // Round the percentage to up to 2 decimal points

        return ` (${percentageRoundValue}%)`;
    }

    //#endregion Private methods
}