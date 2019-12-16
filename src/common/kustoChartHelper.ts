'use strict';

//#region Imports

import { IChartHelper, IQueryResultData, ChartType, DraftColumnType, ISupportedColumnTypes, IColumn, ISupportedColumns, IColumnsSelection, IChartOptions, AggregationType, ChartTheme } from './chartModels';
import { SeriesVisualize } from '../transformers/seriesVisualize';
import { LimitVisResultsSingleton, LimitedResults, ILimitAndAggregateParams } from '../transformers/limitVisResults';
import { IVisualizer } from '../visualizers/IVisualizer';
import { Utilities } from './utilities';
import { ChartChange } from './chartChange';
import { ChangeDetection } from './changeDetection';

//#endregion Imports

export interface ITransformedQueryResultData {
    data: IQueryResultData;
    limitedResults: LimitedResults;
}

export class KustoChartHelper implements IChartHelper {
    
    //#region Public members

    public transformedQueryResultData: IQueryResultData;
    public isResolveAsSeries: boolean = false;

    //#endregion Public members

    //#region Private members

    private static readonly maxDefaultYAxesSelection: number = 4;

    private static readonly defaultChartOptions: IChartOptions = {
        chartType: ChartType.UnstackedColumn,
        columnsSelection: undefined,
        maxUniqueXValues: 100,
        exceedMaxDataPointLabel: 'OTHER',
        aggregationType: AggregationType.Sum,
        chartTheme: ChartTheme.Light,
        utcOffset: 0
    }

    private readonly seriesVisualize: SeriesVisualize;
    private readonly elementId: string;
    private readonly visualizer: IVisualizer;

    private queryResultData: IQueryResultData; // The original query result data
    private options: IChartOptions;

    //#endregion Private members

    //#region Constructor

    public constructor(elementId: string, visualizer: IVisualizer) {
        this.elementId = elementId;
        this.visualizer = visualizer;
        this.seriesVisualize = SeriesVisualize.getInstance();
    }

    //#endregion Constructor

    //#region Public methods

    public draw(queryResultData: IQueryResultData, chartOptions: IChartOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // Update the chart options with defaults for optional values that weren't provided
            chartOptions = this.updateDefaultChartOptions(queryResultData, chartOptions);
    
            // Detect the changes from the current chart
            const changes = ChangeDetection.detectChanges(this.queryResultData, this.options, queryResultData, chartOptions);
    
            // Update current options and data
            this.options = chartOptions;
            this.queryResultData = queryResultData;
            
            // First initialization / query data change / columns selection change
            if(!changes || changes.isPendingChange(ChartChange.QueryData) || changes.isPendingChange(ChartChange.ColumnsSelection)) {            
                // Apply query data transformation
                const transformed = this.transformQueryResultData(queryResultData, chartOptions);
                
                this.transformedQueryResultData = transformed.data;
            }
    
            const visualizerOptions = {
                elementId: this.elementId,
                queryResultData: this.transformedQueryResultData,
                chartOptions: chartOptions
            };
    
            let drawChartPromise: Promise<void>;

            // First initialization
            if(!changes) {
                drawChartPromise = this.visualizer.drawNewChart(visualizerOptions);
            } else { // Change existing chart
                drawChartPromise = this.visualizer.updateExistingChart(visualizerOptions, changes);
            }

            drawChartPromise
                .finally(() => {
                    resolve();

                    if(chartOptions.onFinishDrawing) {
                        chartOptions.onFinishDrawing();
                    }
                });
        });
    }

    public changeTheme(newTheme: ChartTheme): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if(this.options && this.options.chartTheme !== newTheme) {
                this.visualizer.changeTheme(newTheme)
                    .then(() => {
                        this.options.chartTheme = newTheme;
                        resolve();
                    });
            } else {
                resolve();
            }
        });
    }

    public getSupportedColumnTypes(chartType: ChartType): ISupportedColumnTypes {
        switch (chartType) {
            case ChartType.Pie:
            case ChartType.Donut: {
                return {
                    xAxis: [DraftColumnType.String],
                    yAxis: [DraftColumnType.Int, DraftColumnType.Long, DraftColumnType.Decimal, DraftColumnType.Real],
                    splitBy: [DraftColumnType.String, DraftColumnType.DateTime, DraftColumnType.Bool]
                }
            }

            default: {
                return {
                    xAxis: [DraftColumnType.DateTime, DraftColumnType.Int, DraftColumnType.Long, DraftColumnType.Decimal, DraftColumnType.Real, DraftColumnType.String],
                    yAxis: [DraftColumnType.Int, DraftColumnType.Long, DraftColumnType.Decimal, DraftColumnType.Real],
                    splitBy: [DraftColumnType.String]
                }
            }
        }
    }

    public getSupportedColumnsInResult(queryResultData: IQueryResultData, chartType: ChartType): ISupportedColumns {
        const transformedQueryResultData: IQueryResultData = this.tryResolveResultsAsSeries(queryResultData);
        const supportedColumnTypes: ISupportedColumnTypes = this.getSupportedColumnTypes(chartType);

        return {
            xAxis: this.getSupportedColumns(transformedQueryResultData, supportedColumnTypes.xAxis),
            yAxis: this.getSupportedColumns(transformedQueryResultData, supportedColumnTypes.yAxis),
            splitBy: this.getSupportedColumns(transformedQueryResultData, supportedColumnTypes.splitBy)
        }
    }

    public getDefaultSelection(queryResultData: IQueryResultData, chartType: ChartType, supportedColumnsForChart?: ISupportedColumns): IColumnsSelection {
        if (!supportedColumnsForChart) {
            supportedColumnsForChart = this.getSupportedColumnsInResult(queryResultData, chartType);
        }

        const defaultXAxis: IColumn = this.selectDefaultXAxis(supportedColumnsForChart.xAxis);
        const defaultSplitBy: IColumn = this.selectDefaultSplitByColumn(supportedColumnsForChart.splitBy, defaultXAxis, chartType);
        const defaultYAxes: IColumn[] = this.selectDefaultYAxes(supportedColumnsForChart.yAxis, defaultXAxis, defaultSplitBy, chartType);

        return {
            xAxis: defaultXAxis,
            yAxes: defaultYAxes,
            splitBy: defaultSplitBy ? [defaultSplitBy] : null
        }
    }

    //#endregion Public methods

    //#region Private methods

    /**
    * Convert the query result data to an object that the chart can be drawn with.
    * @param queryResultData Original query result data
    * @param chartOptions
    * @returns transformed data if the transformation succeeded. Otherwise - returns null
    */
    public transformQueryResultData(queryResultData: IQueryResultData, chartOptions: IChartOptions): ITransformedQueryResultData {
        // Try to resolve results as series
        const resolvedAsSeriesData: IQueryResultData = this.tryResolveResultsAsSeries(queryResultData);

        // Update the chart options with defaults for optional values that weren't provided
        chartOptions = this.updateDefaultChartOptions(resolvedAsSeriesData, chartOptions);

        const chartColumns: IColumn[] = [];
        const indexOfXAxisColumn: number[] = [];

        if (!this.addColumnsIfExistInResult([chartOptions.columnsSelection.xAxis], resolvedAsSeriesData, indexOfXAxisColumn, chartColumns)) {
            return null;
        }

        // Get all the indexes for all the splitBy columns
        const splitByColumnsSelection = chartOptions.columnsSelection.splitBy;
        const indexesOfSplitByColumns: number[] = [];

        if (splitByColumnsSelection && !this.addColumnsIfExistInResult(splitByColumnsSelection, resolvedAsSeriesData, indexesOfSplitByColumns, chartColumns)) {
            return null;
        }

        // Get all the indexes for all the y fields
        const indexesOfYAxes: number[] = [];

        if (!this.addColumnsIfExistInResult(chartOptions.columnsSelection.yAxes, resolvedAsSeriesData, indexesOfYAxes, chartColumns)) {
            return null;
        }

        // Create transformed rows for visualization
        const limitAndAggregateParams: ILimitAndAggregateParams = {
            queryResultData: resolvedAsSeriesData,
            axesIndexes: {
                xAxis: indexOfXAxisColumn[0],
                yAxes: indexesOfYAxes,
                splitBy: indexesOfSplitByColumns
            },
            xColumnType: chartOptions.columnsSelection.xAxis.type,
            aggregationType: chartOptions.aggregationType,
            maxUniqueXValues: chartOptions.maxUniqueXValues,
            otherStr: chartOptions.exceedMaxDataPointLabel
        }

        const limitedResults: LimitedResults = LimitVisResultsSingleton.limitAndAggregateRows(limitAndAggregateParams);

        return {
            data: {
                rows: limitedResults.rows,
                columns: chartColumns
            },
            limitedResults: limitedResults
        }
    }

    private tryResolveResultsAsSeries(queryResultData: IQueryResultData): IQueryResultData {
        const resolvedAsSeriesData: IQueryResultData = this.seriesVisualize.tryResolveResultsAsSeries(queryResultData);

        return resolvedAsSeriesData || queryResultData;
    }

    private getSupportedColumns(queryResultData: IQueryResultData, supportedTypes: DraftColumnType[]): IColumn[] {
        const supportedColumns: IColumn[] = queryResultData.columns.filter((column: IColumn) => {
            return supportedTypes.indexOf(column.type) !== -1;
        });

        return supportedColumns;
    }

    private selectDefaultXAxis(supportedColumns: IColumn[]): IColumn {
        if (!supportedColumns || supportedColumns.length === 0) {
            return null;
        }

        // Select the first DateTime column if exists
        for (let i = 0; i < supportedColumns.length; i++) {
            const column: IColumn = supportedColumns[i];

            if (column.type === DraftColumnType.DateTime) {
                return column;
            }
        }

        // If DateTime column doesn't exist - select the first supported column
        return supportedColumns[0];
    }

    private selectDefaultYAxes(supportedColumns: IColumn[], selectedXAxis: IColumn, selectedSplitBy: IColumn, chartType: ChartType): IColumn[] {
        if (!supportedColumns || supportedColumns.length === 0 || !selectedXAxis) {
            return null;
        }

        // Remove the selected XAxis and SplitBy columns from the supported columns
        const updatedSupportedColumns = supportedColumns.filter((column: IColumn) => {
            const isSelectedXAxis = column.name === selectedXAxis.name && column.type === selectedXAxis.type;
            const isSelectedSplitBy = selectedSplitBy && column.name === selectedSplitBy.name && column.type === selectedSplitBy.type;

            return !isSelectedXAxis && !isSelectedSplitBy;
        });

        if (updatedSupportedColumns.length === 0) {
            return null;
        }

        let numberOfDefaultYAxes: number = 1;

        // The y-axis is a single select when there is split-by, or for Pie / Donut charts
        if (chartType !== ChartType.Pie && chartType !== ChartType.Donut && !selectedSplitBy) {
            numberOfDefaultYAxes = KustoChartHelper.maxDefaultYAxesSelection;
        }

        const selectedYAxes: IColumn[] = updatedSupportedColumns.slice(0, numberOfDefaultYAxes);

        return selectedYAxes;
    }

    private selectDefaultSplitByColumn(supportedColumns: IColumn[], selectedXAxis: IColumn, chartType: ChartType): IColumn {
        // Pie / Donut chart default is without a splitBy column
        if (!supportedColumns || supportedColumns.length === 0 || !selectedXAxis || Utilities.isPieOrDonut(chartType)) {
            return null;
        }

        // Remove the selected XAxis column from the supported columns
        const updatedSupportedColumns = supportedColumns.filter((column: IColumn) => {
            return column.name !== selectedXAxis.name || column.type !== selectedXAxis.type;
        });

        if (updatedSupportedColumns.length > 0) {
            return updatedSupportedColumns[0];
        }

        return null;
    }

    /**
     * Search for certain columns in the 'queryResultData'. If the column exist:
     * 1. Add the column name and type to the 'chartColumns' array
     * 2. Add it's index in the queryResultData to the 'indexes' array
     * @param columnsToAdd - The columns that we want to search in the 'queryResultData'
     * @param queryResultData - The original query result data
     * @param indexes - The array that the existing columns index will be added to
     * @param chartColumns - The array that the existing columns will be added to
     *
     * @returns True if all the columns were found in 'queryResultData'
     */
    private addColumnsIfExistInResult(columnsToAdd: IColumn[], queryResultData: IQueryResultData, indexes: number[], chartColumns: IColumn[]): boolean {
        for (let i = 0; i < columnsToAdd.length; ++i) {
            const column = columnsToAdd[i];
            const indexOfColumn = Utilities.getColumnIndex(queryResultData, column);

            if (indexOfColumn < 0) {
                return false;
            }

            indexes.push(indexOfColumn);

            // Add each column name and type to the chartColumns
            chartColumns.push({
                name: <string>LimitVisResultsSingleton.escapeStr(column.name),
                type: column.type
            });
        }

        return true;
    }

    private updateDefaultChartOptions(queryResultData: IQueryResultData, chartOptions: IChartOptions): IChartOptions {
        const updatedChartOptions: IChartOptions = { ...KustoChartHelper.defaultChartOptions, ...chartOptions };

        // Apply default columns selection if columns selection wasn't provided
        if(!updatedChartOptions.columnsSelection) {
            updatedChartOptions.columnsSelection = this.getDefaultSelection(queryResultData, updatedChartOptions.chartType);
        }

        return updatedChartOptions;
    }

    //#endregion Private methods
}