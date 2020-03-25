# adx-query-charts
[![Build Status](https://travis-ci.org/microsoft/adx-query-charts.svg?branch=master)](https://travis-ci.org/microsoft/adx-query-charts)&nbsp;&nbsp;&nbsp;&nbsp;[![npm version](https://badge.fury.io/js/adx-query-charts.svg)](https://badge.fury.io/js/adx-query-charts)

Draw charts from Azure Data Explorer queries

## Installation 
npm install adx-query-charts

## Dependencies 
1. [lodash](https://www.npmjs.com/package/lodash): `npm i lodash`
2. [css-element-queries](https://www.npmjs.com/package/css-element-queries): `npm i css-element-queries`
3. [highcharts](https://www.npmjs.com/package/highcharts): `npm i highcharts`
<b>Please note</b>: Highcharts/Highstock libraries are free to use with Log Analytics/adx-query-charts. <br>If you plan to use Highcharts separately, in your own project, you must obtain a license: <br>follow the link − [License and Pricing](https://shop.highsoft.com/highcharts).

## Usage
```typescript
import * as Charts from 'adx-query-charts';

const highchartsVisualizer = new Charts.HighchartsVisualizer();
const chartHelper = chartHelper = new Charts.KustoChartHelper('chart-elem-id', highchartsVisualizer);
const chartOptions: Charts.IChartOptions = {
    chartType: Charts.ChartType.UnstackedColumn,
    columnsSelection: {
        xAxis: { name: 'timestamp', type: Charts.DraftColumnType.DateTime },
        yAxes: [{ name: 'requestCount', type: Charts.DraftColumnType.Int }]
    }
};

// Draw the chart - the chart will be drawn inside an element with 'chart-elem-id' id
chartHelper.draw(queryResultData, chartOptions);
```
## API

### KustoChartHelper
| Method:                  | Description:              | Input:                                                                        | Return value:    |
| ------------------------ |-------------------------- | ----------------------------------------------------------------------------- | ---------------- |
| draw                     | Draw the chart            | [IQueryResultData](#IQueryResultData) - The original query result data<br>[IChartOptions](#IChartOptions) - The information required to draw the chart  | Promise&lt;[IChartInfo](#IChartInfo)&gt; |
| changeTheme              | Change the theme of an existing chart | [ChartTheme](#ChartTheme) - The theme to apply   | Promise&lt;void&gt; |
| getSupportedColumnTypes  | Get the supported column types for the axes and the split-by<br>for a specific chart type | [ChartType](#ChartType) - The type of the chart  | [ISupportedColumnTypes](#ISupportedColumnTypes) |
| getSupportedColumnsInResult | Get the supported columns from the query result data for the axes and the split-by for a specific chart type | [IQueryResultData](#IQueryResultData) - The original query result data<br> [ChartType](#ChartType) - The type of the chart | [ISupportedColumns](#ISupportedColumns) |
| getDefaultSelection      | Get the default columns selection from the query result data.<br>Select the default columns for the axes and the split-by for drawing a default chart of a specific chart type. |  [IQueryResultData](#IQueryResultData) - The original query result data<br> [ChartType](#ChartType) - The type of the chart<br>[ISupportedColumns](#ISupportedColumns) - (Optional) The list of the supported column types for the axes and the split-by | [ColumnsSelection](#ColumnsSelection) |
| downloadChartJPGImage    | Download the chart as JPG image |  (error: Error) => void - [Optional] A callback that will be called if the module failed to export the chart image  |  void |

### IChartOptions
| Option name:           | Type:                   | Details:                                                         | Default value:  |
| -------------------    |--------------------     | ---------------------------------------------                    | ----------------|
| chartType              | [ChartType](#ChartType) | Mandatory. <br>The type of the chart to draw                     |                 |
| columnsSelection       | [ColumnsSelection](#ColumnsSelection)| The columns selection for the Axes and the split-by of the chart | If not provided, default columns will be selected. <br>See: getDefaultSelection method|
| maxUniqueXValues       | number                  | The maximum number of the unique X-axis values.<br>The chart will show the biggest values, and the rest will be aggregated to a separate data point.| 100 |
| exceedMaxDataPointLabel| string                  | The label of the data point that contains the aggregated value of all the X-axis values that exceed the 'maxUniqueXValues'| 'OTHER' |
| aggregationType        | [AggregationType](#AggregationType)         | Multiple rows with the same values for the X-axis and the split-by will be aggregated using a function of this type.<br>For example, assume we get the following query result data:<br>['2016-08-02T10:00:00Z', 'Chrome 51.0', 15], <br>['2016-08-02T10:00:00Z', 'Internet Explorer 9.0', 4]<br>When drawing a chart with columnsSelection = { xAxis: timestamp, yAxes: count_ }, and aggregationType = AggregationType.Sum we need to aggregate the values of the same timestamp value and return one row with ["2016-08-02T10:00:00Z", 19] | AggregationType.Sum |
| title                  | string                  | The title of the chart                                           |                 |
| legendOptions          | [ILegendOptions](#ILegendOptions) |  The legend configuration options | |
| yMinimumValue          | number | The minimum value to be displayed on the y-axis <br/> If not provided, the minimum value is automatically calculated | |
| yMaximumValue          | number | The maximum value to be displayed on the y-axis <br/> If not provided, the maximum value is automatically calculated | |
| chartTheme             | [ChartTheme](#ChartTheme) | The theme of the chart                                          | ChartTheme.Light |
| getUtcOffset           | Function<br>(dateStr: string): number | Callback that is used to get the desired offset from UTC in hours for date value. Used to handle timezone.<br>The offset will be added to the original date from the query results data.<br>For example:<br>For 'Africa/Harare' timezone provide utcOffset = 2 and the displayed date will be be:<br>'11/25/2019, 2:00 AM' instead of '11/25/2019, 12:00 AM'<br>See time zone [info](https://msdn.microsoft.com/en-us/library/ms912391(v=winembedded.11) <br> Callback inputs:<br>&nbsp;&nbsp;&nbsp;&nbsp;dateStr - The original date string<br>Callback return value:<br>&nbsp;&nbsp;&nbsp;&nbsp;The desired offset from UTC in hours | If not provided, the utcOffset will be 0 |
| dateFormatter          | Function<br>(dateValue: Date, defaultFormat: DateFormat): string| Callback that is used to format the date values both in the axis and the tooltip<br>Callback inputs:<br>&nbsp;&nbsp;&nbsp;&nbsp;dateValue - The original date value. If utcOffset was provided, this value will include the utcOffset<br>&nbsp;&nbsp;&nbsp;&nbsp;[DateFormat](#DateFormat) - The default format of the label<br>Callback return value:<br>&nbsp;&nbsp;&nbsp;&nbsp;The string represents the display value of the dateValue| If not provided - the default formatting will apply |
| numberFormatter        | Function<br>(numberValue: number): string | Callback that is used to format number values both in the axis and the tooltip<br>Callback inputs:<br>&nbsp;&nbsp;&nbsp;&nbsp;numberValue - The original number<br>Callback return value:<br>&nbsp;&nbsp;&nbsp;&nbsp;The string represents the display value of the numberValue |If not provided - the default formatting will apply |
| xAxisTitleFormatter    | Function<br>(xAxisColumn: IColumn): string | Callback that is used to get the xAxis title<br>Callback inputs:<br>&nbsp;&nbsp;&nbsp;&nbsp;[IColumn](#IColumn) - The x-axis column<br>Callback return value:<br>&nbsp;&nbsp;&nbsp;&nbsp;The desired x-axis title | If not provided - the xAxis title will be the xAxis column name |
| yAxisTitleFormatter    | Function<br>(yAxisColumns: IColumn[]): string | Callback that is used to get the yAxis title<br>Callback inputs:<br>&nbsp;&nbsp;&nbsp;&nbsp;[IColumn[]](#IColumn) - The y-axis columns<br>Callback return value:<br>&nbsp;&nbsp;&nbsp;&nbsp;The desired y-axis title | If not provided - the yAxis title will be the first yAxis column name |
| onFinishDataTransformation | Function(dataTransformationInfo: IDataTransformationInfo) : Promise&lt;boolean&gt; | Callback that is called when all the data transformations required to draw the chart are finished<br>Callback inputs:<br>&nbsp;&nbsp;&nbsp;&nbsp;[IDataTransformationInfo](#IDataTransformationInfo) - The information regarding the applied transformations on the original query results<br>Callback return value:<br>&nbsp;&nbsp;&nbsp;&nbsp;The promise that is used to continue/stop drawing the chart<br>&nbsp;&nbsp;&nbsp;&nbsp;When provided, the drawing of the chart will be suspended until this promise will be resolved<br>&nbsp;&nbsp;&nbsp;&nbsp;When resolved with true - the chart will continue the drawing<br>&nbsp;&nbsp;&nbsp;&nbsp;When resolved with false - the chart drawing will be canceled | | 
| onFinishDrawing        | Function(chartInfo: IChartInfo) : void       | Callback that is called when the chart drawing is finished <br>Callback inputs:<br>&nbsp;&nbsp;&nbsp;&nbsp;[IChartInfo](#IChartInfo) -  The information regarding the chart | | |
| onFinishChartAnimation | Function(chartInfo: IChartInfo) : void       | Callback that is called when the chart animation is finished <br>Callback inputs:<br>&nbsp;&nbsp;&nbsp;&nbsp;[IChartInfo](#IChartInfo) -  The information regarding the chart | | |

### IDataTransformationInfo
| Option name:                 | Type:                                | Details:                                                                                           |
| --------------------------   |------------------------------------- | -------------------------------------------------------------------------------------------------- |
| numberOfDataPoints           | number                               | The amount of the data points that will be drawn for the chart                                     |
| isPartialData                | boolean                              | True if the chart presents partial data from the original query results<br>The chart data will be partial when the maximum number of the unique X-axis values exceed the<br> 'maxUniqueXValues' in [IChartOptions](#IChartOptions) |
| isAggregationApplied         | boolean                              | True if aggregation was applied on the original query results in order to draw the chart<br>See 'aggregationType' in [IChartOptions](#IChartOptions) for more details |

### IChartInfo
| Option name:                 | Type:                                                | Details:                                                                                           |
| --------------------------   |----------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| dataTransformationInfo       | [IDataTransformationInfo](#IDataTransformationInfo)  | The information regarding the applied transformations on the original query results                |
| status                       | [DrawChartStatus](#DrawChartStatus)                  | The status of the draw action                                                                      |
| error                        | [ChartError] (#ChartError)                           | [Optional] The error information in case that the draw action failed                               |

### ILegendOptions
| Option name: | Type:      | Details:                                                                                           |
| ------------ |----------- | -------------------------------------------------------------------------------------------------- |
| isEnabled    | boolean    | Set to false if you want to hide the legend. <br/> [Default value: true (show legend)]             |

### ChartType
```typescript
enum ChartType {
    Line,
    Scatter,
    UnstackedArea,
    StackedArea,
    PercentageArea,
    UnstackedColumn,
    StackedColumn,
    PercentageColumn,
    UnstackedBar,
    StackedBar,
    PercentageBar,
    Pie,
    Donut,
}
```

### Columns selection per chart type
| Chart type:                                                                                                                | X-axis:            | Y-axis:          | Split-by:          |
| ------------------------------------------------------------------------------------------------------------------------   | ------------------ | ---------------  | ------------------ |
| Line / Scatter </br> UnstackedArea / StackedArea / PercentageArea </br> UnstackedColumn / StackedColumn / PercentageColumn </br> UnstackedBar / StackedBar / PercentageBar | [Single selection]<br/>DateTime / Int / Long </br> Decimal / Real / String | [If split-by column is selected: y-axis restricted to single selection] <br/> [If split-by column is not selected: y-axis can be single/multi selection] <br/> Int / Long / Decimal / Real | [Single selection] <br/> String |
| Pie /  Donut                                                                                                               | [Single selection]<br/> String | [Single selection]<br/> Int / Long / Decimal / Real | [Single / Multi selection] <br/> String / DateTime / Bool |


### ColumnsSelection
```typescript
interface IColumn {
    name: string;
    type: DraftColumnType;
}

class ColumnsSelection {
    xAxis: IColumn;
    yAxes: IColumn[];
    splitBy?: IColumn[];
}
```

See [Columns selection per chart type](#Columns selection per chart type) 

### AggregationType
```typescript
enum AggregationType {
    Sum,
    Average,
    Min,
    Max
}
```

### ChartTheme
```typescript
enum ChartTheme {
    Dark,
    Light
}
```

### ErrorCode
```typescript
enum ErrorCode {
    InvalidQueryResultData,
    InvalidColumnsSelection,
    UnsupportedTypeInColumnsSelection,
    InvalidChartContainerElementId,
    InvalidDate,
    FailedToCreateVisualization,
    EmptyPie
}
```

### CustomError
```typescript
class ChartError extends Error {
    errorCode: ErrorCode;
}
```
See [ErrorCode](#ErrorCode) 

### DateFormat
```typescript

export enum DateFormat {
    FullDate       // The full date and time. For example: 12/7/2019, 2:30:00.600
    Time           // The full time, without the milliseconds. For example: 2:30:00
    FullTime       // The full time, including the milliseconds. For example: 2:30:00.600
    HourAndMinute  // The hours and minutes. For example: 2:30
    MonthAndDay    // The month and day. For example: July 12th
    MonthAndYear   // The month and day. For example: July 2019
    Year           // The year. For example: 2019
}
```
### DrawChartStatus
```typescript

export enum DrawChartStatus {
    Success = 'Success',   // Successfully drawn the chart
    Failed = 'Failed',     // There was an error while trying to draw the chart
    Canceled = 'Canceled'  // The chart drawing was canceled
}
```
 See 'onFinishDataTransformation' return value in [IChartOptions](#IChartOptions) for more information regarding drawing cancellation

### IColumn
```typescript
type IRowValue = string | number;
type ISeriesRowValue = IRowValue | string[] | number[];
type IRow = IRowValue[];
type ISeriesRow = ISeriesRowValue[];

interface IColumn {
    name: string;
    type: DraftColumnType;
}
```

### IQueryResultData
```typescript
interface IQueryResultData {
    rows: IRow[] | ISeriesRow[];
    columns: IColumn[];
}
```
See [IColumn](#IColumn) 

### ISupportedColumns
```typescript
interface ISupportedColumns {
    xAxis: IColumn[];
    yAxis: IColumn[];
    splitBy: IColumn[];
}
```
See [IColumn](#IColumn) 

### DraftColumnType
See: https://kusto.azurewebsites.net/docs/query/scalar-data-types/index.html
```typescript
enum DraftColumnType {
    Bool,
    DateTime,
    Decimal,
    Dynamic,
    Guid,
    Int,
    Long,
    Real,
    String,
    TimeSpan
}
```
### ISupportedColumnTypes
```typescript
interface ISupportedColumnTypes {
    xAxis: DraftColumnType[];
    yAxis: DraftColumnType[];
    splitBy: DraftColumnType[];
}
```
See [DraftColumnType](#DraftColumnType) 

## Test
Unit tests are written using [Jest](https://jestjs.io/).

```sh
Run tests: npm run test
```

# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.