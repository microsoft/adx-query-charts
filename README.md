# This package is a work in process. Please DO NOT USE it yet

# adx-query-charts
[![Build Status](https://travis-ci.org/microsoft/adx-query-charts.svg?branch=master)](https://travis-ci.org/microsoft/adx-query-charts)&nbsp;&nbsp;&nbsp;&nbsp;[![npm version](https://badge.fury.io/js/adx-query-charts.svg)](https://badge.fury.io/js/adx-query-charts)

Draw charts from Azure Data Explorer queries

## Installation 
npm install adx-query-charts

## Dependencies 
Make sure to install the following packages before using the adx-query-charts library:
1. [moment](https://www.npmjs.com/package/moment): `npm i moment`
2. [lodash](https://www.npmjs.com/package/lodash): `npm i lodash`
3. [css-element-queries](https://www.npmjs.com/package/css-element-queries): `npm i css-element-queries`
4. [highcharts](https://www.npmjs.com/package/highcharts): `npm i highcharts` - Please notice that highcharts requires a commercial license purchase.

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
| Method:                  | Description:              | Input:                                                                                                       | Return value:  |
| -------------------    |--------------------     | ---------------------------------------------------------------------------- | ----------------|
| draw                        | Draw the chart         | [IQueryResultData](#IQueryResultData) - The original query result data<br>[IChartOptions](#IChartOptions) - The information required to draw the chart  | void |
| changeTheme         | Change the theme of an existing chart | [ChartTheme](#ChartTheme) - The theme to apply   | void |
| getSupportedColumnTypes | Get the supported column types for the axes and the split-by<br>for a specific chart type | [ChartType](#ChartType) - The type of the chart  | [ISupportedColumnTypes](#ISupportedColumnTypes) |
| getSupportedColumnsInResult | Get the supported columns from the query result data for the axes and the split-by for a specific chart type | [IQueryResultData](#IQueryResultData) - The original query result data<br> [ChartType](#ChartType) - The type of the chart | [ISupportedColumns](#ISupportedColumns) |
| getDefaultSelection | Get the default columns selection from the query result data.<br>Select the default columns for the axes and the split-by for drawing a default chart of a specific chart type. |  [IQueryResultData](#IQueryResultData) - The original query result data<br> [ChartType](#ChartType) - The type of the chart<br>[ISupportedColumns](#ISupportedColumns) - (Optional) The list of the supported column types for the axes and the split-by | [IColumnsSelection](#IColumnsSelection) |

### IChartOptions
| Option name:           | Type:                   | Details:                                                         | Default value:  |
| -------------------    |--------------------     | ---------------------------------------------                    | ----------------|
| chartType              | [ChartType](#ChartType) | Mandatory. <br>The type of the chart to draw                     |                 |
| columnsSelection       | [IColumnsSelection](#IColumnsSelection)| The columns selection for the Axes and the split-by of the chart | If not provided, default columns will be selected. <br>See: getDefaultSelection method|
| maxUniqueXValues       | number                  | The maximum number of the unique X-axis values.<br>The chart will show the biggest values, and the rest will be aggregated to a separate data point.| 100 |
| exceedMaxDataPointLabel| string                  | The label of the data point that contains the aggregated value of all the X-axis values that exceed the 'maxUniqueXValues'.| 'OTHER' |
| aggregationType        | [AggregationType](#AggregationType)         | Multiple rows with the same values for the X-axis and the split-by will be aggregated using a function of this type.<br>For example, assume we get the following query result data:<br>['2016-08-02T10:00:00Z', 'Chrome 51.0', 15], <br>['2016-08-02T10:00:00Z', 'Internet Explorer 9.0', 4]<br>When drawing a chart with columnsSelection = { xAxis: timestamp, yAxes: count_ }, and aggregationType = AggregationType.Sum we need to aggregate the values of the same timestamp value and return one row with ["2016-08-02T10:00:00Z", 19] | AggregationType.Sum |
| title                  | string                  | The title of the chart                                           | |
| utcOffset              | number                  | The desired offset from UTC in hours for date values. Used to handle timezone.<br>The offset will be added to the original date from the query results data.<br>For example:<br>For 'Africa/Harare'timezone provide utcOffset = 2 and the displayed date will be be:<br>'11/25/2019, 2:00 AM' instead of '11/25/2019, 12:00 AM' <br>See time zone [info](https://msdn.microsoft.com/en-us/library/ms912391(v=winembedded.11)| 0 |
| chartTheme             |[ChartTheme](#ChartTheme)| The theme of the chart                                           | ChartTheme.Light |

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
    Pie,
    Donut,
}
```

### IColumnsSelection
```typescript
interface IColumn {
    name: string;
    type: DraftColumnType;
}

interface IColumnsSelection {
    xAxis: IColumn;
    yAxes: IColumn[];
    splitBy?: IColumn[];
}
```

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