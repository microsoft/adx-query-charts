# This package is a work in process. Please DO NOT USE it yet

# query-data-to-chart-private
[![Build Status](https://travis-ci.org/microsoft/adx-query-charts.svg?branch=master)](https://travis-ci.org/microsoft/adx-query-charts)&nbsp;&nbsp;&nbsp;&nbsp;[![npm version](https://badge.fury.io/js/adx-query-charts.svg)](https://badge.fury.io/js/adx-query-charts)

Draw charts from Azure Data Explorer queries

## Installation 
npm install adx-query-charts

## Usage
```typescript
import * as Charts from 'adx-query-charts';

const chartHelper = new Charts.KustoChartHelper();
const chartOptions: Charts.IChartOptions = {
    chartType: Charts.ChartType.Column,
    columnsSelection: {
        xAxis: { name: 'timestamp', type: Charts.DraftColumnType.DateTime },
        yAxes: [{ name: 'requestCount', type: Charts.DraftColumnType.Int }]
    }
};
const transformed: Charts.ITransformedQueryResultData = chartHelper.transformQueryResultData(queryResult.data, chartOptions);
```

## Test
Unit tests are written using [Jest](https://jestjs.io/).

```sh
Run tests: npm run test
```