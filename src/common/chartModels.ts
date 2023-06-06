'use strict';

import { ICustomVizualizerChartOptions } from "../visualizers/customVizualizerChartOptions";
import { ChartError } from "./errors/errors";

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
    getPosition?: Function;
}

export interface IQueryResultData {
    rows: IRow[] | ISeriesRow[];
    columns: IColumn[];
}

export interface IDataPointInfo {
    column: IColumn;
    value: IRowValue;
}

export interface IDataPoint {
    x: IDataPointInfo;
    y: IDataPointInfo;
    splitBy?: IDataPointInfo;
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
    UnstackedBar = 'UnstackedBar',
    StackedBar = 'StackedBar',
    PercentageBar = 'PercentageBar',
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

export enum LegendPosition {
    Bottom = 'Bottom',
    Right = 'Right'
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

export class ColumnsSelection implements IAxesInfo<IColumn> {
    public xAxis: IColumn;
    public yAxes: IColumn[];
    public splitBy?: IColumn[];
}

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
   
    /**
     * The error information in case that the draw action failed
     */
    error?: ChartError;
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
     * extra custom chart options
     */
    customVizualizerChartOptions?: ICustomVizualizerChartOptions;

    /**
     * The columns selection for the Axes and the split-by of the chart
     * If not provided, default columns will be selected. See: getDefaultSelection method
     */
    columnsSelection?: ColumnsSelection;

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
     * The legend configuration options
     */
    legendOptions?: ILegendOptions;

    /**
     * The minimum value to be displayed on the y-axis
     * If not provided, the minimum value is automatically calculated
     */
    yMinimumValue?: number;

    /**
     * The maximum value to be displayed on y-axis
     * If not provided, the maximum value is automatically calculated
     */
    yMaximumValue?: number;
    
    /**
     * The duration of the animation for chart rendering. 
     * The animation can be disabled by setting it to 0.
     * [Default value: 1000]
     */
    animationDurationMS?: number;

    /**
     * Chart labels font family
     * [Default value: az_ea_font, wf_segoe-ui_normal, "Segoe UI", "Segoe WP", Tahoma, Arial, sans-serif]
     */
    fontFamily?: string;

     /**
     * Callback that is used to get the desired offset from UTC in minutes for date value. Used to handle timezone.
     * The offset will be added to the original UTC date from the query results data.
     * If dateFormatter wasn't provided, the callback will be also used for the X axis labels and the tooltip header. Otherwise - it will only be used for positioning the x-axis.
     * Callback inputs:
     *     @param dateValue - The original date value in milliseconds since midnight, January 1, 1970 UTC. For example: 1574666160000 represents '2019-11-25T07:16:00.000Z'
     * Callback return value:
     *     @returns The desired offset from UTC in minutes for date value. For example:
     *              For 'South Africa Standard Time' timezone return -120 and the displayed date will be '11/25/2019, 02:00 PM' instead of '11/25/2019, 04:00 PM'
     *              See time zone info: https://msdn.microsoft.com/en-us/library/ms912391(v=winembedded.11).aspx
     * [Default value: () => { return 0; }]
     */
    getUtcOffset?: (dateValue: number) => number;
    
    /**
     * Callback that is used to format the date values both in the axis and the tooltip. If not provided - the default formatting will apply.
     * Callback inputs:
     *     @param dateValue - The original date value in milliseconds since midnight, January 1, 1970 UTC. For example: 1574666160000 represents '2019-11-25T07:16:00.000Z'
     *     @param defaultFormat - The default format of the label.
     * Callback return value:
     *     @returns The string represents the display value of the dateValue 
     */
    dateFormatter?: (dateValue: number, defaultFormat: DateFormat) => string;

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
     * Callback that is used to get the yAxis title. If isn't provided - the yAxis title will be the first yAxis column name.
     * Callback inputs:
     *     @param yAxisColumns - The y-axis columns
     * Callback return value:
     *     @returns The desired y-axis title
     */
    yAxisTitleFormatter?: (yAxisColumns: IColumn[]) => string;

    /**
     * Callback that is called to allow altering the options of the external charting library before rendering the chart.
     * Used to allow flexibility and control of the external charting library.
     * USE WITH CAUTION - changing the original options might break the functionality / backward compatibility when using a different IVisualizer or upgrading the charting library.
     * Validating the updated options is the user's responsibility.
     * For official chart options - please make contribution to the base code.
     * Callback inputs:
     *     @param originalOptions - The custom charting options that are given to the external charting library.
     */
    updateCustomOptions?: (originalOptions: any) => void;

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
     
    /**
     * Callback that is called when the chart animation is finished.
     * Callback inputs:
     *    @param chartInfo - The information regarding the chart
     */
    onFinishChartAnimation?: (chartInfo: IChartInfo) => void;
         
    /**
     * When this callback is provided, the chart data points will be clickable.
     * The callback will be called when chart's data point will be clicked, providing the clicked data point information.
     * Callback inputs:
     *    @param dataPoint - The information regarding the columns and values of the clicked data point. 
     *                       Note that the value of a date-time column in the dataPoint object will be its numeric value - Date.valueOf().
     */
    onDataPointClicked?: (dataPoint: IDataPoint) => void;
}

export interface ILegendOptions {
    /**
     * When set to false the legend is hidden, otherwise the legend is visible 
     * [Default value: true (show legend)]
     */
    isEnabled?: boolean;

    /**
     * The position of the legend (relative to the chart)
     * [Default value: Bottom]
     */
    position?: LegendPosition;
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
    getDefaultSelection(queryResultData: IQueryResultData, chartType: ChartType, supportedColumnsForChart?: ISupportedColumns): ColumnsSelection;

    /**
     * Download the chart as JPG image
     * @param onError - [Optional] A callback that will be called if the module failed to export the chart image
     */
    downloadChartJPGImage(onError?: (error: ChartError) => void): void;
}