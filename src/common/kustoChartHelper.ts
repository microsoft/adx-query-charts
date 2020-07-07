'use strict';

//#region Imports

import * as _ from 'lodash';
import { IChartHelper, IQueryResultData, ChartType, DraftColumnType, ISupportedColumnTypes, IColumn, ISupportedColumns, ColumnsSelection, IChartOptions, AggregationType, ChartTheme, IChartInfo, DrawChartStatus } from './chartModels';
import { SeriesVisualize } from '../transformers/seriesVisualize';
import { LimitVisResultsSingleton, LimitedResults, ILimitAndAggregateParams } from '../transformers/limitVisResults';
import { IVisualizer } from '../visualizers/IVisualizer';
import { Utilities } from './utilities';
import { ChartChange } from './chartChange';
import { ChangeDetection } from './changeDetection';
import { ChartInfo } from './chartInfo';
import { IVisualizerOptions } from '../visualizers/IVisualizerOptions';
import { InvalidInputError, ChartError } from './errors/errors';
import { ErrorCode } from './errors/errorCode';

//#endregion Imports

interface ITransformedQueryResultData {
    data: IQueryResultData;
    limitedResults: LimitedResults;
}

type ResolveFn = (value?: IChartInfo | PromiseLike<IChartInfo>) => void;

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
        animationDurationMS: 1000,
        getUtcOffset: () => { return 0; },
        fontFamily: `az_ea_font, wf_segoe-ui_normal, "Segoe UI", "Segoe WP", Tahoma, Arial, sans-serif`,
        legendOptions: {
            isEnabled: true
        }
    }

    private readonly seriesVisualize: SeriesVisualize;
    private readonly elementId: string;
    private readonly visualizer: IVisualizer;

    private queryResultData: IQueryResultData; // The original query result data
    private options: IChartOptions;
    private chartInfo: IChartInfo;

    //#endregion Private members

    //#region Constructor

    public constructor(elementId: string, visualizer: IVisualizer) {
        this.elementId = elementId;
        this.visualizer = visualizer;
        this.seriesVisualize = SeriesVisualize.getInstance();
    }

    //#endregion Constructor

    //#region Public methods

    public draw(queryResultData: IQueryResultData, chartOptions: IChartOptions): Promise<IChartInfo> {
        return new Promise((resolve, reject) => {
            try {
                this.verifyInput(queryResultData, chartOptions);

                // Update the chart options with defaults for optional values that weren't provided
                chartOptions = this.updateDefaultChartOptions(queryResultData, chartOptions);

                // Detect the changes from the current chart
                const changes = ChangeDetection.detectChanges(this.queryResultData, this.options, queryResultData, chartOptions);
        
                // Update current options and data
                this.options = chartOptions;
                this.queryResultData = queryResultData;
                
                // First initialization / query data change / columns selection change / aggregation type change
                if (!changes || changes.isPendingChange(ChartChange.QueryData) || changes.isPendingChange(ChartChange.ColumnsSelection) || changes.isPendingChange(ChartChange.AggregationType)) {    
                    this.chartInfo = new ChartInfo();
    
                    // Apply query data transformation
                    const transformed = this.transformQueryResultData(queryResultData, chartOptions);

                    this.transformedQueryResultData = transformed.data;
                    this.chartInfo.dataTransformationInfo.isAggregationApplied = transformed.limitedResults.isAggregationApplied;
                    this.chartInfo.dataTransformationInfo.isPartialData = transformed.limitedResults.isPartialData;
                }
        
                const visualizerOptions: IVisualizerOptions = {
                    elementId: this.elementId,
                    queryResultData: this.transformedQueryResultData,
                    chartOptions: chartOptions,
                    chartInfo: this.chartInfo
                };
        
                let drawChartPromise: Promise<void>;
    
                // First initialization
                if (!changes) {
                    drawChartPromise = this.visualizer.drawNewChart(visualizerOptions);
                } else { // Change existing chart
                    drawChartPromise = this.visualizer.updateExistingChart(visualizerOptions, changes);
                }
    
                drawChartPromise
                    .then(() => {
                        this.finishDrawing(resolve, chartOptions);
                    })
                    .catch((ex) => {
                        this.onError(resolve, chartOptions, ex);               
                    });                   
            } catch (ex) {
                this.onError(resolve, chartOptions, ex);
            }
        });
    }

    public changeTheme(newTheme: ChartTheme): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.options && this.options.chartTheme !== newTheme) {
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

    public getDefaultSelection(queryResultData: IQueryResultData, chartType: ChartType, supportedColumnsForChart?: ISupportedColumns): ColumnsSelection {
        if (!supportedColumnsForChart) {
            supportedColumnsForChart = this.getSupportedColumnsInResult(queryResultData, chartType);
        }

        const columnsSelection = new ColumnsSelection();
        const supportedXAxisColumns = supportedColumnsForChart.xAxis;
        const supportedYAxisColumns = supportedColumnsForChart.yAxis;

        if (!supportedXAxisColumns || supportedXAxisColumns.length === 0 || !supportedYAxisColumns || supportedYAxisColumns.length === 0) {
            return columnsSelection; // Not enough supported columns - return empty selection
        }
        
        if (supportedYAxisColumns.length === 1) {            
            columnsSelection.yAxes = supportedYAxisColumns; // If only 1 column is supported as y-axis column - select it
        }

        columnsSelection.xAxis = this.selectDefaultXAxis(supportedXAxisColumns, columnsSelection);
        if (!columnsSelection.xAxis) {
            return columnsSelection;
        }

        const defaultSplitBy = this.selectDefaultSplitByColumn(supportedColumnsForChart.splitBy, columnsSelection, chartType);

        columnsSelection.splitBy = defaultSplitBy ? [defaultSplitBy] : null;
        if (!columnsSelection.yAxes) {
            columnsSelection.yAxes = this.selectDefaultYAxes(supportedYAxisColumns, columnsSelection, chartType);
        }
        
        return columnsSelection;
    }

    public downloadChartJPGImage() {
        this.visualizer.downloadChartJPGImage();
    }

    //#endregion Public methods

    //#region Private methods

    /**
    * Convert the query result data to an object that the chart can be drawn with.
    * @param queryResultData Original query result data
    * @param chartOptions
    * @returns transformed data if the transformation succeeded. Otherwise - returns null
    */
   private transformQueryResultData(queryResultData: IQueryResultData, chartOptions: IChartOptions): ITransformedQueryResultData {
        // Try to resolve results as series
        const resolvedAsSeriesData: IQueryResultData = this.tryResolveResultsAsSeries(queryResultData);

        // Update the chart options with defaults for optional values that weren't provided
        chartOptions = this.updateDefaultChartOptions(resolvedAsSeriesData, chartOptions);

        const chartColumns: IColumn[] = [];
        const indexOfXAxisColumn: number[] = [];
        const xAxisColumn = chartOptions.columnsSelection.xAxis;

        // X-Axis
        let notFoundColumns: IColumn[] = this.addColumnsIfExistInResult([xAxisColumn], resolvedAsSeriesData, indexOfXAxisColumn, chartColumns);

        this.throwInvalidColumnsSelectionIfNeeded(notFoundColumns, 'x-axis', resolvedAsSeriesData);

        // Get all the indexes for all the splitBy columns
        const splitByColumnsSelection = chartOptions.columnsSelection.splitBy;
        const indexesOfSplitByColumns: number[] = [];

        if (splitByColumnsSelection) {
            notFoundColumns = this.addColumnsIfExistInResult(splitByColumnsSelection, resolvedAsSeriesData, indexesOfSplitByColumns, chartColumns);

            this.throwInvalidColumnsSelectionIfNeeded(notFoundColumns, 'split-by', resolvedAsSeriesData);
        }

        // Get all the indexes for all the y fields
        const indexesOfYAxes: number[] = [];

        notFoundColumns = this.addColumnsIfExistInResult(chartOptions.columnsSelection.yAxes, resolvedAsSeriesData, indexesOfYAxes, chartColumns);

        this.throwInvalidColumnsSelectionIfNeeded(notFoundColumns, 'y-axes', resolvedAsSeriesData);
        
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

    private throwInvalidColumnsSelectionIfNeeded(notFoundColumns: IColumn[], axesStr: string, queryResultData: IQueryResultData) {
        if (notFoundColumns.length > 0) {
            const errorMessage: string =
`One or more of the selected ${axesStr} columns don't exist in the query result data: 
${this.getColumnsStr(notFoundColumns)}
columns in query data:
${this.getColumnsStr(queryResultData.columns)}`;

            throw new InvalidInputError(errorMessage, ErrorCode.InvalidColumnsSelection);
        }
    }

    private getColumnsStr(columns: IColumn[]): string {
        const columnsStr: string = _.map(columns, (column) => {
            return `name = '${column.name}' type = '${column.type}'`;
        }).join(', ');

        return columnsStr;
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

    private selectDefaultXAxis(supportedColumns: IColumn[], currentSelection: ColumnsSelection): IColumn {
        const updatedSupportedColumns = this.removeSelectedColumns(supportedColumns, currentSelection);

        if (updatedSupportedColumns.length === 0) {
            return null;
        }

        // Select the first DateTime column if exists
        for (let i = 0; i < updatedSupportedColumns.length; i++) {
            const column: IColumn = updatedSupportedColumns[i];

            if (column.type === DraftColumnType.DateTime) {
                return column;
            }
        }

        // If DateTime column doesn't exist - select the first supported column
        return updatedSupportedColumns[0];
    }

    private selectDefaultYAxes(supportedColumns: IColumn[], currentSelection: ColumnsSelection, chartType: ChartType): IColumn[] {
        if (!supportedColumns || supportedColumns.length === 0) {
            return null;
        }

        
        // Remove the selected columns from the supported columns
        const updatedSupportedColumns = this.removeSelectedColumns(supportedColumns, currentSelection);

        if (updatedSupportedColumns.length === 0) {
            return null;
        }

        let numberOfDefaultYAxes: number = 1;

        // The y-axis is a single select when there is split-by, or for Pie / Donut charts
        if (!Utilities.isPieOrDonut(chartType) && !currentSelection.splitBy) {
            numberOfDefaultYAxes = KustoChartHelper.maxDefaultYAxesSelection;
        }

        const selectedYAxes: IColumn[] = updatedSupportedColumns.slice(0, numberOfDefaultYAxes);

        return selectedYAxes;
    }

    private selectDefaultSplitByColumn(supportedColumns: IColumn[], currentSelection: ColumnsSelection, chartType: ChartType): IColumn {
        // Pie / Donut chart default is without a splitBy column
        if (!supportedColumns || supportedColumns.length === 0 || Utilities.isPieOrDonut(chartType)) {
            return null;
        }

        // Remove the selected columns from the supported columns
        const updatedSupportedColumns = this.removeSelectedColumns(supportedColumns, currentSelection);

        if (updatedSupportedColumns.length > 0) {
            return updatedSupportedColumns[0];
        }

        return null;
    }

    /**
     * Removes the columns that are already selected from the supportedColumns array in order to prevent the selection of the same column in different axes
     * @param supportedColumns - The list of the supported columns for current axis
     * @param currentSelection - The list of the columns that are already selected
     * @returns - The supportedColumns after the removal of the selected columns
     */
    private removeSelectedColumns(supportedColumns: IColumn[], currentSelection: ColumnsSelection): IColumn[] {
        const selectedColumns: IColumn[] = _.concat(currentSelection.xAxis || [], currentSelection.yAxes || [], currentSelection.splitBy || []);
        
        // No columns are selected - do nothing
        if (selectedColumns.length === 0) {
            return supportedColumns;
        }

        // Remove the selected columns from the supported columns
        const updatedSupportedColumns = supportedColumns.filter(supported => _.findIndex(selectedColumns, (selected) => selected.name === supported.name) === -1);

        return updatedSupportedColumns;
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
     * @returns An array of the columns that don't exist in the queryResultData. If all columns exist - the array will be empty.
     */
    private addColumnsIfExistInResult(columnsToAdd: IColumn[], queryResultData: IQueryResultData, indexes: number[], chartColumns: IColumn[]): IColumn[] {
        const notFoundColumns: IColumn[] = [];

        for (let i = 0; i < columnsToAdd.length; ++i) {
            const column = columnsToAdd[i];
            const indexOfColumn = Utilities.getColumnIndex(queryResultData, column);

            if (indexOfColumn < 0) {
                notFoundColumns.push(column);

                continue;
            }

            indexes.push(indexOfColumn);
            const originalColumn = queryResultData.columns[indexOfColumn];

            // Add each column name and type to the chartColumns
            chartColumns.push({
                name: <string>LimitVisResultsSingleton.escapeStr(originalColumn.name),
                type: originalColumn.type
            });
        }

        return notFoundColumns;
    }

    private updateDefaultChartOptions(queryResultData: IQueryResultData, chartOptions: IChartOptions): IChartOptions {
        const updatedChartOptions: IChartOptions = { ...KustoChartHelper.defaultChartOptions, ...chartOptions };

        // Apply default columns selection if columns selection wasn't provided
        if (!updatedChartOptions.columnsSelection) {
            updatedChartOptions.columnsSelection = this.getDefaultSelection(queryResultData, updatedChartOptions.chartType);

            if (!updatedChartOptions.columnsSelection.xAxis || !updatedChartOptions.columnsSelection.yAxes || updatedChartOptions.columnsSelection.yAxes.length === 0) {
                throw new InvalidInputError(
                    "Wasn't able to create default columns selection. Probably there are not enough columns to create the chart. Try using the 'getSupportedColumnsInResult' method",
                    ErrorCode.InvalidQueryResultData);
            }
        }

        return updatedChartOptions;
    }

    private verifyInput(queryResultData: IQueryResultData, chartOptions: IChartOptions): void {
        if (!queryResultData) {
           throw new InvalidInputError("The queryResultData can't be empty", ErrorCode.InvalidQueryResultData);
        } else if (!queryResultData.rows || !queryResultData.columns) {
            throw new InvalidInputError("The queryResultData must contain rows and columns", ErrorCode.InvalidQueryResultData);
        }
        
        this.verifyColumnsSelection(chartOptions, queryResultData);

        // Make sure the columns selection is supported
        const supportedColumnTypes = this.getSupportedColumnTypes(chartOptions.chartType);

        this.verifyColumnTypeIsSupported(supportedColumnTypes.xAxis, chartOptions.columnsSelection.xAxis, chartOptions, 'x-axis');

        chartOptions.columnsSelection.yAxes.forEach((yAxis) => {
            this.verifyColumnTypeIsSupported(supportedColumnTypes.yAxis, yAxis, chartOptions, 'y-axes');
        });

        if (chartOptions.columnsSelection.splitBy) {        
            chartOptions.columnsSelection.splitBy.forEach((splitBy) => {
                this.verifyColumnTypeIsSupported(supportedColumnTypes.splitBy, splitBy, chartOptions, 'split-by');
            });
        }
    }

    private verifyColumnsSelection(chartOptions: IChartOptions, queryResultData: IQueryResultData): void {
        let invalidColumnsSelectionErrorMessage: string;

        if(chartOptions.columnsSelection) {
            invalidColumnsSelectionErrorMessage = "Invalid columnsSelection.";
        } else {
            // If columns selection wasn't provided - make sure the default selection can apply
            chartOptions.columnsSelection = this.getDefaultSelection(queryResultData, chartOptions.chartType);
            invalidColumnsSelectionErrorMessage = "Wasn't able to apply default columnsSelection.";
        }

        if(!chartOptions.columnsSelection.xAxis || !chartOptions.columnsSelection.yAxes || chartOptions.columnsSelection.yAxes.length === 0) {
            throw new InvalidInputError(invalidColumnsSelectionErrorMessage + " The columnsSelection must contain at least 1 x-axis and y-axis column", ErrorCode.InvalidColumnsSelection);
        }
    }

    private verifyColumnTypeIsSupported(supportedTypes: DraftColumnType[], column: IColumn, chartOptions: IChartOptions, axisStr: string): void {
        if (supportedTypes.indexOf(column.type) < 0) {
            const supportedStr = supportedTypes.join(', ');

            throw new InvalidInputError(
                `Invalid columnsSelection. The type '${column.type}' isn't supported for ${axisStr} of ${chartOptions.chartType}. The supported column types are: ${supportedStr}`,
                ErrorCode.UnsupportedTypeInColumnsSelection);
        }
    }

    private finishDrawing(resolve: ResolveFn, chartOptions: IChartOptions): void {
        if (chartOptions.onFinishDrawing) {
            chartOptions.onFinishDrawing(this.chartInfo);
        }

        resolve(this.chartInfo);
    }

    private onError(resolve: ResolveFn, chartOptions: IChartOptions, error: ChartError): void {
        this.chartInfo = new ChartInfo();
        this.chartInfo.status = DrawChartStatus.Failed;
        this.chartInfo.error = error;
        this.finishDrawing(resolve, chartOptions);
    }

    //#endregion Private methods
}