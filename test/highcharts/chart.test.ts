'use strict';

import * as _ from 'lodash';
import { DraftColumnType, IColumn, ChartType, ColumnsSelection } from '../../src/common/chartModels';
import { ChartFactory } from '../../src/visualizers/highcharts/charts/chartFactory';
import { ICategoriesAndSeries } from '../../src/visualizers/highcharts/charts/chart';
import { Utilities } from '../../src/common/utilities';

describe('Unit tests for Chart methods', () => {
    let options: any;
    let columnsSelection: ColumnsSelection;

    //#region beforeEach

    beforeEach(() => {
        // Add mock to Utilities.getDateValue -> return the full year
        jest
        .spyOn(Utilities, 'getDateValue')
        .mockImplementation(function(dateStr) {
            return new Date(dateStr).getFullYear();
        });

        columnsSelection = {
            xAxis: undefined,
            yAxes: []
        };

        options = {
            chartOptions: {
                columnsSelection: columnsSelection,
                getUtcOffset: () => { return 0; }
            },
            queryResultData: { }
        };
    })

    //#endregion beforeEach

    //#region Tests

    describe('Validate getCategoriesAndSeries method', () => {
        //#region Line chart getStandardCategoriesAndSeries

        it('Validate getStandardCategoriesAndSeries for Line chart: non-date x-axis and 1 y-axis', () => {
            // Input
            options.queryResultData.rows = [
                ['Israel', 'Herzliya', 30],
                ['United States', 'New York', 100],
                ['Japan', 'Tokyo', 20],
            ];

            const columns: IColumn[] = [
                { name: 'country', type: DraftColumnType.String },
                { name: 'city', type: DraftColumnType.String },
                { name: 'request_count', type: DraftColumnType.Int },
            ];

            columnsSelection.xAxis = columns[0];   // country
            columnsSelection.yAxes = [columns[2]]; // request_count
            options.queryResultData.columns = columns;

            // Act
            const chart = ChartFactory.create(ChartType.Line);
            const result: any = chart.getStandardCategoriesAndSeries(options);

            const expected: ICategoriesAndSeries = {
                series: [{
                    name: 'request_count',
                    data: [30, 100, 20]
                }],
                categories: ['Israel', 'United States', 'Japan']
            };

            // Assert
            expect(result).toEqual(expected);
        });

        it('Validate getStandardCategoriesAndSeries for Line chart: date x-axis and 1 y-axis', () => {
            // Input
            options.queryResultData.rows = [
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

            columnsSelection.xAxis = columns[1];  // timestamp
            columnsSelection.yAxes = [columns[3]] // request_count
            options.queryResultData.columns = columns;

            // Act
            const chart = ChartFactory.create(ChartType.Line);
            const result: any = chart.getStandardCategoriesAndSeries(options);

            const expected: ICategoriesAndSeries = {
                series: [{
                    name: 'request_count',
                    data: [[2019,  30], [2019, 20], [2000, 100]]
                }],
                categories: undefined
            };

            // Assert
            expect(result).toEqual(expected);
        });

        it('Validate getStandardCategoriesAndSeries for Line chart: non-date x-axis and multiple y-axis', () => {
            // Input
            options.queryResultData.rows = [
                ['Israel', 'Herzliya', "30", 300],
                ['United States', 'New York', "100", 150],
                ['Japan', 'Tokyo', "20.58305", 200],
            ];

            const columns: IColumn[] = [
                { name: 'country', type: DraftColumnType.String },
                { name: 'city', type: DraftColumnType.String },
                { name: 'request_count', type: DraftColumnType.Decimal },
                { name: 'second_count', type: DraftColumnType.Int },
            ];

            columnsSelection.xAxis = columns[1];               // city
            columnsSelection.yAxes = [columns[2], columns[3]]; // request_count and second_count
            options.queryResultData.columns = columns;

            // Act
            const chart = ChartFactory.create(ChartType.Line);
            const result: any = chart.getStandardCategoriesAndSeries(options);

            const expected: ICategoriesAndSeries = {
                series: [{
                    name: 'request_count',
                    data: [30, 100, 20.58305]
                },
                {
                    name: 'second_count',
                    data: [300, 150, 200]
                }],
                categories: ['Herzliya', 'New York', 'Tokyo']
            };

            // Assert
            expect(result).toEqual(expected);
        });

        it('Validate getStandardCategoriesAndSeries for Line chart: date x-axis and multiple y-axis', () => {
            // Input
            options.queryResultData.rows = [
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

            columnsSelection.xAxis = columns[0];               // timestamp
            columnsSelection.yAxes = [columns[3], columns[4]]; // request_count and second_count
            options.queryResultData.columns = columns;

            // Act
            const chart = ChartFactory.create(ChartType.Line);
            const result: any = chart.getStandardCategoriesAndSeries(options);

            const expected: ICategoriesAndSeries = {
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
            expect(result).toEqual(expected);
        });

        it('Validate getStandardCategoriesAndSeries for Line chart with decimal y-axis', () => {
            // Input
            options.queryResultData.rows = [
                ['Israel', "252.3640552995391705069124423963134"],
                ['United States', "100"],
                ['Japan', "0.274074"],
                ['China', "-5.274074"],
                ['Ukraine', "976.5"],
            ];

            const columns: IColumn[] = [
                { name: 'country', type: DraftColumnType.String },
                { name: 'count', type: DraftColumnType.Decimal },
            ];

            columnsSelection.xAxis = columns[0];   // country
            columnsSelection.yAxes = [columns[1]]; // count
            options.queryResultData.columns = columns;

            // Act
            const chart = ChartFactory.create(ChartType.Line);
            const result: any = chart.getStandardCategoriesAndSeries(options);

            const expected: ICategoriesAndSeries = {
                series: [{
                    name: 'count',
                    data: [252.3640552995391705069124423963134, 100, 0.274074, -5.274074, 976.5]
                }],
                categories: ['Israel', 'United States', 'Japan', 'China', 'Ukraine']
            };

            // Assert
            expect(result).toEqual(expected);
        });
     
        it('Validate getStandardCategoriesAndSeries for Line chart: date x-axis and decimal y-axis', () => {
            // Input
            options.queryResultData.rows = [
                ['Israel', '2019-05-25T00:00:00Z', 'Herzliya', "252.36"],
                ['Japan', '2019-05-25T00:00:00Z', 'Tokyo', "-5.5"],
                ['United States', '2000-06-26T00:00:00Z', 'New York', "250"],
            ];

            const columns: IColumn[] = [
                { name: 'country', type: DraftColumnType.String },
                { name: 'timestamp', type: DraftColumnType.DateTime },
                { name: 'city', type: DraftColumnType.String },
                { name: 'request_count', type: DraftColumnType.Decimal },
            ];

            // Input
            columnsSelection.xAxis = columns[1];   // timestamp
            columnsSelection.yAxes = [columns[3]]; // request_count
            options.queryResultData.columns = columns;

            // Act
            const chart = ChartFactory.create(ChartType.Line);
            const result: any = chart.getStandardCategoriesAndSeries(options);

            const expected: ICategoriesAndSeries = {
                series: [{
                    name: 'request_count',
                    data: [[2019,  252.36], [2019, -5.5], [2000, 250]]
                }],
                categories: undefined
            };

            // Assert
            expect(result).toEqual(expected);
        });

        //#endregion Line chart getStandardCategoriesAndSeries

        //#region Line chart getSplitByCategoriesAndSeries

        it('Validate getSplitByCategoriesAndSeries for Line chart: non-date x-axis with splitBy', () => {
            // Input
            options.queryResultData.rows = [
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
            columnsSelection.xAxis = columns[0];     // country
            columnsSelection.yAxes = [columns[2]];   // request_count
            columnsSelection.splitBy = [columns[1]]; // city
            options.queryResultData.columns = columns;

            // Act
            const chart = ChartFactory.create(ChartType.Line);
            const result: any = chart.getSplitByCategoriesAndSeries(options);

            const expected: ICategoriesAndSeries = {
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
            expect(result).toEqual(expected);
        });

        it('Validate getSplitByCategoriesAndSeries for Line chart: date x-axis with splitBy', () => {
            // Input
            options.queryResultData.rows = [
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

            columnsSelection.xAxis = columns[1];     // timestamp
            columnsSelection.yAxes = [columns[3]];   // request_count
            columnsSelection.splitBy = [columns[2]]; // city
            options.queryResultData.columns = columns;

            // Act
            const chart = ChartFactory.create(ChartType.Line);
            const result: any = chart.getSplitByCategoriesAndSeries(options);

            const expected: ICategoriesAndSeries = {
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
            expect(result).toEqual(expected);
        });
     
        it('Validate getSplitByCategoriesAndSeries for Line chart: non-date x-axis with splitBy and decimal y-axis', () => {
            // Input
            options.queryResultData.rows = [
                ['United States', 'Atlanta', "300.474"],
                ['United States', 'Redmond', "20.2"]
            ];

            const columns: IColumn[] = [
                { name: 'country', type: DraftColumnType.String },
                { name: 'city', type: DraftColumnType.String },
                { name: 'request_count', type: DraftColumnType.Decimal },
            ];

            columnsSelection.xAxis = columns[0];     // country
            columnsSelection.yAxes = [columns[2]];   // request_count
            columnsSelection.splitBy = [columns[1]]; // city
            options.queryResultData.columns = columns;

            // Act
            const chart = ChartFactory.create(ChartType.Line);
            const result: any = chart.getSplitByCategoriesAndSeries(options);

            const expected: ICategoriesAndSeries = {
                series: [{
                    name: 'Atlanta',
                    data: [300.474]
                },
                {
                    name: 'Redmond',
                    data: [20.2]
                }],
                categories: ['United States']
            };

            // Assert
            expect(result).toEqual(expected);
        });

        //#endregion Line chart getSplitByCategoriesAndSeries
        
        //#region Pie chart getStandardCategoriesAndSeries
                
        it('Validate getStandardCategoriesAndSeries for Pie chart', () => {
            // Input
            options.queryResultData.rows = [
                ['Israel', 'Tel Aviv', 10],
                ['United States', 'Redmond', 5],
                ['United States', 'New York', 2],
                ['United States', 'Miami', 3],
                ['Israel', 'Herzliya', 30],
                ['Israel', 'Jaffa', 50],
                ['United States', 'Boston', 1],
            ];
        
            const columns: IColumn[] = [
                { name: 'country', type: DraftColumnType.String },
                { name: 'city', type: DraftColumnType.String },
                { name: 'request_count', type: DraftColumnType.Int },
            ];
        
            columnsSelection.xAxis = columns[1];   // city
            columnsSelection.yAxes = [columns[2]]; // request_count
            options.queryResultData.columns = columns;

            // Act
            const chart = ChartFactory.create(ChartType.Pie);
            const result: any = chart.getStandardCategoriesAndSeries(options);

            const expected: ICategoriesAndSeries = {
                series: [{
                    name: 'request_count',
                    data: [
                        { name: 'Tel Aviv', y: 10 },
                        { name: 'Redmond', y: 5 },
                        { name: 'New York', y: 2 },
                        { name: 'Miami', y: 3 },
                        { name: 'Herzliya', y: 30 },
                        { name: 'Jaffa', y: 50 },
                        { name: 'Boston', y: 1 }
                    ]
                }],
                categories: undefined
            };
        
            // Assert
            expect(result.series).toEqual(expected.series);
            expect(result.categories).toEqual(expected.categories);
        });
                
        it('Validate getStandardCategoriesAndSeries for Pie chart with decimal y-axis', () => {
            // Input
            options.queryResultData.rows = [
                ['Israel', 'Tel Aviv', "0.003310"],
                ['United States', 'Redmond', "0286"],
                ['United States', 'New York', "3.144"]
            ];
        
            const columns: IColumn[] = [
                { name: 'country', type: DraftColumnType.String },
                { name: 'city', type: DraftColumnType.String },
                { name: 'request_count', type: DraftColumnType.Decimal },
            ];

            columnsSelection.xAxis = columns[1];   // city
            columnsSelection.yAxes = [columns[2]]; // request_count
            options.queryResultData.columns = columns;
        
            // Act
            const chart = ChartFactory.create(ChartType.Pie);
            const result: any = chart.getStandardCategoriesAndSeries(options);

            const expected: ICategoriesAndSeries = {
                series: [{
                    name: 'request_count',
                    data: [
                        { name: 'Tel Aviv', y: 0.003310 },
                        { name: 'Redmond', y: 286 },
                        { name: 'New York', y: 3.144 }
                    ]
                }],
                categories: undefined
            };
        
            // Assert
            expect(result.series).toEqual(expected.series);
            expect(result.categories).toEqual(expected.categories);
        });

        //#endregion Pie chart getStandardCategoriesAndSeries
        
        //#region Pie chart getSplitByCategoriesAndSeries

        function validateResults(result, expected) {
            const seriesToValidate = _.map(result.series, (currentSeries) => {
                return {
                    name: currentSeries.name,
                    data: currentSeries.data,
                    size: currentSeries.size,
                    innerSize: currentSeries.innerSize
                }
            });

            // Assert
            expect(seriesToValidate).toEqual(expected.series);
            expect(result.categories).toEqual(expected.categories);
        }

        it('Validate getSplitByCategoriesAndSeries for Pie chart: pie chart with 2 levels', () => {
            // Input
            options.queryResultData.rows = [
                ['Israel', 'Tel Aviv', 10],
                ['United States', 'Redmond', 5],
                ['United States', 'New York', 2],
                ['United States', 'Miami', 3],
                ['Israel', 'Herzliya', 30],
                ['Israel', 'Jaffa', 50],
                ['United States', 'Boston', 1],
            ];

            const columns: IColumn[] = [
                { name: 'country', type: DraftColumnType.String },
                { name: 'city', type: DraftColumnType.String },
                { name: 'request_count', type: DraftColumnType.Int },
            ];

            columnsSelection.xAxis = columns[0];     // country
            columnsSelection.yAxes = [columns[2]];   // request_count
            columnsSelection.splitBy = [columns[1]]; // city
            options.queryResultData.columns = columns;

            // Act
            const chart = ChartFactory.create(ChartType.Pie);
            const result: any = chart.getSplitByCategoriesAndSeries(options);

            const expected: ICategoriesAndSeries = {
                series: [{
                    name: 'country',
                    size: '50%',
                    data: [
                        { name: 'Israel',  y: 90 },
                        { name: 'United States', y: 11}
                    ]
                }, 
                {
                    name: 'city',
                    size: '60%',
                    innerSize: '50%',
                    data: [
                        { name: 'Tel Aviv', y: 10 },
                        { name: 'Herzliya', y: 30 },
                        { name: 'Jaffa', y: 50 },
                        { name: 'Redmond', y: 5 },
                        { name: 'New York', y: 2 },
                        { name: 'Miami', y: 3 },
                        { name: 'Boston', y: 1 },
    
                   ]
                }],
                categories: undefined
            };

            // Assert
            validateResults(result, expected);
        });

        it('Validate getSplitByCategoriesAndSeries for Donut chart: pie chart with 3 levels', () => {
            // Input
            options.queryResultData.rows = [                
                ['Internet Explorer', 'v8', '0', 10],
                ['Chrome', 'v65', '0', 5],
                ['Firefox', 'v58', '0', 5],
                ['Firefox', 'v58', '1', 2],
                ['Chrome', 'v66', '0', 15],
                ['Internet Explorer', 'v8', '1', 1],
                ['Internet Explorer', 'v11', '0', 1],
                ['Chrome', 'v66', '1', 5],
                ['Chrome', 'v66', '2', 5],
                ['Safari', 'v11', '0', 20],
                ['Firefox', 'v59', '0', 3],
                ['Chrome', 'v65', '1', 20],
                ['Internet Explorer', 'v8', '2', 5],
                ['Internet Explorer', 'v8', '3', 3],
            ];

            const columns: IColumn[] = [
                { name: 'browser', type: DraftColumnType.String },
                { name: 'version', type: DraftColumnType.String },
                { name: 'minor_version', type: DraftColumnType.String },
                { name: 'usage', type: DraftColumnType.Int },
            ];

            columnsSelection.xAxis = columns[0];                 // browser
            columnsSelection.yAxes = [columns[3]];               // usage
            columnsSelection.splitBy = [columns[1], columns[2]]; // version, minor_version
            options.queryResultData.columns = columns;

            // Act
            const chart = ChartFactory.create(ChartType.Donut);
            const result: any = chart.getSplitByCategoriesAndSeries(options);

            const expected: ICategoriesAndSeries = {
                series: [{
                    name: 'browser',
                    size: '33%',
                    data: [
                        { name: 'Internet Explorer',  y: 20 },
                        { name: 'Chrome', y: 50 },
                        { name: 'Firefox', y: 10 },
                        { name: 'Safari', y: 20 }
                    ]
                }, 
                {
                    name: 'version',
                    size: '43%',
                    innerSize: '33%',
                    data: [
                        { name: 'v8', y: 19 },
                        { name: 'v11', y: 1 },
                        { name: 'v65', y: 25 },
                        { name: 'v66', y: 25 },
                        { name: 'v58', y: 7 },
                        { name: 'v59', y: 3 },
                        { name: 'v11', y: 20 }
                   ]
                }, 
                {
                    name: 'minor_version',
                    size: '53%',
                    innerSize: '43%',
                    data: [
                        { name: '0', y: 10 },
                        { name: '1', y: 1 },
                        { name: '2', y: 5 },
                        { name: '3', y: 3 },
                        { name: '0', y: 1 },
                        { name: '0', y: 5 },
                        { name: '1', y: 20 },
                        { name: '0', y: 15 },
                        { name: '1', y: 5 },
                        { name: '2', y: 5 },
                        { name: '0', y: 5 },
                        { name: '1', y: 2 },
                        { name: '0', y: 3 },  
                        { name: '0', y: 20 }
                   ]
                }],
                categories: undefined
            };

            // Assert
            validateResults(result, expected);
        });

        //#endregion Pie chart getSplitByCategoriesAndSeries
    });
   
    describe('Validate sortSeriesByName method', () => {
        //#region Line chart - no split by

        it('Validate line chart sortSeriesByName when there is no split by', () => {
            // Input
            const series = [{
                name: 'request_count',
                data: [30, 100, 20]
            }];

            // Act
            const chart = ChartFactory.create(ChartType.Line);
            const sortedSeries: any = chart.sortSeriesByName(series);
            const expected = series;

            // Assert
            expect(sortedSeries).toEqual(expected);
        });

        it('Validate line chart sortSeriesByName when there is no split by and date x-axis', () => {
            // Input
            const series = [{
                name: 'request_count',
                data: [[2019,  30], [2019, 20], [2000, 100]]
            }];

            // Act
            const chart = ChartFactory.create(ChartType.Line);
            const sortedSeries: any = chart.sortSeriesByName(series);
            const expected = series;

            // Assert
            expect(sortedSeries).toEqual(expected);
        });

        it('Validate line chart sortSeriesByName when there are 3 lines', () => {
            // Input
            const series_1 = {
                name: 'AAA',
                data: [[2019,  300], [2019, 150], [2000, 200]]
            };

            const series_2 = {
                name: 'ABA',
                data: [[2019,  30], [2019, 20], [2000, 100]]
            };

            const series_3 = {
                name: 'BBB',
                data: [[2019,  30], [2019, 20], [2000, 100]]
            };

            const series = [series_2, series_1, series_3];
  
            // Act
            const chart = ChartFactory.create(ChartType.Line);
            const sortedSeries: any = chart.sortSeriesByName(series);
            const expected = [series_1, series_2, series_3];

            // Assert
            expect(sortedSeries).toEqual(expected);
        });

        //#endregion Line chart - no split by

        //#region Line chart - split by

        it('Validate sortSeriesByName for Line chart: non-date x-axis with splitBy', () => {
            // Input
            const series_1 = { name: 'Almaty', data: [20, null, null] };
            const series_2 = { name: 'Atlanta', data: [300, null, null] };
            const series_3 = { name: 'Boston', data: [200, null, null] };
            const series_4 = { name: 'Herzliya', data: [null, 1000, null] };
            const series_5 = { name: 'Jerusalem', data: [null, 5, null] };
            const series_6 = { name: 'New York', data: [100, null, null] };
            const series_7 = { name: 'Tel Aviv', data: [null, 10, null] };
            const series_8 = { name: 'Tokyo', data: [null, null, 20] };
            const series = [series_6, series_7, series_2, series_1, series_8, series_3, series_5, series_4];
           
            // Act
            const chart = ChartFactory.create(ChartType.Line);
            const sortedSeries: any = chart.sortSeriesByName(series);
            const expected = [series_1, series_2, series_3, series_4, series_5, series_6, series_7, series_8];

            // Assert
            expect(sortedSeries).toEqual(expected);
        });

        it('Validate sortSeriesByName for Line chart: date x-axis with splitBy', () => {
            // Input
            const series_1 = { name: 'Almaty', data: [[2019,  20]]};
            const series_2 = { name: 'Atlanta', data: [[2019,  300]] };
            const series_3 = { name: 'Boston', data: [[2000,  200]] };
            const series_4 = { name: 'Herzliya', data: [[2000,  1000]] };
            const series_5 = { name: 'Jerusalem', data: [[1988,  500]] };
            const series_6 = { name: 'New York', data: [[2000,  100]] };
            const series_7 = { name: 'Tel Aviv', data: [[2000,  10]] };
            const series_8 = { name: 'Tokyo', data: [[2019,  20]] };
            const series = [series_8, series_6, series_2, series_1, series_4, series_7, series_3, series_5];
           
            // Act
            const chart = ChartFactory.create(ChartType.Line);
            const sortedSeries: any = chart.sortSeriesByName(series);
            const expected = [series_1, series_2, series_3, series_4, series_5, series_6, series_7, series_8];

            // Assert
            expect(sortedSeries).toEqual(expected);
        });

        //#endregion Line chart - split by
        
        //#region Pie chart
                
        it('Validate pie chart sortSeriesByName when there is no split by', () => {
            // Input
            const series = [{
                name: 'request_count',
                data: [
                    { name: 'Herzliya', y: 30 },
                    { name: 'Boston', y: 1 },
                    { name: 'Tel Aviv', y: 10 },
                    { name: 'Miami', y: 3 },
                    { name: 'Coal Creek', y: 5 },
                    { name: 'New York', y: 2 },
                    { name: 'Jaffa', y: 50 },
                ]
            }];
                         
            // Act
            const chart = ChartFactory.create(ChartType.Pie);
            const sortedSeries: any = chart.sortSeriesByName(series);
            const expected = [{
                name: 'request_count',
                data: [
                    { name: 'Herzliya', y: 30, legendIndex: 3 },
                    { name: 'Boston', y: 1, legendIndex: 1 },
                    { name: 'Tel Aviv', y: 10, legendIndex: 7 },
                    { name: 'Miami', y: 3, legendIndex: 5 },
                    { name: 'Coal Creek', y: 5, legendIndex: 2 },
                    { name: 'New York', y: 2, legendIndex: 6 },
                    { name: 'Jaffa', y: 50, legendIndex: 4 },
                ]
            }];

            // Assert
            expect(sortedSeries).toEqual(expected);
        });

        it('Validate pie chart sortSeriesByName when there are 2 pie levels', () => {
            // Input
           const series = [{
                name: 'country',
                size: '50%',
                data: [
                    { name: 'Israel',  y: 90 },
                    { name: 'United States', y: 11}
                ]
            }, 
            {
                name: 'city',
                size: '60%',
                innerSize: '50%',
                data: [
                    { name: 'Tel Aviv', y: 10 },
                    { name: 'Herzliya', y: 30 },
                    { name: 'Jaffa', y: 50 },
                    { name: 'Beer sheva', y: 5 },
                    { name: 'Iceland', y: 2 },
                    { name: 'Miami', y: 3 },
                    { name: 'Boston', y: 1 },                ]
            }];
                     
            // Act
            const chart = ChartFactory.create(ChartType.Donut);
            const sortedSeries: any = chart.sortSeriesByName(series);
            const expected = [{
                name: 'country',
                size: '50%',
                data: [
                    { name: 'Israel',  y: 90, legendIndex: 5 },
                    { name: 'United States', y: 11, legendIndex: 9 }
                ]
            }, 
            {
                name: 'city',
                size: '60%',
                innerSize: '50%',
                data: [
                    { name: 'Tel Aviv', y: 10, legendIndex: 8 },
                    { name: 'Herzliya', y: 30, legendIndex: 3 },
                    { name: 'Jaffa', y: 50, legendIndex: 6 },
                    { name: 'Beer sheva', y: 5, legendIndex: 1 },
                    { name: 'Iceland', y: 2, legendIndex: 4 },
                    { name: 'Miami', y: 3, legendIndex: 7 },
                    { name: 'Boston', y: 1, legendIndex: 2 },                ]
            }];

            // Assert
            expect(sortedSeries).toEqual(expected);
        });

        it('Validate pie chart sortSeriesByName when there are 3 pie levels', () => {
            // Input
        const series = [{
                name: 'browser',
                size: '33%',
                data: [
                    { name: 'Internet Explorer',  y: 20 },
                    { name: 'Chrome', y: 50 },
                    { name: 'Firefox', y: 10 },
                    { name: 'Safari', y: 20 }
                ]
            }, 
            {
                name: 'version',
                size: '43%',
                innerSize: '33%',
                data: [
                    { name: 'v8', y: 19 },
                    { name: 'v11', y: 1 },
                    { name: 'v65', y: 25 },
                    { name: 'v66', y: 25 },
                    { name: 'v58', y: 7 },
                    { name: 'v59', y: 3 },
                    { name: 'v11', y: 20 }
                ]
            }, 
            {
                name: 'minor_version',
                size: '53%',
                innerSize: '43%',
                data: [
                    { name: '0', y: 10 },
                    { name: '1', y: 1 },
                    { name: '2', y: 5 },
                    { name: '3', y: 3 },
                    { name: '0', y: 1 },
                    { name: '0', y: 5 },
                    { name: '1', y: 20 },
                    { name: '0', y: 15 },
                    { name: '1', y: 5 },
                    { name: '2', y: 5 },
                    { name: '0', y: 5 },
                    { name: '1', y: 2 },
                    { name: '0', y: 3 },  
                    { name: '0', y: 20 }
                ]
            }];
                     
            // Act
            const chart = ChartFactory.create(ChartType.Donut);
            const sortedSeries: any = chart.sortSeriesByName(series);
            const expected = [{
                name: 'browser',
                size: '33%',
                data: [
                    { name: 'Internet Explorer', y: 20, legendIndex: 17 },
                    { name: 'Chrome', y: 50, legendIndex: 15 },
                    { name: 'Firefox', y: 10, legendIndex: 16 },
                    { name: 'Safari', y: 20, legendIndex: 18 }
                ]
            }, 
            {
                name: 'version',
                size: '43%',
                innerSize: '33%',
                data: [
                    { name: 'v8', y: 19, legendIndex: 25 },
                    { name: 'v11', y: 1, legendIndex: 19 },
                    { name: 'v65', y: 25, legendIndex: 23 },
                    { name: 'v66', y: 25, legendIndex: 24 },
                    { name: 'v58', y: 7, legendIndex: 21 },
                    { name: 'v59', y: 3, legendIndex: 22 },
                    { name: 'v11', y: 20, legendIndex: 20 }
                ]
            }, 
            {
                name: 'minor_version',
                size: '53%',
                innerSize: '43%',
                data: [
                    { name: '0', y: 10, legendIndex: 1 },
                    { name: '1', y: 1, legendIndex: 8 },
                    { name: '2', y: 5, legendIndex: 12 },
                    { name: '3', y: 3, legendIndex: 14 },
                    { name: '0', y: 1, legendIndex: 2 },
                    { name: '0', y: 5, legendIndex: 3 },
                    { name: '1', y: 20, legendIndex: 9 },
                    { name: '0', y: 15, legendIndex: 4 },
                    { name: '1', y: 5, legendIndex: 10 },
                    { name: '2', y: 5, legendIndex: 13 },
                    { name: '0', y: 5, legendIndex: 5 },
                    { name: '1', y: 2, legendIndex: 11 },
                    { name: '0', y: 3, legendIndex: 6 },  
                    { name: '0', y: 20, legendIndex: 7 }
                ]
            }];

            // Assert
            expect(sortedSeries).toEqual(expected);
        });

        //#endregion Pie chart
    });

    //#endregion Tests
});