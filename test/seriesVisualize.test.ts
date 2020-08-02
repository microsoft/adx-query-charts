'use strict';

import { SeriesVisualize } from '../src/transformers/seriesVisualize';
import { IQueryResultData, DraftColumnType, IColumn } from '../src/common/chartModels';

interface ITestParams {
    queryResultData: IQueryResultData;
    expectedResults: IQueryResultData;
}

describe('Unit tests for series visualization class', () => {
    //#region Test models getters

    // Model that tests basic series
    function getHappyTestParams(): ITestParams {
        const rows = [
	        ['[1,2,3]', 'seg1', '["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z","2016-11-10T08:00:00.0000000Z"]', '[-473527419.17344036,-463977987.2103976,-454428555.24735489]'],
	        ['[4,5,6]', 'seg2', '["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z","2016-11-10T08:00:00.0000000Z"]', '[-502175715.06256857,-492626283.0995258,-483076851.1364831]']
        ];

        const columns: IColumn[] = [
            { type: DraftColumnType.Dynamic, name: 'values1' },
            { type: DraftColumnType.String, name: 'segment' },
            { type: DraftColumnType.Dynamic, name: 'timestamp' },
            { type: DraftColumnType.Dynamic, name: 'values2' }
        ];

        const expectedRows = [
	        [1, 'seg1', '2016-11-10T06:00:00.0000000Z', -473527419.17344036],
            [2, 'seg1', '2016-11-10T07:00:00.0000000Z', -463977987.2103976],
	        [3, 'seg1', '2016-11-10T08:00:00.0000000Z', -454428555.24735489],
	        [4, 'seg2', '2016-11-10T06:00:00.0000000Z', -502175715.06256857],
            [5, 'seg2', '2016-11-10T07:00:00.0000000Z', -492626283.0995258],
	        [6, 'seg2', '2016-11-10T08:00:00.0000000Z', -483076851.1364831]
        ];

        const expectedColumns: IColumn[] = [
            { name: 'values1', type: DraftColumnType.Real },
            { name: 'segment', type: DraftColumnType.String },
            { name: 'timestamp', type: DraftColumnType.DateTime },
            { name: 'values2', type: DraftColumnType.Real }
        ];

        return {
            queryResultData: { rows: rows, columns: columns },
            expectedResults: { rows: expectedRows, columns: expectedColumns }
        };
    }

    // Model that tests valid series where all number values are zero
    function getZeroNumbersHappyTestParams(): ITestParams {
        const rows = [
	        [
                'AIAnalyticsPortal-INT', 
                '[0,0,0,0,0,0,0,0,0,0]', 
                '[0,0,0,0,0,0,0,0,0,0]',
                '["2020-08-01T06:25:10.1488180Z","2020-08-01T06:55:10.1488180Z","2020-08-01T07:25:10.1488180Z","2020-08-01T07:55:10.1488180Z","2020-08-01T08:25:10.1488180Z","2020-08-01T08:55:10.1488180Z","2020-08-01T09:25:10.1488180Z","2020-08-01T09:55:10.1488180Z","2020-08-01T10:25:10.1488180Z","2020-08-01T10:55:10.1488180Z"]'
            ],
        ];

        const columns: IColumn[] = [
            { type: DraftColumnType.String, name: 'appName' },
            { type: DraftColumnType.Dynamic, name: 'sum_value' },
            { type: DraftColumnType.Dynamic, name: 'default' },
            { type: DraftColumnType.Dynamic, name: 'timestamp' }
        ];

        const expectedRows = [
	        ['AIAnalyticsPortal-INT', 0, 0, '2020-08-01T06:25:10.1488180Z'],
            ['AIAnalyticsPortal-INT', 0, 0, '2020-08-01T06:55:10.1488180Z'],
	        ['AIAnalyticsPortal-INT', 0, 0, '2020-08-01T07:25:10.1488180Z'],
	        ['AIAnalyticsPortal-INT', 0, 0, '2020-08-01T07:55:10.1488180Z'],
            ['AIAnalyticsPortal-INT', 0, 0, '2020-08-01T08:25:10.1488180Z'],
            ['AIAnalyticsPortal-INT', 0, 0, '2020-08-01T08:55:10.1488180Z'],
            ['AIAnalyticsPortal-INT', 0, 0, '2020-08-01T09:25:10.1488180Z'],
	        ['AIAnalyticsPortal-INT', 0, 0, '2020-08-01T09:55:10.1488180Z'],
            ['AIAnalyticsPortal-INT', 0, 0, '2020-08-01T10:25:10.1488180Z'],
	        ['AIAnalyticsPortal-INT', 0, 0, '2020-08-01T10:55:10.1488180Z']
        ];

        const expectedColumns: IColumn[] = [
            { name: 'appName', type: DraftColumnType.String },
            { name: 'sum_value', type: DraftColumnType.Real },
            { name: 'default', type: DraftColumnType.Real },
            { name: 'timestamp', type: DraftColumnType.DateTime }
        ];

        return {
            queryResultData: { rows: rows, columns: columns },
            expectedResults: { rows: expectedRows, columns: expectedColumns }
        };
    }

    // Model that tests valid series where all number values are 1
    function getOneNumbersHappyTestParams(): ITestParams {
        const rows = [
	        [
                'AIAnalyticsPortal-INT', 
                '[1,1,1,1,1,1,1,1,1,1]', 
                '[1,1,1,1,1,1,1,1,1,1]',
                '["2020-08-01T06:25:10.1488180Z","2020-08-01T06:55:10.1488180Z","2020-08-01T07:25:10.1488180Z","2020-08-01T07:55:10.1488180Z","2020-08-01T08:25:10.1488180Z","2020-08-01T08:55:10.1488180Z","2020-08-01T09:25:10.1488180Z","2020-08-01T09:55:10.1488180Z","2020-08-01T10:25:10.1488180Z","2020-08-01T10:55:10.1488180Z"]'
            ],
        ];

        const columns: IColumn[] = [
            { type: DraftColumnType.String, name: 'appName' },
            { type: DraftColumnType.Dynamic, name: 'sum_value' },
            { type: DraftColumnType.Dynamic, name: 'default' },
            { type: DraftColumnType.Dynamic, name: 'timestamp' }
        ];

        const expectedRows = [
	        ['AIAnalyticsPortal-INT', 1, 1, '2020-08-01T06:25:10.1488180Z'],
            ['AIAnalyticsPortal-INT', 1, 1, '2020-08-01T06:55:10.1488180Z'],
	        ['AIAnalyticsPortal-INT', 1, 1, '2020-08-01T07:25:10.1488180Z'],
	        ['AIAnalyticsPortal-INT', 1, 1, '2020-08-01T07:55:10.1488180Z'],
            ['AIAnalyticsPortal-INT', 1, 1, '2020-08-01T08:25:10.1488180Z'],
            ['AIAnalyticsPortal-INT', 1, 1, '2020-08-01T08:55:10.1488180Z'],
            ['AIAnalyticsPortal-INT', 1, 1, '2020-08-01T09:25:10.1488180Z'],
	        ['AIAnalyticsPortal-INT', 1, 1, '2020-08-01T09:55:10.1488180Z'],
            ['AIAnalyticsPortal-INT', 1, 1, '2020-08-01T10:25:10.1488180Z'],
	        ['AIAnalyticsPortal-INT', 1, 1, '2020-08-01T10:55:10.1488180Z']
        ];

        const expectedColumns: IColumn[] = [
            { name: 'appName', type: DraftColumnType.String },
            { name: 'sum_value', type: DraftColumnType.Real },
            { name: 'default', type: DraftColumnType.Real },
            { name: 'timestamp', type: DraftColumnType.DateTime }
        ];

        return {
            queryResultData: { rows: rows, columns: columns },
            expectedResults: { rows: expectedRows, columns: expectedColumns }
        };
    }

    // Model that tests valid multi series values
    function getMultiSeriesHappyTestParams(): ITestParams {
        const rows = [
	        [
                '["2020-07-26T06:00:00.0000000Z","2020-07-26T12:00:00.0000000Z","2020-07-26T18:00:00.0000000Z","2020-07-27T00:00:00.0000000Z","2020-07-27T06:00:00.0000000Z","2020-07-27T12:00:00.0000000Z","2020-07-27T18:00:00.0000000Z","2020-07-28T00:00:00.0000000Z","2020-07-28T06:00:00.0000000Z","2020-07-28T12:00:00.0000000Z"]',
                0.06703198044804248, 
                -184.4472906403939,
                36795992.04433497,
                34329483.82505278,
                39427.192118226594,
                '[39242.7448275862,39058.29753694581,38873.85024630541,38689.40295566502,38504.95566502462,38320.50837438423,38136.061083743836,37951.61379310345,37767.16650246305,37582.71921182265]',
                '[21658.2,29227.4,36827.4,38066.6,38065.200000000004,37986.600000000006,38011.2,38031.8,37963.2,37962.8]'
            ],
        ];

        const columns: IColumn[] = [
            { type: DraftColumnType.Dynamic, name: "Timestamp" },
            { type: DraftColumnType.Real, name: "series_fit_line_items_rsquare" },
            { type: DraftColumnType.Real, name: "series_fit_line_items_slope" },
            { type: DraftColumnType.Real, name: "series_fit_line_items_variance" },
            { type: DraftColumnType.Real, name: "series_fit_line_items_rvariance" },
            { type: DraftColumnType.Real, name: "series_fit_line_items_interception" },
            { type: DraftColumnType.Dynamic, name: "Trend" },
            { type: DraftColumnType.Dynamic, name: "SmoothedCount"},
        ];

        const expectedRows = [
	        ['2020-07-26T06:00:00.0000000Z', 0.06703198044804248, -184.4472906403939, 36795992.04433497, 34329483.82505278, 39427.192118226594, 39242.7448275862, 21658.2],
            ['2020-07-26T12:00:00.0000000Z', 0.06703198044804248, -184.4472906403939, 36795992.04433497, 34329483.82505278, 39427.192118226594, 39058.29753694581, 29227.4],
	        ['2020-07-26T18:00:00.0000000Z', 0.06703198044804248, -184.4472906403939, 36795992.04433497, 34329483.82505278, 39427.192118226594, 38873.85024630541, 36827.4],
	        ['2020-07-27T00:00:00.0000000Z', 0.06703198044804248, -184.4472906403939, 36795992.04433497, 34329483.82505278, 39427.192118226594, 38689.40295566502, 38066.6],
            ['2020-07-27T06:00:00.0000000Z', 0.06703198044804248, -184.4472906403939, 36795992.04433497, 34329483.82505278, 39427.192118226594, 38504.95566502462, 38065.200000000004],
            ['2020-07-27T12:00:00.0000000Z', 0.06703198044804248, -184.4472906403939, 36795992.04433497, 34329483.82505278, 39427.192118226594, 38320.50837438423, 37986.600000000006],
            ['2020-07-27T18:00:00.0000000Z', 0.06703198044804248, -184.4472906403939, 36795992.04433497, 34329483.82505278, 39427.192118226594, 38136.061083743836, 38011.2],
	        ['2020-07-28T00:00:00.0000000Z', 0.06703198044804248, -184.4472906403939, 36795992.04433497, 34329483.82505278, 39427.192118226594, 37951.61379310345, 38031.8],
            ['2020-07-28T06:00:00.0000000Z', 0.06703198044804248, -184.4472906403939, 36795992.04433497, 34329483.82505278, 39427.192118226594, 37767.16650246305, 37963.2],
	        ['2020-07-28T12:00:00.0000000Z', 0.06703198044804248, -184.4472906403939, 36795992.04433497, 34329483.82505278, 39427.192118226594, 37582.71921182265, 37962.8]
        ];

        const expectedColumns: IColumn[] = [
            { type: DraftColumnType.DateTime, name: "Timestamp" },
            { type: DraftColumnType.Real, name: "series_fit_line_items_rsquare" },
            { type: DraftColumnType.Real, name: "series_fit_line_items_slope" },
            { type: DraftColumnType.Real, name: "series_fit_line_items_variance" },
            { type: DraftColumnType.Real, name: "series_fit_line_items_rvariance" },
            { type: DraftColumnType.Real, name: "series_fit_line_items_interception" },
            { type: DraftColumnType.Real, name: "Trend" },
            { type: DraftColumnType.Real, name: "SmoothedCount"},
        ];

        return {
            queryResultData: { rows: rows, columns: columns },
            expectedResults: { rows: expectedRows, columns: expectedColumns }
        };
    }

    // Model that tests non-series results - the info should not be changed.
    function getNonSeriesResultsTestParams(): ITestParams {
        const rows = [
            [2, 'seg1', '2016-11-10T06:00:00.0000000Z', '[-473527419.17344036,-463977987.2103976,-454428555.24735489'],
            [5, 'seg2', '2016-11-10T06:00:00.0000000Z', '[-502175715.06256857,-492626283.0995258,-483076851.1364831]']
        ];

        const columns: IColumn[] = [
            { name: 'values1', type: DraftColumnType.Real },
            { name: 'segment', type: DraftColumnType.String },
            { name: 'timestamp', type: DraftColumnType.DateTime },
            { name: 'values2', type: DraftColumnType.Dynamic }
        ];

        return {
            queryResultData: { rows: rows, columns: columns },
            expectedResults: null
        };
    }

    // Model that test the addition of a segment column when such isn't exist.
    function getMissingSegmentTestParams(): ITestParams {
        const rows = [
            ['[1,2,3]', '["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z","2016-11-10T08:00:00.0000000Z"]', '[-473527419.17344036,-463977987.2103976,-454428555.24735489]']
        ];

        const columns: IColumn[] = [
            { name: 'values1', type: DraftColumnType.Dynamic },
            { name: 'timestamp', type: DraftColumnType.Dynamic },
            { name: 'values2', type: DraftColumnType.Dynamic }
        ];

        const expectedRows = [
	        [1, '2016-11-10T06:00:00.0000000Z', -473527419.17344036],
            [2, '2016-11-10T07:00:00.0000000Z', -463977987.2103976],
	        [3, '2016-11-10T08:00:00.0000000Z', -454428555.24735489]
        ];

        const expectedColumns: IColumn[] = [
            { name: 'values1', type: DraftColumnType.Real },
            { name: 'timestamp', type: DraftColumnType.DateTime },
            { name: 'values2', type: DraftColumnType.Real },
        ];

        return {
            queryResultData: { rows: rows, columns: columns },
            expectedResults: { rows: expectedRows, columns: expectedColumns }
        };
    }

    // Model that test that a segment column is not added even if one doesn't exist because the result only has one row.
    function getMissingSegmentButOneRowOnlyTestParams(): ITestParams {
        const rows = [
            ['[1,2,3]', '["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z","2016-11-10T08:00:00.0000000Z"]', '[-473527419.17344036,-463977987.2103976,-454428555.24735489]'],
            ['[4,5,6]', '["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z","2016-11-10T08:00:00.0000000Z"]', '[-502175715.06256857,-492626283.0995258,-483076851.1364831]']
        ];

        const columns: IColumn[] = [
            { name: 'values1', type: DraftColumnType.Dynamic },
            { name: 'timestamp', type: DraftColumnType.Dynamic },
            { name: 'values2', type: DraftColumnType.Dynamic }
        ];

        const expectedRows = [
	        [1, '2016-11-10T06:00:00.0000000Z', -473527419.17344036, 'timeSeries_1'],
            [2, '2016-11-10T07:00:00.0000000Z', -463977987.2103976, 'timeSeries_1'],
	        [3, '2016-11-10T08:00:00.0000000Z', -454428555.24735489, 'timeSeries_1'],
	        [4, '2016-11-10T06:00:00.0000000Z', -502175715.06256857, 'timeSeries_2'],
            [5, '2016-11-10T07:00:00.0000000Z', -492626283.0995258, 'timeSeries_2'],
	        [6, '2016-11-10T08:00:00.0000000Z', -483076851.1364831, 'timeSeries_2']
        ];

        const expectedColumns: IColumn[] = [
            { name: 'values1', type: DraftColumnType.Real },
            { name: 'timestamp', type: DraftColumnType.DateTime },
            { name: 'values2', type: DraftColumnType.Real },
            { name: 'time_series', type: DraftColumnType.String }
        ];

        return {
            queryResultData: { rows: rows, columns: columns },
            expectedResults: { rows: expectedRows, columns: expectedColumns }
        };
    }

    /*
    * Model that test plugin V2 scenario - series
    */
    function getPluginV2WithSeriesTestParams(): ITestParams {
        const rows = [
	        ['[1,2,3]', 'seg1', '["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z","2016-11-10T08:00:00.0000000Z"]', '[-473527419.17344036,-463977987.2103976,-454428555.24735489]'],
	        ['[4,5,6]', 'seg2', '["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z","2016-11-10T08:00:00.0000000Z"]', '[-502175715.06256857,-492626283.0995258,-483076851.1364831]']
        ];

        const columns: IColumn[] = [
            { name: 'values1', type: DraftColumnType.Dynamic },
            { name: 'segment', type: DraftColumnType.String },
            { name: 'timestamp', type: DraftColumnType.Dynamic },
            { name: 'values2', type: DraftColumnType.Dynamic }
        ];

        const expectedRows = [
	        [1, 'seg1', '2016-11-10T06:00:00.0000000Z', -473527419.17344036],
            [2, 'seg1', '2016-11-10T07:00:00.0000000Z', -463977987.2103976],
	        [3, 'seg1', '2016-11-10T08:00:00.0000000Z', -454428555.24735489],
	        [4, 'seg2', '2016-11-10T06:00:00.0000000Z', -502175715.06256857],
            [5, 'seg2', '2016-11-10T07:00:00.0000000Z', -492626283.0995258],
	        [6, 'seg2', '2016-11-10T08:00:00.0000000Z', -483076851.1364831]
        ];

        const expectedColumns: IColumn[] = [
            {  name: 'values1', type: DraftColumnType.Real },
            {  name: 'segment', type: DraftColumnType.String },
            {  name: 'timestamp', type: DraftColumnType.DateTime },
            {  name: 'values2', type: DraftColumnType.Real }
        ];

        return {
            queryResultData: { rows: rows, columns: columns },
            expectedResults: { rows: expectedRows, columns: expectedColumns }
        };
    }

    /*
    * Model that test plugin V2 scenario - not series
    */
    function getPluginV2WithoutSeriesTestParams(): ITestParams {
        const rows = [
            [2, 'seg1', '2016-11-10T06:00:00.0000000Z', '[-473527419.17344036,-463977987.2103976,-454428555.24735489'],
            [5, 'seg2', '2016-11-10T06:00:00.0000000Z', '[-502175715.06256857,-492626283.0995258,-483076851.1364831]']
        ];

        const columns: IColumn[] = [
            { name: 'values1', type: DraftColumnType.Real },
            { name: 'segment', type: DraftColumnType.String },
            { name: 'timestamp', type: DraftColumnType.DateTime },
            { name: 'values2', type: DraftColumnType.Dynamic }
        ];

        return {
            queryResultData: { rows: rows, columns: columns },
            expectedResults: null
        };
    }

    // Model that test scenario when no values array found - the info should not be changed.
    function getNoValuesTestParams(): ITestParams {
        const rows = [
	        ['seg1', '["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z","2016-11-10T08:00:00.0000000Z"]'],
	        ['seg2', '["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z","2016-11-10T08:00:00.0000000Z"]']
        ];

        const columns: IColumn[] = [
            { name: 'segment', type: DraftColumnType.String },
            { name: 'timestamp', type: DraftColumnType.Dynamic },
        ];

        return {
            queryResultData: { rows: rows, columns: columns },
            expectedResults: null
        };
    }

    // Model that test scenario when no timestamp array found - the info should not be changed.
    function getNoTimestampTestParams(): ITestParams {
        const rows = [
            ['[1,2,3]', 'seg1', '[-473527419.17344036,-463977987.2103976,-454428555.24735489]'],
            ['[4,5,6]', 'seg2', '[-502175715.06256857,-492626283.0995258,-483076851.1364831]']
        ];

        const columns: IColumn[] = [
            { name: 'values1', type: DraftColumnType.Dynamic },
            { name: 'segment', type: DraftColumnType.String },
            { name: 'values2', type: DraftColumnType.Dynamic }
        ];

        return {
            queryResultData: { rows: rows, columns: columns },
            expectedResults: null
        };
    }

    // Model that tests that columns with array length that different from the timestamp array length - will be treated as string - copy the values for all rows.
    function getArrayWithNotSymmetricValuesTestParams(): ITestParams {
        const rows = [
            ['[1,2,3]', 'seg1', '["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z","2016-11-10T08:00:00.0000000Z"]', '[-473527419.17344036,-463977987.2103976,-454428555.24735489]'],
            ['[4,6]', 'seg2', '["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z","2016-11-10T08:00:00.0000000Z"]', '[-502175715.06256857,-492626283.0995258,-483076851.1364831]']
        ];

        const columns: IColumn[] = [
            { name: 'values1', type: DraftColumnType.Dynamic },
            { name: 'segment', type: DraftColumnType.String },
            { name: 'timestamp', type: DraftColumnType.Dynamic },
            { name: 'values2', type: DraftColumnType.Dynamic }
        ];

        const expectedRows = [
            ['[1,2,3]', 'seg1', '2016-11-10T06:00:00.0000000Z', -473527419.17344036],
            ['[1,2,3]', 'seg1', '2016-11-10T07:00:00.0000000Z', -463977987.2103976],
            ['[1,2,3]', 'seg1', '2016-11-10T08:00:00.0000000Z', -454428555.24735489],
            ['[4,6]', 'seg2', '2016-11-10T06:00:00.0000000Z', -502175715.06256857],
            ['[4,6]', 'seg2', '2016-11-10T07:00:00.0000000Z', -492626283.0995258],
            ['[4,6]', 'seg2', '2016-11-10T08:00:00.0000000Z', -483076851.1364831]
        ];

        const expectedColumns: IColumn[] = [
            { name: 'values1', type: DraftColumnType.Dynamic },
            { name: 'segment', type: DraftColumnType.String },
            { name: 'timestamp', type: DraftColumnType.DateTime },
            { name: 'values2', type: DraftColumnType.Real }
        ];

        return {
            queryResultData: { rows: rows, columns: columns },
            expectedResults: { rows: expectedRows, columns: expectedColumns }
        };
    }

    // Model that tests columns with array that contains item with different types - will be treated as string - copy the values for all rows.
    function getArrayWithDifferentTypesTestParams(): ITestParams {
        const rows = [
            ['[1,"2",3]', 'seg1', '["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z","2016-11-10T08:00:00.0000000Z"]', '[-473527419.17344036,-463977987.2103976,-454428555.24735489]'],
            ['[4,5,6]', 'seg2', '["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z","2016-11-10T08:00:00.0000000Z"]', '[-502175715.06256857,-492626283.0995258,-483076851.1364831]']
        ];

        const columns: IColumn[] = [
            { name: 'values1', type: DraftColumnType.Dynamic },
            { name: 'segment', type: DraftColumnType.String },
            { name: 'timestamp', type: DraftColumnType.Dynamic },
            { name: 'values2', type: DraftColumnType.Dynamic }
        ];

        const expectedRows = [
            ['[1,"2",3]', 'seg1', '2016-11-10T06:00:00.0000000Z', -473527419.17344036],
            ['[1,"2",3]', 'seg1', '2016-11-10T07:00:00.0000000Z', -463977987.2103976],
            ['[1,"2",3]', 'seg1', '2016-11-10T08:00:00.0000000Z', -454428555.24735489],
            ['[4,5,6]', 'seg2', '2016-11-10T06:00:00.0000000Z', -502175715.06256857],
            ['[4,5,6]', 'seg2', '2016-11-10T07:00:00.0000000Z', -492626283.0995258],
            ['[4,5,6]', 'seg2', '2016-11-10T08:00:00.0000000Z', -483076851.1364831]
        ];

        const expectedColumns: IColumn[] = [
            { name: 'values1', type: DraftColumnType.Dynamic },
            { name: 'segment', type: DraftColumnType.String },
            { name: 'timestamp', type: DraftColumnType.DateTime },
            { name: 'values2', type: DraftColumnType.Real }
        ];

        return {
            queryResultData: { rows: rows, columns: columns },
            expectedResults: { rows: expectedRows, columns: expectedColumns }
        };
    }

    // Model that tests scenario that has two timestamp arrays
    function getTwoTimestampArraysTestParams(): ITestParams {
        const rows = [
            ['[1,2,3]', 'seg1', '["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z","2016-11-10T08:00:00.0000000Z"]', '[-473527419.17344036,-463977987.2103976,-454428555.24735489]', '["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z","2016-11-10T08:00:00.0000000Z"]'],
            ['[4,5,6]', 'seg2', '["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z","2016-11-10T08:00:00.0000000Z"]', '[-502175715.06256857,-492626283.0995258,-483076851.1364831]', '["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z","2016-11-10T08:00:00.0000000Z"]']
        ];

        const columns: IColumn[] = [
            { name: 'values1', type: DraftColumnType.Dynamic },
            { name: 'segment', type: DraftColumnType.String },
            { name: 'timestamp', type: DraftColumnType.Dynamic },
            { name: 'values2', type: DraftColumnType.Dynamic },
            { name: 'timestamp2', type: DraftColumnType.Dynamic }
        ];

        const expectedRows = [
	        [1, 'seg1', '2016-11-10T06:00:00.0000000Z', -473527419.17344036, '2016-11-10T06:00:00.0000000Z'],
            [2, 'seg1', '2016-11-10T07:00:00.0000000Z', -463977987.2103976, '2016-11-10T07:00:00.0000000Z'],
	        [3, 'seg1', '2016-11-10T08:00:00.0000000Z', -454428555.24735489, '2016-11-10T08:00:00.0000000Z'],
	        [4, 'seg2', '2016-11-10T06:00:00.0000000Z', -502175715.06256857, '2016-11-10T06:00:00.0000000Z'],
            [5, 'seg2', '2016-11-10T07:00:00.0000000Z', -492626283.0995258, '2016-11-10T07:00:00.0000000Z'],
	        [6, 'seg2', '2016-11-10T08:00:00.0000000Z', -483076851.1364831, '2016-11-10T08:00:00.0000000Z']
        ];

        const expectedColumns: IColumn[] = [
            { name: 'values1', type: DraftColumnType.Real },
            { name: 'segment', type: DraftColumnType.String },
            { name: 'timestamp', type: DraftColumnType.DateTime },
            { name: 'values2', type: DraftColumnType.Real },
            { name: 'timestamp2', type: DraftColumnType.DateTime }
        ];

        return {
            queryResultData: { rows: rows, columns: columns },
            expectedResults: { rows: expectedRows, columns: expectedColumns }
        };
    }

    //#endregion Test models getters

    //#region Private helper tests

    function areColumnsEqual(actualColumns: IColumn[], expectedColumns: IColumn[]): boolean {
        if (actualColumns.length !== expectedColumns.length) {
            return false;
        }

        for (let i = 0; i < actualColumns.length; i++) {
            const actualColumn = actualColumns[i];
            const expectedColumn = expectedColumns[i];

            if (actualColumn.name !== expectedColumn.name || actualColumn.type !== expectedColumn.type) {
                return false;
            }
        }

        return true;
    }

    //#endregion Private helper tests

    //#region Tests suite

    function testTryResolveResultsAsSeries(getTestParamsFn: () => ITestParams, testName: string): void {
        it('Testing tryResolveAsSeries ' + testName, () => {
            // Init
            const testParams: ITestParams = getTestParamsFn();
            const queryResultData = testParams.queryResultData;
            const expectedResults = testParams.expectedResults;

            // Act
            const seriesVisualize = SeriesVisualize.getInstance();
            const updatedResults = seriesVisualize.tryResolveResultsAsSeries(queryResultData);

            // Assert
            if (updatedResults) {
                expect(updatedResults.rows).toEqual(expectedResults.rows);
                expect(areColumnsEqual(updatedResults.columns, expectedResults.columns)).toEqual(true);
            } else {
                expect(expectedResults).toEqual(null);
            }
        });
    }

    describe('Testing tryResolveResultsAsSeries', () => {
        testTryResolveResultsAsSeries(getHappyTestParams, 'Happy flow');
        testTryResolveResultsAsSeries(getZeroNumbersHappyTestParams, 'Happy flow - zero numbers');
        testTryResolveResultsAsSeries(getOneNumbersHappyTestParams, 'Happy flow - 1 numbers');
        testTryResolveResultsAsSeries(getMultiSeriesHappyTestParams, 'Happy flow - multi series');
        testTryResolveResultsAsSeries(getNonSeriesResultsTestParams, 'NonSeriesResults');
        testTryResolveResultsAsSeries(getMissingSegmentTestParams, 'MissingSegment');
        testTryResolveResultsAsSeries(getMissingSegmentButOneRowOnlyTestParams, 'MissingSegmentButOneRowOnly');
        testTryResolveResultsAsSeries(getPluginV2WithSeriesTestParams, 'V2PluginHappyFlow');
        testTryResolveResultsAsSeries(getPluginV2WithoutSeriesTestParams, 'V2PluginNoSeries');
        testTryResolveResultsAsSeries(getNoValuesTestParams, 'MissingValues');
        testTryResolveResultsAsSeries(getNoTimestampTestParams, 'MissingTimestamp');
        testTryResolveResultsAsSeries(getArrayWithNotSymmetricValuesTestParams, 'NotSymmetric');
        testTryResolveResultsAsSeries(getArrayWithDifferentTypesTestParams, 'WithDifferentTypes');
        testTryResolveResultsAsSeries(getTwoTimestampArraysTestParams, 'TwoTimestamps');
    });

    //#endregion Tests suite
});