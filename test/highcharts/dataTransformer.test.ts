'use strict';

import * as _ from 'lodash';
import { DraftColumnType, IColumn } from '../../src/common/chartModels';
import { DataTransformer, ICategoriesAndSeries } from '../../src/visualizers/highcharts/dataTransformer';

describe('Unit tests for Highcharts CategoriesAndSeries', () => {
    const dateStrToValueOf = {
        '2019-05-26T00:00:00Z': 583286400000,
        '2000-06-26T00:00:00Z': 961977600000
    };

    //#region beforeEach

    beforeEach(() => {
        // Add mock to date.valueOf -> return the full year
        jest
        .spyOn(Date.prototype, 'valueOf')
        .mockImplementation(function() {
            const date = this;
            
            return date.getFullYear();
        });
    })

    //#endregion beforeEach


    //#region Tests

    describe('Validate getCategoriesAndSeries method', () => {
        //#region getStandardCategoriesAndSeries

        it("Validate getStandardCategoriesAndSeries: non-date x-axis and 1 y-axis", () => {
            const rows = [
                ['Israel', 'Herzliya', 30],
                ['United States', 'New York', 100],
                ['Japan', 'Tokyo', 20],
            ];

            const columns: IColumn[] = [
                { name: 'country', type: DraftColumnType.String },
                { name: 'city', type: DraftColumnType.String },
                { name: 'request_count', type: DraftColumnType.Int },
            ];

            // Input
            const options: any = {
                chartOptions: {
                    columnsSelection: {
                        xAxis: columns[0],  // country
                        yAxes: [columns[2]] // request_count
                    },
                    utcOffset: 0
                },
                queryResultData: {
                    rows: rows,
                    columns: columns
                }
            }

            // Act
            const result = DataTransformer.getCategoriesAndSeries(options, /*isDatetimeAxis*/ false);

            const expectedCategoriesAndSeries: ICategoriesAndSeries = {
                series: [{
                    name: 'request_count',
                    data: [30, 100, 20]
                }],
                categories: ['Israel', 'United States', 'Japan']
            };

            // Assert
            expect(result).toEqual(expectedCategoriesAndSeries);
        });

        it("Validate getStandardCategoriesAndSeries: date x-axis and 1 y-axis", () => {
            const rows = [
                ['Israel', '2019-05-25T00:00:00Z', 'Herzliya', 30],
                ['Japan', '2019-05-25T00:00:00Z', 'Tokyo', 20],
                ['United States', '2000-06-26T00:00:00Z', 'New York', 100],
            ];

            const columns: IColumn[] = [
                { name: 'country', type: DraftColumnType.String },
                { name: 'timestamp', type: DraftColumnType.DateTime },
                { name: 'city', type: DraftColumnType.String },
                { name: 'request_count', type: DraftColumnType.Int },
            ];

            // Input
            const options: any = {
                chartOptions: {
                    columnsSelection: {
                        xAxis: columns[1],  // timestamp
                        yAxes: [columns[3]] // request_count
                    },
                    utcOffset: 0
                },
                queryResultData: {
                    rows: rows,
                    columns: columns
                }
            }

            // Act
            const result = DataTransformer.getCategoriesAndSeries(options, /*isDatetimeAxis*/ true);

            const expectedCategoriesAndSeries: ICategoriesAndSeries = {
                series: [{
                    name: 'request_count',
                    data: [[2019,  30], [2019, 20], [2000, 100]]
                }],
                categories: undefined
            };

            // Assert
            expect(result).toEqual(expectedCategoriesAndSeries);
        });

        it("Validate getStandardCategoriesAndSeries: non-date x-axis and multiple y-axis", () => {
            const rows = [
                ['Israel', 'Herzliya', 30, 300],
                ['United States', 'New York', 100, 150],
                ['Japan', 'Tokyo', 20, 200],
            ];

            const columns: IColumn[] = [
                { name: 'country', type: DraftColumnType.String },
                { name: 'city', type: DraftColumnType.String },
                { name: 'request_count', type: DraftColumnType.Int },
                { name: 'second_count', type: DraftColumnType.Int },
            ];

            // Input
            const options: any = {
                chartOptions: {
                    columnsSelection: {
                        xAxis: columns[1], // city
                        yAxes: [columns[2], columns[3]] // request_count and second_count
                    },
                    utcOffset: 0
                },
                queryResultData: {
                    rows: rows,
                    columns: columns
                }
            }

            // Act
            const result = DataTransformer.getCategoriesAndSeries(options, /*isDatetimeAxis*/ false);

            const expectedCategoriesAndSeries: ICategoriesAndSeries = {
                series: [{
                    name: 'request_count',
                    data: [30, 100, 20]
                },
                {
                    name: 'second_count',
                    data: [300, 150, 200]
                }],
                categories: ['Herzliya', 'New York', 'Tokyo']
            };

            // Assert
            expect(result).toEqual(expectedCategoriesAndSeries);
        });
   
        it("Validate getStandardCategoriesAndSeries: date x-axis and multiple y-axis", () => {
            const rows = [
                ['2019-05-25T00:00:00Z', 'Israel', 'Herzliya', 30, 300],
                ['2019-05-25T00:00:00Z', 'Japan', 'Tokyo', 20, 150],
                ['2000-06-26T00:00:00Z', 'United States', 'New York', 100, 200],
            ];

            const columns: IColumn[] = [
                { name: 'timestamp', type: DraftColumnType.DateTime },
                { name: 'country', type: DraftColumnType.String },
                { name: 'city', type: DraftColumnType.String },
                { name: 'request_count', type: DraftColumnType.Int },
                { name: 'second_count', type: DraftColumnType.Long },
            ];

            // Input
            const options: any = {
                chartOptions: {
                    columnsSelection: {
                        xAxis: columns[0], // timestamp
                        yAxes: [columns[3], columns[4]] // request_count and second_count
                    },
                    utcOffset: 0
                },
                queryResultData: {
                    rows: rows,
                    columns: columns
                }
            }

            // Act
            const result = DataTransformer.getCategoriesAndSeries(options, /*isDatetimeAxis*/ true);

            const expectedCategoriesAndSeries: ICategoriesAndSeries = {
                series: [{
                    name: 'request_count',
                    data: [[2019,  30], [2019, 20], [2000, 100]]
                },
                {
                    name: 'second_count',
                    data: [[2019,  300], [2019, 150], [2000, 200]]
                }],
                categories: undefined
            };

            // Assert
            expect(result).toEqual(expectedCategoriesAndSeries);
        });

        //#endregion getStandardCategoriesAndSeries

        //#region getSplitByCategoriesAndSeries

        it("Validate getCategoriesAndSeries: non-date x-axis with splitBy", () => {
            const rows = [
                ['United States', 'Atlanta', 300],
                ['United States', 'Redmond', 20],
                ['Israel', 'Herzliya', 1000],
                ['Israel', 'Tel Aviv', 10],
                ['United States', 'New York', 100],
                ['Japan', 'Tokyo', 20],
                ['Israel', 'Jerusalem', 5],
                ['United States', 'Boston', 200],
            ];

            const columns: IColumn[] = [
                { name: 'country', type: DraftColumnType.String },
                { name: 'city', type: DraftColumnType.String },
                { name: 'request_count', type: DraftColumnType.Int },
            ];

            // Input
            const options: any = {
                chartOptions: {
                    columnsSelection: {
                        xAxis: columns[0],    // country
                        yAxes: [columns[2]],  // request_count
                        splitBy: [columns[1]] // city
                    },
                    utcOffset: 0
                },
                queryResultData: {
                    rows: rows,
                    columns: columns
                }
            }

            // Act
            const result = DataTransformer.getCategoriesAndSeries(options, /*isDatetimeAxis*/ false);

            const expectedCategoriesAndSeries: ICategoriesAndSeries = {
                series: [{
                    name: 'Atlanta',
                    data: [300, null, null]
                },
                {
                    name: 'Redmond',
                    data: [20, null, null]
                },
                {
                    name: 'Herzliya',
                    data: [null, 1000, null]
                },
                {
                    name: 'Tel Aviv',
                    data: [null, 10, null]
                },
                {
                    name: 'New York',
                    data: [100, null, null]
                },
                {
                    name: 'Tokyo',
                    data: [null, null, 20]
                },
                {
                    name: 'Jerusalem',
                    data: [null, 5, null]
                },
                {
                    name: 'Boston',
                    data: [200, null, null]
                }],
                categories: ['United States', 'Israel', 'Japan']
            };

            // Assert
            expect(result).toEqual(expectedCategoriesAndSeries);
        });

        it("Validate getCategoriesAndSeries: date x-axis with splitBy", () => {
            const rows = [
                ['Israel', '1988-06-26T00:00:00Z', 'Jerusalem', 500],
                ['Israel', '2000-06-26T00:00:00Z', 'Herzliya', 1000],
                ['United States', '2000-06-26T00:00:00Z', 'Boston', 200],
                ['Israel', '2000-06-26T00:00:00Z', 'Tel Aviv', 10],
                ['United States', '2000-06-26T00:00:00Z', 'New York', 100],      
                ['Japan', '2019-05-25T00:00:00Z', 'Tokyo', 20],
                ['United States', '2019-05-25T00:00:00Z', 'Atlanta', 300],
                ['United States', '2019-05-25T00:00:00Z', 'Redmond', 20]
            ];

            const columns: IColumn[] = [
                { name: 'country', type: DraftColumnType.String },
                { name: 'timestamp', type: DraftColumnType.DateTime },
                { name: 'city', type: DraftColumnType.String },
                { name: 'request_count', type: DraftColumnType.Int },
            ];

            // Input
            const options: any = {
                chartOptions: {
                    columnsSelection: {
                        xAxis: columns[1],   // timestamp
                        yAxes: [columns[3]], // request_count
                        splitBy: [columns[2]], // city
                    },
                    utcOffset: 0
                },
                queryResultData: {
                    rows: rows,
                    columns: columns
                }
            }

            // Act
            const result = DataTransformer.getCategoriesAndSeries(options, /*isDatetimeAxis*/ true);

            const expectedCategoriesAndSeries: ICategoriesAndSeries = {
                series: [{
                    name: 'Jerusalem',
                    data: [[1988,  500]]
                },
                {
                    name: 'Herzliya',
                    data: [[2000,  1000]]
                },
                {
                    name: 'Boston',
                    data: [[2000,  200]]
                },
                {
                    name: 'Tel Aviv',
                    data: [[2000,  10]]
                },
                {
                    name: 'New York',
                    data: [[2000,  100]]
                },
                {
                    name: 'Tokyo',
                    data: [[2019,  20]]
                },
                {
                    name: 'Atlanta',
                    data: [[2019,  300]]
                },
                {
                    name: 'Redmond',
                    data: [[2019,  20]]
                }],
                categories: undefined
            };

            // Assert
            expect(result).toEqual(expectedCategoriesAndSeries);
        });

        //#endregion getSplitByCategoriesAndSeries
    });
   
    //#endregion Tests
});