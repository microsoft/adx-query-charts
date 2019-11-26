'use strict';

//#region Draft contracts

// See: https://kusto.azurewebsites.net/docs/query/scalar-data-types/index.html
export enum DraftColumnType {
    Bool = 'bool',
    DateTime = 'datetime',
    Decimal = 'decimal',
    Dynamic = 'dynamic',
    Guid = 'guid',
    Int = 'int',
    Long = 'long',
    Real = 'real',
    String = 'string',
    TimeSpan = 'timespan'
}

//#endregion Draft contracts

export type IRowValue = string | number;
export type ISeriesRowValue = IRowValue | string[] | number[];
export type IRow = IRowValue[];
export type ISeriesRow = ISeriesRowValue[];

export interface IColumn {
    name: string;
    type: DraftColumnType;
}

export interface IQueryResultData {
    rows: IRow[] | ISeriesRow[];
    columns: IColumn[];
}

export enum ChartType {
    Line = 'Line',
    Scatter = 'Scatter',
    Area = 'Area',
    StackedArea = 'StackedArea',
    PercentageArea = 'PercentageArea',
    Column = 'Column',
    StackedColumn = 'StackedColumn',
    PercentageColumn = 'PercentageColumn',
    Pie = 'Pie',
    Donut = 'Donut',
}

export enum AggregationType {
    Sum = 'Sum',
    Average = 'Average',
    Min = 'Min',
    Max = 'Max'
}

export interface ISupportedColumnTypes {
    xAxis: DraftColumnType[];
    yAxis: DraftColumnType[];
    splitBy: DraftColumnType[];
}

export interface ISupportedColumns {
    xAxis: IColumn[];
    yAxis: IColumn[];
    splitBy: IColumn[];
}

export interface IAxesInfo<T> {
    xAxis: T;
    yAxes: T[];
    splitBy?: T[];
}

/**
 * The information required to draw the chart
 */
export interface IChartOptions {
    /**
     * The type of the chart to draw
     */
    chartType: ChartType;

    /**
     * The columns selection for the Axes and the split-by of the chart
     * If not provided, default columns will be selected. See: getDefaultSelection method
     */
    columnsSelection?: IAxesInfo<IColumn>;

    /**
     * The maximum number of the unique X-axis values.
     * The chart will show the biggest values, and the rest will be aggregated to a separate data point.
     *
     * [Default value: 100]
     */
    maxUniqueXValues?: number;

    /**
     * The label of the data point that contains the aggregated value of all the X-axis values that exceed the 'maxUniqueXValues'
     *
     * [Default value: 'OTHER']
     */
    exceedMaxDataPointLabel?: string;

    /**
     * Multiple rows with the same values for the X-axis and the split-by will be aggregated using a function of this type.
     * For example, assume we get the following query result data:
     * timestamp            | client_Browser        | count_
     * 2016-08-02T10:00:00Z	| Chrome 51.0	        | 15
     * 2016-08-02T10:00:00Z	| Internet Explorer 9.0	| 4
     * When drawing a chart with columnsSelection = { xAxis: timestamp, yAxes: count_ }, and aggregationType = AggregationType.Sum
     * we need to aggregate the values of the same timestamp value and return one row with ["2016-08-02T10:00:00Z", 19]
     *
     * [Default value: AggregationType.Sum]
     */
    aggregationType?: AggregationType;
}

export interface IChartHelper {
    /**
     * Draw the chart
     * @param queryResultData - The original query result data
     * @param options - The information required to draw the chart
     */
    draw(queryResultData: IQueryResultData, options: IChartOptions): void;

    /**
     * Return the supported column types for the axes and the split-by for a specific chart type
     * @param chartType - The type of the chart
     */
    getSupportedColumnTypes(chartType: ChartType): ISupportedColumnTypes;

    /**
     * Return the supported columns from the query result data for the axes and the split-by for a specific chart type
     * @param queryResultData - The original query result data
     * @param chartType - The type of the chart
     */
    getSupportedColumnsInResult(queryResultData: IQueryResultData, chartType: ChartType): ISupportedColumns;

    /**
     * Return the default columns selection from the query result data.
     * Select the default columns for the axes and the split-by for drawing a default chart of a specific chart type.
     * @param queryResultData - The original query result data
     * @param chartType - The type of the chart
     * @param supportedColumnsForChart - [Optional] The list of the supported column types for the axes and the split-by
     */
    getDefaultSelection(queryResultData: IQueryResultData, chartType: ChartType, supportedColumnsForChart?: ISupportedColumns): IAxesInfo<IColumn>;
}