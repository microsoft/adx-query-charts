'use strict';

import * as moment from 'moment';
import { DraftColumnType, AggregationType } from '../src/common/chartModels';
import { LimitVisResultsSingleton, ILimitAndAggregateParams, LimitedResults } from '../src/transformers/limitVisResults';
import { ChartAggregation } from '../src/transformers/chartAggregation';

moment['suppressDeprecationWarnings'] = true;

describe('Unit tests for LimitVisResults', () => {
     //#region Private members
    
     const exceedMaxDataPointLabel = 'Unique label';
     const maxUniqueXValues = 2;
     let originalRows;
     let emptyLimitedResults;

     //#endregion Private members
    
    //#region Private methods
    
    function triggerLimitAllRows(limitAndAggregateParams: ILimitAndAggregateParams, limitedResults: any): void {
        const aggregationMethod = ChartAggregation.getAggregationMethod(limitAndAggregateParams.aggregationType);
        const internalParams = { ...{ aggregationMethod: aggregationMethod }, ...limitAndAggregateParams }
        
        // Act
        LimitVisResultsSingleton['limitAllRows'](internalParams, limitedResults);
    }
    
    //#endregion Private methods

    //#region Generate mocks and defaults

    beforeEach((done) => {
        originalRows = [
            ['2017-03-27T00:00:00Z', 'Ukraine', 'Kiev', 100, 200],
            ['2017-03-27T00:00:00Z', 'Israel', 'Tel Aviv', 10, 20],
            ['2017-03-27T00:00:00Z', 'Ukraine', 'Dnepropetrovsk', 300, 400],
            ['2017-03-27T00:00:00Z', 'United States', 'Redmond', 5, 6],
            ['2017-03-27T00:00:00Z', 'United States', 'Las Vegas', 5, 6],
            ['2017-03-27T00:00:00Z', 'Ukraine', 'Odesa', 500, 600],
            ['2017-03-27T00:00:00Z', 'Ukraine', 'Donetsk', 700, 800],
            ['2017-03-27T00:00:00Z', 'United States', 'New York', 5, 6],
            ['2017-03-27T00:00:00Z', 'Israel', 'Tel Aviv', 30, 40],
            ['2017-03-27T00:00:00Z', 'Israel', 'Herzliya', 50, 60],
            ['2017-03-27T00:00:00Z', 'United States', 'New York', 1, 2],
        ];

        emptyLimitedResults = new LimitedResults();

        done();
    });

    //#endregion Generate mocks and defaults

    //#region Tests

    describe('Validate limitAllRows method', () => {
        it("When X and Filter values don't exceed maximum, they aren't limited", () => {
            const originalRows = [
                ['Israel', 'Tel Aviv', 10],
                ['United States', 'Redmond', 5],
                ['United States', 'Redmond', 2],
                ['United States', 'Redmond', 3],
                ['Israel', 'Tel Aviv', 30],
                ['Israel', 'Tel Aviv', 50],
                ['United States', 'Redmond', 1],
            ];

            const limitAndAggregateParams: ILimitAndAggregateParams = {
                queryResultData: { rows: originalRows, columns: [] },
                axesIndexes: {
                    xAxis: 0,
                    yAxes: [2],
                    splitBy: [1]
                },
                xColumnType: DraftColumnType.String,
                aggregationType: AggregationType.Sum,
                maxUniqueXValues: maxUniqueXValues,
                otherStr: exceedMaxDataPointLabel
            }

            // Act
            const limitedResults = emptyLimitedResults;

            triggerLimitAllRows(limitAndAggregateParams, limitedResults);

            const expectedLimitesRows = originalRows;

            // Assert
            expect(limitedResults.isPartialData).toEqual(false);
            expect(limitedResults.rows).toEqual(expectedLimitesRows);
        });

        it("When X values are DateTime, the X values aren't limited", () => {
            const limitAndAggregateParams: ILimitAndAggregateParams = {
                queryResultData: { rows: originalRows, columns: [] },
                axesIndexes: {
                    xAxis: 0,
                    yAxes: [3],
                    splitBy: []
                },
                xColumnType: DraftColumnType.DateTime,
                aggregationType: AggregationType.Sum,
                maxUniqueXValues: maxUniqueXValues,
                otherStr: exceedMaxDataPointLabel
            }

            // Act
            const limitedResults = emptyLimitedResults;

            triggerLimitAllRows(limitAndAggregateParams, limitedResults);

            const expectedLimitesRows = originalRows;

            // Assert
            expect(limitedResults.isPartialData).toEqual(false);
            expect(limitedResults.rows).toEqual(expectedLimitesRows);
        });

        it("When X values exceeds maximum size, the X values are limited", () => {
            const limitAndAggregateParams: ILimitAndAggregateParams = {
                queryResultData: { rows: originalRows, columns: [] },
                axesIndexes: {
                    xAxis: 1,
                    yAxes: [3],
                    splitBy: []
                },
                xColumnType: DraftColumnType.String,
                aggregationType: AggregationType.Sum,
                maxUniqueXValues: maxUniqueXValues,
                otherStr: exceedMaxDataPointLabel
            }

            // Act
            const limitedResults = emptyLimitedResults;

            triggerLimitAllRows(limitAndAggregateParams, limitedResults);

            const expectedLimitesRows = [
                ['2017-03-27T00:00:00Z', 'Ukraine', 'Kiev', 100, 200],
                ['2017-03-27T00:00:00Z', 'Israel', 'Tel Aviv', 10, 20],
                ['2017-03-27T00:00:00Z', 'Ukraine', 'Dnepropetrovsk', 300, 400],
                ['2017-03-27T00:00:00Z', 'Ukraine', 'Odesa', 500, 600],
                ['2017-03-27T00:00:00Z', 'Ukraine', 'Donetsk', 700, 800],
                ['2017-03-27T00:00:00Z', 'Israel', 'Tel Aviv', 30, 40],
                ['2017-03-27T00:00:00Z', 'Israel', 'Herzliya', 50, 60],
                [undefined, exceedMaxDataPointLabel, undefined, 16],
            ];

            // Assert
            expect(limitedResults.isPartialData).toEqual(true);
            expect(limitedResults.rows).toEqual(expectedLimitesRows);
        });

        it("When X values are DateTime, and Filter exceeds maximum size, only Filter values are limited", () => {
            const limitAndAggregateParams: ILimitAndAggregateParams = {
                queryResultData: { rows: originalRows, columns: [] },
                axesIndexes: {
                    xAxis: 0,
                    yAxes: [3, 4],
                    splitBy: [2]
                },
                xColumnType: DraftColumnType.DateTime,
                aggregationType: AggregationType.Sum,
                maxUniqueXValues: maxUniqueXValues,
                otherStr: exceedMaxDataPointLabel
            }

            // Act
            const limitedResults = emptyLimitedResults;

            triggerLimitAllRows(limitAndAggregateParams, limitedResults);

            const expectedLimitesRows = [
                ['2017-03-27T00:00:00Z', 'Ukraine', 'Odesa', 500, 600],
                ['2017-03-27T00:00:00Z', 'Ukraine', 'Donetsk', 700, 800],
                ['2017-03-27T00:00:00Z', 'Ukraine', exceedMaxDataPointLabel, 100, 200],
                ['2017-03-27T00:00:00Z', 'Israel', exceedMaxDataPointLabel, 10, 20],
                ['2017-03-27T00:00:00Z', 'Ukraine', exceedMaxDataPointLabel, 300, 400],
                ['2017-03-27T00:00:00Z', 'United States', exceedMaxDataPointLabel, 5, 6],
                ['2017-03-27T00:00:00Z', 'United States', exceedMaxDataPointLabel, 5, 6],
                ['2017-03-27T00:00:00Z', 'United States', exceedMaxDataPointLabel, 5, 6],
                ['2017-03-27T00:00:00Z', 'Israel', exceedMaxDataPointLabel, 30, 40],
                ['2017-03-27T00:00:00Z', 'Israel', exceedMaxDataPointLabel, 50, 60],
                ['2017-03-27T00:00:00Z', 'United States', exceedMaxDataPointLabel, 1, 2],
            ];

            // Assert
            expect(limitedResults.isPartialData).toEqual(false);
            expect(limitedResults.rows).toEqual(expectedLimitesRows);
        });

        it("When both X values and Filter values exceeds maximum size, both of them are limited", () => {
            const limitAndAggregateParams: ILimitAndAggregateParams = {
                queryResultData: { rows: originalRows, columns: [] },
                axesIndexes: {
                    xAxis: 1,
                    yAxes: [3, 4],
                    splitBy: [2]
                },
                xColumnType: DraftColumnType.String,
                aggregationType: AggregationType.Sum,
                maxUniqueXValues: maxUniqueXValues,
                otherStr: exceedMaxDataPointLabel
            }

            // Act
            const limitedResults = emptyLimitedResults;

            triggerLimitAllRows(limitAndAggregateParams, limitedResults);

            const expectedLimitesRows = [
                ['2017-03-27T00:00:00Z', 'Ukraine', 'Odesa', 500, 600],
                ['2017-03-27T00:00:00Z', 'Ukraine', 'Donetsk', 700, 800],
                ['2017-03-27T00:00:00Z', 'Ukraine', exceedMaxDataPointLabel, 100, 200],
                ['2017-03-27T00:00:00Z', 'Israel', exceedMaxDataPointLabel, 10, 20],
                ['2017-03-27T00:00:00Z', 'Ukraine', exceedMaxDataPointLabel, 300, 400],
                ['2017-03-27T00:00:00Z', 'Israel', exceedMaxDataPointLabel, 30, 40],
                ['2017-03-27T00:00:00Z', 'Israel', exceedMaxDataPointLabel, 50, 60],
                [, exceedMaxDataPointLabel, exceedMaxDataPointLabel, 16, 20],
            ];

            // Assert
            expect(limitedResults.isPartialData).toEqual(true);
            expect(limitedResults.rows).toEqual(expectedLimitesRows);
        });

        it("When there are 2 Filter values, and both of them exceeds maximum size, both of them are limited", () => {
            const originalRows = [
                ['X', 'a', 1, 'aa'],
                ['X', 'b', 2, 'bb'],
                ['X', 'c', 3, 'bb'],
                ['X', 'd', 5, 'aa'],
                ['X', 'a', 10, 'cc'],
                ['X', 'a', 1, 'aa'],
                ['X', 'b', 1, 'cc'],
                ['X', 'c', 5, 'ff'],
                ['X', 'c', 30, 'aa'],
                ['X', 'a', 50, 'aa'],
                ['X', 'a', 12, 'ee']
            ];

            const limitAndAggregateParams: ILimitAndAggregateParams = {
                queryResultData: { rows: originalRows, columns: [] },
                axesIndexes: {
                    xAxis: 0,
                    yAxes: [2],
                    splitBy: [1, 3]
                },
                xColumnType: DraftColumnType.String,
                aggregationType: AggregationType.Sum,
                maxUniqueXValues: maxUniqueXValues,
                otherStr: exceedMaxDataPointLabel
            }

            // Act
            const limitedResults = emptyLimitedResults;

            triggerLimitAllRows(limitAndAggregateParams, limitedResults);

            const expectedLimitesRows = [
                ['X', 'a', 1, 'aa'],
                ['X', 'a', 1, 'aa'],
                ['X', 'c', 30, 'aa'],
                ['X', 'a', 50, 'aa'],
                ['X', 'a', 12, 'ee'],
                ['X', exceedMaxDataPointLabel, 5, 'aa'],
                ['X', 'c', 3, exceedMaxDataPointLabel],
                ['X', 'a', 10, exceedMaxDataPointLabel],
                ['X', 'c', 5, exceedMaxDataPointLabel],
                ['X', exceedMaxDataPointLabel, 2, exceedMaxDataPointLabel],
                ['X', exceedMaxDataPointLabel, 1, exceedMaxDataPointLabel],
            ];

            // Assert
            expect(limitedResults.isPartialData).toEqual(false);
            expect(limitedResults.rows).toEqual(expectedLimitesRows);
        });

        it("Average aggregation - When both X values and Filter values exceeds maximum size, both of them are limited", () => {
            originalRows.push(['2017-03-27T00:00:00Z', 'Ukraine', 'Odesa', 300, 1000]);
            originalRows.push(['2017-03-27T00:00:00Z', 'Ukraine', 'Odesa', 100, 30]);

            const limitAndAggregateParams: ILimitAndAggregateParams = {
                queryResultData: { rows: originalRows, columns: [] },
                axesIndexes: {
                    xAxis: 1,
                    yAxes: [3, 4],
                    splitBy: [2]
                },
                xColumnType: DraftColumnType.String,
                aggregationType: AggregationType.Average,
                maxUniqueXValues: maxUniqueXValues,
                otherStr: exceedMaxDataPointLabel
            }

            // Act
            const limitedResults = emptyLimitedResults;

            triggerLimitAllRows(limitAndAggregateParams, limitedResults);

            const expectedLimitesRows = [
                ['2017-03-27T00:00:00Z', 'Ukraine', 'Odesa', 500, 600],
                ['2017-03-27T00:00:00Z', 'Ukraine', 'Donetsk', 700, 800],
                ['2017-03-27T00:00:00Z', 'Ukraine', 'Odesa', 300, 1000],
                ['2017-03-27T00:00:00Z', 'Ukraine', 'Odesa', 100, 30],
                ['2017-03-27T00:00:00Z', 'Ukraine', exceedMaxDataPointLabel, 100, 200],
                ['2017-03-27T00:00:00Z', 'Israel', exceedMaxDataPointLabel, 10, 20],
                ['2017-03-27T00:00:00Z', 'Ukraine', exceedMaxDataPointLabel, 300, 400],
                ['2017-03-27T00:00:00Z', 'Israel', exceedMaxDataPointLabel, 30, 40],
                ['2017-03-27T00:00:00Z', 'Israel', exceedMaxDataPointLabel, 50, 60],
                [, exceedMaxDataPointLabel, exceedMaxDataPointLabel, 4, 5],
            ];

            // Assert
            expect(limitedResults.isPartialData).toEqual(true);
            expect(limitedResults.rows).toEqual(expectedLimitesRows);
        });
    });

    describe('Validate limitAndAggregateRows method', () => {
        const originalRows = [
            ["2019-09-16T00:00:00Z", "United States", "Chicago", "GET Home/DemoIndex", 19195, 19205],
            ["2019-09-16T00:00:00Z", "United States", "San Antonio", "GET Home/DemoIndex", 19364, 19374],
            ["2019-09-16T00:00:00Z", "United States", "Washington", "", 3279, 3289],
            ["2019-09-16T00:00:00Z", "United States", "Washington", "/logsextension/az/1.0.9.1160/blades/LogsBlade.en.html", 6658, 6668],
            ["2019-09-16T00:00:00Z", "United States", "Washington", "//analyticsBlade", 2126, 2136],
            ["2019-09-16T00:00:00Z", "United States", "Ogden", "GET Home/RootIndex", 1, 11],
            ["2019-09-16T00:00:00Z", "United States", "New York", "/logsextension/az/1.0.9.1160/blades/LogsBlade.en.html", 719, 729],
            ["2019-09-16T00:00:00Z", "United States", "New York", "//analyticsBlade", 140, 150],
            ["2019-09-16T00:00:00Z", "United States", "Atlanta", "//analyticsBlade", 877, 887],
            ["2019-09-16T00:00:00Z", "United States", "Atlanta", "/logsextension/az/1.0.9.1160/blades/LogsBlade.en.html", 14, 24],
            ["2019-09-16T00:00:00Z", "United States", "San Jose", "GET Home/RootIndex", 6, 16],
            ["2019-09-16T00:00:00Z", "United States", "Ashburn", "GET Home/RootIndex", 1, 11],
            ["2019-09-16T00:00:00Z", "United States", "", "HEAD Home/RootIndex", 14, 24],
            ["2019-09-16T00:00:00Z", "United States", "", "GET Home/RootIndex", 44, 54],
            ["2019-09-16T00:00:00Z", "United States", "Cazadero", "GET Home/RootIndex", 1, 11],
            ["2019-09-16T00:00:00Z", "United States", "Des Moines", "HEAD Home/RootIndex", 2, 12],
            ["2019-09-16T00:00:00Z", "United States", "Los Angeles", "GET Home/RootIndex", 9, 19],
            ["2019-09-16T00:00:00Z", "United States", "Santa Clara", "GET Home/RootIndex", 1, 11],
            ["2019-09-15T00:00:00Z", "United States", "San Antonio", "GET Home/DemoIndex", 9297, 9307],
            ["2019-09-15T00:00:00Z", "United States", "Chicago", "GET Home/DemoIndex", 9326, 9336],
            ["2019-09-15T00:00:00Z", "United States", "Washington", "/logsextension/az/1.0.9.1160/blades/LogsBlade.en.html", 2957, 2967],
            ["2019-09-15T00:00:00Z", "United States", "Washington", "", 1514, 1524],
            ["2019-09-15T00:00:00Z", "United States", "Washington", "//analyticsBlade", 898, 908],
            ["2019-09-15T00:00:00Z", "United States", "Mountain View", "GET Home/RootIndex", 2, 12],
            ["2019-09-15T00:00:00Z", "United States", "San Jose", "GET Home/RootIndex", 3, 13],
            ["2019-09-15T00:00:00Z", "Israel", "Kfar Saba", "//analyticsBlade", 2, 12],
            ["2019-09-15T00:00:00Z", "Israel", "Kfar Saba", "/logsextension/az/1.0.9.1160/blades/LogsBlade.en.html", 93, 103]
        ];

        it("When the X and the SpliBy have the same values, those values are aggregated", () => {
            const limitAndAggregateParams: ILimitAndAggregateParams = {
                queryResultData: { rows: originalRows, columns: [] },
                axesIndexes: {
                    xAxis: 0,
                    yAxes: [4],
                    splitBy: [1]
                },
                xColumnType: DraftColumnType.DateTime,
                aggregationType: AggregationType.Sum,
                maxUniqueXValues: maxUniqueXValues,
                otherStr: exceedMaxDataPointLabel
            }

            // Act
            const limitedResults = LimitVisResultsSingleton.limitAndAggregateRows(limitAndAggregateParams);

            const expectedLimitesRows = [
                ["2019-09-15T00:00:00Z", "United States", 23997],
                ["2019-09-15T00:00:00Z", "Israel", 95],
                ["2019-09-16T00:00:00Z", "United States", 52451]
            ];

            const expectedOrderedXValues = [
                "2019-09-16T00:00:00Z",
                "2019-09-16T00:00:00Z",
                "2019-09-16T00:00:00Z",
                "2019-09-16T00:00:00Z",
                "2019-09-16T00:00:00Z",
                "2019-09-16T00:00:00Z",
                "2019-09-16T00:00:00Z",
                "2019-09-16T00:00:00Z",
                "2019-09-16T00:00:00Z",
                "2019-09-16T00:00:00Z",
                "2019-09-16T00:00:00Z",
                "2019-09-16T00:00:00Z",
                "2019-09-16T00:00:00Z",
                "2019-09-16T00:00:00Z",
                "2019-09-16T00:00:00Z",
                "2019-09-16T00:00:00Z",
                "2019-09-16T00:00:00Z",
                "2019-09-16T00:00:00Z",
                "2019-09-15T00:00:00Z",
                "2019-09-15T00:00:00Z",
                "2019-09-15T00:00:00Z",
                "2019-09-15T00:00:00Z",
                "2019-09-15T00:00:00Z",
                "2019-09-15T00:00:00Z",
                "2019-09-15T00:00:00Z",
                "2019-09-15T00:00:00Z",
                "2019-09-15T00:00:00Z"
            ];

            // Assert
            expect(limitedResults.isPartialData).toEqual(false);
            expect(limitedResults.isAggregationApplied).toEqual(true);
            expect(limitedResults.rows).toEqual(expectedLimitesRows);
            expect(limitedResults.orderedXValues).toEqual(expectedOrderedXValues);
        });

        it("When the X have the same value, and there is no split-by, the X values are aggregated", () => {
            const limitAndAggregateParams: ILimitAndAggregateParams = {
                queryResultData: { rows: originalRows, columns: [] },
                axesIndexes: {
                    xAxis: 2,
                    yAxes: [4],
                    splitBy: []
                },
                xColumnType: DraftColumnType.String,
                aggregationType: AggregationType.Sum,
                maxUniqueXValues: 100,
                otherStr: exceedMaxDataPointLabel
            }

            // Act
            const limitedResults = LimitVisResultsSingleton.limitAndAggregateRows(limitAndAggregateParams);

            const expectedLimitesRows = [
                ["Chicago", 28521],
                ["San Antonio", 28661],
                ["Washington", 17432],
                ["Ogden", 1],
                ["New York", 859],
                ["Atlanta", 891],
                ["San Jose", 9],
                ["Ashburn", 1],
                ["", 58],
                ["Cazadero", 1],
                ["Des Moines", 2],
                ["Los Angeles", 9],
                ["Santa Clara", 1],
                ["Mountain View", 2],
                ["Kfar Saba", 95]
            ];

            const expectedOrderedXValues = [
                "Chicago",
                "San Antonio",
                "Washington",
                "Washington",
                "Washington",
                "Ogden",
                "New York",
                "New York",
                "Atlanta",
                "Atlanta",
                "San Jose",
                "Ashburn",
                "",
                "",
                "Cazadero",
                "Des Moines",
                "Los Angeles",
                "Santa Clara",
                "San Antonio",
                "Chicago",
                "Washington",
                "Washington",
                "Washington",
                "Mountain View",
                "San Jose",
                "Kfar Saba",
                "Kfar Saba",
            ];

            // Assert
            expect(limitedResults.isPartialData).toEqual(false);
            expect(limitedResults.isAggregationApplied).toEqual(true);
            expect(limitedResults.rows).toEqual(expectedLimitesRows);
            expect(limitedResults.orderedXValues).toEqual(expectedOrderedXValues);
            });

        it("When the X values exceeds maximum size, they are limited", () => {
            const limitAndAggregateParams: ILimitAndAggregateParams = {
                queryResultData: { rows: originalRows, columns: [] },
                axesIndexes: {
                    xAxis: 2,
                    yAxes: [4]
                },
                xColumnType: DraftColumnType.String,
                aggregationType: AggregationType.Sum,
                maxUniqueXValues: 3,
                otherStr: exceedMaxDataPointLabel
            }

            // Act
            const limitedResults = LimitVisResultsSingleton.limitAndAggregateRows(limitAndAggregateParams);

            const expectedLimitesRows = [
                ["Chicago", 28521],
                ["San Antonio", 28661],
                ["Washington", 17432],
                [exceedMaxDataPointLabel, 1929],
            ];

            const expectedOrderedXValues = [
                "Chicago",
                "San Antonio",
                "Washington",
                "Washington",
                "Washington",
                "San Antonio",
                "Chicago",
                "Washington",
                "Washington",
                "Washington",
                exceedMaxDataPointLabel
            ];

            // Assert
            expect(limitedResults.isPartialData).toEqual(true);
            expect(limitedResults.isAggregationApplied).toEqual(true);
            expect(limitedResults.rows).toEqual(expectedLimitesRows);
            expect(limitedResults.orderedXValues).toEqual(expectedOrderedXValues);
        });
    });
    
    //#endregion Tests
});