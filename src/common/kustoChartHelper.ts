'use strict';

//#region Imports

import { IChartHelper, IQueryResultData, ChartType, DraftColumnType, ISupportedColumnTypes, IColumn, ISupportedColumns, IColumnsSelection, IChartOptions, AggregationType } from './chartModels';
import { SeriesVisualize } from '../transformers/seriesVisualize';
import { LimitVisResultsSingleton, LimitedResults, ILimitAndAggregateParams } from '../transformers/limitVisResults';

//#endregion Imports

export interface ITransformedQueryResultData {
    data: IQueryResultData;
    limitedResults: LimitedResults;
}

export class KustoChartHelper implements IChartHelper {
    //#region Private members

    private static readonly maxDefaultYAxesSelection: number = 4;

    private static readonly defaultChartOptions: IChartOptions = {
        chartType: ChartType.Column,
        columnsSelection: undefined,
        maxUniqueXValues: 100,
        exceedMaxDataPointLabel: 'OTHER',
        aggregationType: AggregationType.Sum
    }

    private readonly seriesVisualize: SeriesVisualize;
    private queryResultData: IQueryResultData;
    private transformedQueryResultData?: IQueryResultData;

    //#endregion Private members

    //#region Public methods

    public draw(queryResultData: IQueryResultData, options: IChartOptions): void {
        // TODO: Not implemented yet
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
        const defaultYAxes: IColumn[] = this.selectDefaultYAxes(supportedColumnsForChart.yAxis, defaultXAxis, defaultSplitBy);

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
        // Update the chart options with defaults for optional values that weren't provided
        chartOptions = this.updateDefaultChartOptions(chartOptions);
        const chartColumns: IColumn[] = [];
        const indexOfXAxisColumn: number[] = [];

        if (!this.addColumnsIfExistInResult([chartOptions.columnsSelection.xAxis], queryResultData, indexOfXAxisColumn, chartColumns)) {
            return null;
        }

        // Get all the indexes for all the splitBy columns
        const indexesOfSplitByColumns: number[] = [];

        if (!this.addColumnsIfExistInResult(chartOptions.columnsSelection.splitBy, queryResultData, indexesOfSplitByColumns, chartColumns)) {
            return null;
        }

        // Get all the indexes for all the y fields
        const indexesOfYAxes: number[] = [];

        if (!this.addColumnsIfExistInResult(chartOptions.columnsSelection.yAxes, queryResultData, indexesOfYAxes, chartColumns)) {
            return null;
        }

        // Create transformed rows for visualization
        const limitAndAggregateParams: ILimitAndAggregateParams = {
            queryResultData: queryResultData,
            indexOfXColumn: indexOfXAxisColumn[0],
            indexesOfYColumns: indexesOfYAxes,
            indexesOfSplitByColumns: indexesOfSplitByColumns,
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
        // Transform the query results only once
        if (this.queryResultData !== queryResultData) {
            this.queryResultData = queryResultData;
            this.transformedQueryResultData = queryResultData;

            // Tries to resolve the results as series
            const updatedQueryResultData: IQueryResultData = this.seriesVisualize.tryResolveResultsAsSeries(queryResultData);

            if (updatedQueryResultData) {
                this.transformedQueryResultData = updatedQueryResultData;
            }
        }

        return this.transformedQueryResultData;
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

    private selectDefaultYAxes(supportedColumns: IColumn[], selectedXAxis: IColumn, selectedSplitBy?: IColumn): IColumn[] {
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

        const numberOfDefaultYAxes: number = selectedSplitBy ? 1 : KustoChartHelper.maxDefaultYAxesSelection;
        const selectedYAxes: IColumn[] = updatedSupportedColumns.slice(0, numberOfDefaultYAxes);

        return selectedYAxes;
    }

    private selectDefaultSplitByColumn(supportedColumns: IColumn[], selectedXAxis: IColumn, chartType: ChartType): IColumn {
        // Pie / Donut chart default is without a splitBy column
        if (!supportedColumns || supportedColumns.length === 0 || !selectedXAxis || chartType === ChartType.Pie || chartType === ChartType.Donut) {
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

    // Returns the index of the column with the same name and type in the columns array
    private getColumnIndex(queryResultData: IQueryResultData, columnToFind: IColumn): number {
        const columns: IColumn[] = queryResultData && queryResultData.columns;

        if (!columns) {
            return -1;
        }

        for (let i = 0; i < columns.length; i++) {
            const currentColumn: IColumn = columns[i];

            if (currentColumn.name == columnToFind.name && currentColumn.type == columnToFind.type) {
                return i;
            }
        }

        return -1;
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
            const indexOfColumn = this.getColumnIndex(queryResultData, column);

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

    private updateDefaultChartOptions(chartOptions: IChartOptions): IChartOptions {
        const updatedChartOptions: IChartOptions = { ...KustoChartHelper.defaultChartOptions, ...chartOptions };

        return updatedChartOptions;
    }

    //#endregion Private methods
}