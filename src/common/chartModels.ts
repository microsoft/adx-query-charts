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
    UnstackedArea = 'UnstackedArea',
    StackedArea = 'StackedArea',
    PercentageArea = 'PercentageArea',
    UnstackedColumn = 'UnstackedColumn',
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

export enum DateFormat {
    FullDate = 'FullDate',           // The full date and time. For example: 12/7/2019, 2:30:00.600
    Time = 'Time',                   // The full time, without the milliseconds. For example: 2:30:00
    FullTime = 'FullTime',           // The full time, including the milliseconds. For example: 2:30:00.600
    HourAndMinute = 'HourAndMinute', // The hours and minutes. For example: 2:30
    MonthAndDay = 'MonthAndDay',     // The month and day. For example: July 12th
    MonthAndYear = 'MonthAndYear',   // The month and day. For example: July 2019
    Year = 'Year'                    // The year. For example: 2019
}

export enum ChartTheme {
    Dark = 'Dark',
    Light = 'Light'
}

export enum DrawChartStatus {
    Success = 'Success',  // Successfully drawn the chart
    Failed = 'Failed',    // There was an error while trying to draw the chart
    Canceled = 'Canceled' // The chart drawing was canceled. See onFinishDataTransformation return value for more information regarding drawing cancellation
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

export interface IColumnsSelection extends IAxesInfo<IColumn> {}

export interface IDataTransformationInfo {
    /**
     * The amount of the data points that will be drawn for the chart
     */
    numberOfDataPoints: number;
  
     /**
     * True if the chart presents partial data from the original query results
     * The chart data will be partial when the maximum number of the unique X-axis values exceed the 'maxUniqueXValues' in 'IChartOptions'
     */
    isPartialData: boolean;
  
    /**
     * True if aggregation was applied on the original query results in order to draw the chart
     * See 'aggregationType' in 'IChartOptions' for more details
     */
    isAggregationApplied: boolean;
}

export interface IChartInfo {
    /**
     * The information regarding the applied transformations on the original query results
     */
    dataTransformationInfo: IDataTransformationInfo;

    /**
     * The status of the draw action
     */
    status: DrawChartStatus;
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
    columnsSelection?: IColumnsSelection;

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
    
    /**
     * The chart's title
     */
    title?: string;

    /**
     * The theme of the chart
     * [Default value: ChartTheme.Light]
     */
    chartTheme?: ChartTheme;
    
    /**
     * The desired offset from UTC in hours for date values. Used to handle timezone.
     * The offset will be added to the original date from the query results data.
     * For example:
     * For 'Africa/Harare' timezone provide utcOffset = 2 and the displayed date will be be '11/25/2019, 2:00 AM' instead of '11/25/2019, 12:00 AM' 
     * See time zone info: https://msdn.microsoft.com/en-us/library/ms912391(v=winembedded.11).aspx
     * [Default value: 0]
     */
    utcOffset?: number;
    
    /**
     * Callback that is used to format the date values both in the axis and the tooltip. If not provided - the default formatting will apply
     * Callback inputs:
     *     @param dateValue - The original date value. If utcOffset was provided, this value will include the utcOffset.
     *     @param defaultFormat - The default format of the label.
     * Callback return value:
     *     @returns The string represents the display value of the dateValue 
     */
    dateFormatter?: (dateValue: Date, defaultFormat: DateFormat) => string;

    /**
     * Callback that is used to format number values both in the axis and the tooltip. If isn't provided - the default formatting will apply.
     * Callback inputs:
     *     @param numberValue - The original number
     * Callback return value:
     *     @returns The string represents the display value of the numberValue
     */
    numberFormatter?: (numberValue: number) => string;

    /**
     * Callback that is used to get the xAxis title. If isn't provided - the xAxis title will be the xAxis column name.
     * Callback inputs:
     *     @param xAxisColumn - The x-axis column
     * Callback return value:
     *     @returns The desired x-axis title
     */
    xAxisTitleFormatter?: (xAxisColumn: IColumn) => string;

    /**
     * Callback that is called when all the data transformations required to draw the chart are finished.
     * Callback inputs:
     *     @param IChartInfo - The information regarding the applied transformations on the original query results
     * Callback return value:
     *     @returns The promise that is used to continue/stop drawing the chart. 
     *              When provided, the drawing of the chart will be suspended until this promise will be resolved.
     *              When resolved with true - the chart will continue the drawing.
     *              When resolved with false - the chart drawing will be canceled.
     */
    onFinishDataTransformation?: (dataTransformationInfo: IDataTransformationInfo) => Promise<boolean>;
    
    /**
     * Callback that is called when the chart drawing is finished.
     * Callback inputs:
     *    @param chartInfo - The information regarding the chart
     */
    onFinishDrawing?: (chartInfo: IChartInfo) => void;
}

export interface IChartHelper {
    /**
     * Draw the chart asynchronously
     * @param queryResultData - The original query result data
     * @param chartOptions - The information required to draw the chart
     * @returns Promise that is resolved when the chart is finished drawing. The promise will be resolved with information regarding the draw action
     */
    draw(queryResultData: IQueryResultData, chartOptions: IChartOptions): Promise<IChartInfo>;

    /**
     * Change the theme of an existing chart
     * @param newTheme - The theme to apply
     * @returns Promise that is resolved when the theme is applied
     */
    changeTheme(newTheme: ChartTheme): Promise<void>;

    /**
     * Get the supported column types for the axes and the split-by for a specific chart type
     * @param chartType - The type of the chart
     */
    getSupportedColumnTypes(chartType: ChartType): ISupportedColumnTypes;

    /**
     * Get the supported columns from the query result data for the axes and the split-by for a specific chart type
     * @param queryResultData - The original query result data
     * @param chartType - The type of the chart
     */
    getSupportedColumnsInResult(queryResultData: IQueryResultData, chartType: ChartType): ISupportedColumns;

    /**
     * Get the default columns selection from the query result data.
     * Select the default columns for the axes and the split-by for drawing a default chart of a specific chart type.
     * @param queryResultData - The original query result data
     * @param chartType - The type of the chart
     * @param supportedColumnsForChart - [Optional] The list of the supported column types for the axes and the split-by
     */
    getDefaultSelection(queryResultData: IQueryResultData, chartType: ChartType, supportedColumnsForChart?: ISupportedColumns): IColumnsSelection;
}