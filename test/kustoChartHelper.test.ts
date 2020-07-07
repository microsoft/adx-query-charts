'use strict';

import { DraftColumnType, ChartType, IQueryResultData, ISupportedColumns, IColumn, ColumnsSelection } from '../src/common/chartModels';
import { KustoChartHelper } from '../src/common/kustoChartHelper';
import { VisualizerMock } from './mocks/visualizerMock';

describe('Unit tests for KustoChartHelper', () => {
    //#region Private members

    let kustoChartHelper: KustoChartHelper;
    const dateTimeColumn: IColumn = { name: 'dateTime', type: DraftColumnType.DateTime };
    const countryStrColumn: IColumn = { name: 'country', type: DraftColumnType.String };
    const cityStrColumn: IColumn = { name: 'city', type: DraftColumnType.String };
    const countDecimalColumn: IColumn = { name: 'count', type: DraftColumnType.Decimal };
    const secondCountIntColumn: IColumn = { name: 'secondCount', type: DraftColumnType.Int };
    const thirdCountIntColumn: IColumn = { name: 'thirdCount', type: DraftColumnType.Int };
    const queryResultData: IQueryResultData = {
        rows: [],
        columns: [
            countDecimalColumn,
            dateTimeColumn,
            secondCountIntColumn,
            thirdCountIntColumn,
            cityStrColumn,
            countryStrColumn
        ]
    };

    //#endregion Private members
    
    //#region Generate mocks and defaults

    beforeEach(() => {
        kustoChartHelper = new KustoChartHelper('dummy-element-id', new VisualizerMock());
    });

    //#endregion Generate mocks and defaults

    //#region Tests

    describe('Validate getDefaultSelection method', () => {
        it("When there are supported columns for x, y, and splitBy - they are selected as expected", () => {
            const supportedColumnsForChart: ISupportedColumns = {
                xAxis: [dateTimeColumn, countryStrColumn, secondCountIntColumn],
                yAxis: [secondCountIntColumn],
                splitBy: [countryStrColumn]
            };

            const expectedResult: ColumnsSelection = {
                xAxis: dateTimeColumn,
                yAxes: [secondCountIntColumn],
                splitBy: [countryStrColumn]
            }

            // Act
            const result = kustoChartHelper.getDefaultSelection(queryResultData, ChartType.StackedColumn, supportedColumnsForChart);

            // Assert
            expect(result).toEqual(expectedResult);
        });

        it("When there is intersection between supported columns for x and y - they are selected as expected", () => {
            const supportedColumnsForChart: ISupportedColumns = {
                xAxis: [countDecimalColumn, countryStrColumn, secondCountIntColumn, cityStrColumn],
                yAxis: [countDecimalColumn, secondCountIntColumn],
                splitBy: [countryStrColumn, cityStrColumn]
            };

            const expectedResult: ColumnsSelection = {
                xAxis: countDecimalColumn,
                yAxes: [secondCountIntColumn],
                splitBy: [countryStrColumn]
            }

            // Act
            const result = kustoChartHelper.getDefaultSelection(queryResultData, ChartType.StackedColumn, supportedColumnsForChart);

            // Assert
            expect(result).toEqual(expectedResult);
        });

        it("When there are multiple columns for y and no split-by column - there is multi y-axis selection", () => {
            const supportedColumnsForChart: ISupportedColumns = {
                xAxis: [countDecimalColumn, dateTimeColumn, secondCountIntColumn, thirdCountIntColumn],
                yAxis: [secondCountIntColumn, countDecimalColumn, thirdCountIntColumn],
                splitBy: []
            };

            const expectedResult: ColumnsSelection = {
                xAxis: dateTimeColumn,
                yAxes: [secondCountIntColumn, countDecimalColumn, thirdCountIntColumn],
                splitBy: null
            }

            // Act
            const result = kustoChartHelper.getDefaultSelection(queryResultData, ChartType.StackedColumn, supportedColumnsForChart);

            // Assert
            expect(result).toEqual(expectedResult);
        });
        
        it("When there are multiple columns for y and split-by columns - there is single y-axes selection", () => {
            const supportedColumnsForChart: ISupportedColumns = {
                xAxis: [cityStrColumn, countDecimalColumn, dateTimeColumn, secondCountIntColumn, thirdCountIntColumn],
                yAxis: [secondCountIntColumn, countDecimalColumn, thirdCountIntColumn],
                splitBy: [cityStrColumn]
            };

            const expectedResult: ColumnsSelection = {
                xAxis: dateTimeColumn,
                yAxes: [secondCountIntColumn],
                splitBy: [cityStrColumn]
            }

            // Act
            const result = kustoChartHelper.getDefaultSelection(queryResultData, ChartType.StackedColumn, supportedColumnsForChart);

            // Assert
            expect(result).toEqual(expectedResult);
        });
                
        it("When there is only 1 supported column for y - it's selected", () => {
            const queryResultData: IQueryResultData = {
                rows: [],
                columns: [
                    countDecimalColumn,
                    cityStrColumn
                ]
            }

            const supportedColumnsForChart: ISupportedColumns = {
                xAxis: [countDecimalColumn, cityStrColumn],
                yAxis: [countDecimalColumn],
                splitBy: [cityStrColumn]
            };

            const expectedResult: ColumnsSelection = {
                xAxis: cityStrColumn,
                yAxes: [countDecimalColumn],
                splitBy: null
            }

            // Act
            const result = kustoChartHelper.getDefaultSelection(queryResultData, ChartType.StackedColumn, supportedColumnsForChart);

            // Assert
            expect(result).toEqual(expectedResult);
        });
                        
        it("When there is no enough supported columns for y axis - there is no selection", () => {
            const supportedColumnsForChart: ISupportedColumns = {
                xAxis: [countDecimalColumn],
                yAxis: [],
                splitBy: []
            };

            const expectedResult: ColumnsSelection = new ColumnsSelection(); // Empty selection

            // Act
            const result = kustoChartHelper.getDefaultSelection(queryResultData, ChartType.StackedColumn, supportedColumnsForChart);

            // Assert
            expect(result).toEqual(expectedResult);
        });
                                
        it("When there is no enough supported columns for x axis - there is no selection", () => {
            const supportedColumnsForChart: ISupportedColumns = {
                xAxis: [],
                yAxis: [countDecimalColumn],
                splitBy: []
            };

            const expectedResult: ColumnsSelection = new ColumnsSelection(); // Empty selection

            // Act
            const result = kustoChartHelper.getDefaultSelection(queryResultData, ChartType.StackedColumn, supportedColumnsForChart);

            // Assert
            expect(result).toEqual(expectedResult);
        });
                                        
        it("When the chart type is pie / donut, there is single y selection, and no split-by selection", () => {
            const supportedColumnsForChart: ISupportedColumns = {
                xAxis: [countryStrColumn, cityStrColumn],
                yAxis: [secondCountIntColumn, countDecimalColumn, thirdCountIntColumn],
                splitBy: [countryStrColumn, cityStrColumn]
            };

            const expectedResult: ColumnsSelection = {
                xAxis: countryStrColumn,
                yAxes: [secondCountIntColumn],
                splitBy: null
            }

            // Act
            const result = kustoChartHelper.getDefaultSelection(queryResultData, ChartType.Donut, supportedColumnsForChart);

            // Assert
            expect(result).toEqual(expectedResult);
        });
    });

    describe('Validate transformQueryResultData method', () => {                  
        it("When the columns selection input is valid, the query result transformed as expected", () => {
            // Input
            const queryResultData = {
                rows: [
                    ['Israel', '1988-06-26T00:00:00Z', 'Jerusalem', 500],
                    ['Israel', '2000-06-26T00:00:00Z', 'Herzliya', 1000],
                    ['United States', '2000-06-26T00:00:00Z', 'Boston', 200],
                    ['Israel', '2000-06-26T00:00:00Z', 'Tel Aviv', 10],
                    ['United States', '2000-06-26T00:00:00Z', 'New York', 100],
                    ['Japan', '2019-05-25T00:00:00Z', 'Tokyo', 20],
                    ['United States', '2019-05-25T00:00:00Z', 'Atlanta', 300],
                    ['United States', '2019-05-25T00:00:00Z', 'Redmond', 20]
                ],
                columns: [
                    { name: 'country', type: DraftColumnType.String },
                    { name: 'date', type: DraftColumnType.DateTime },
                    { name: 'city', type: DraftColumnType.String },
                    { name: 'request_count', type: DraftColumnType.Int },       
                ]
            };

            const chartOptions = {
                columnsSelection: {
                    xAxis: queryResultData.columns[1],
                    yAxes: [queryResultData.columns[3]]
                }
            };

            // Act
            const result = kustoChartHelper['transformQueryResultData'](queryResultData, <any>chartOptions);
            const aggregatedRows = [
                ["1988-06-26T00:00:00Z", 500],
                ["2000-06-26T00:00:00Z", 1310],
                ["2019-05-25T00:00:00Z", 340]
            ];

            const expected = {
                data: {
                    rows: aggregatedRows,
                    columns: [queryResultData.columns[1], queryResultData.columns[3]]
                },
                limitedResults: {
                    rows: aggregatedRows,
                    isAggregationApplied: true,
                    isPartialData: false
                }
            };

            // Assert
            expect(result).toEqual(expected);
        });

        it("When the columns selection and query results both numeric, but different types - the input is valid, the query result transformed as expected", () => {
            // Input
            const queryResultData = {
                rows: [
                    ['Israel', '2000-05-24T00:00:00Z', 100, 10],
                    ['United States', '2000-05-25T00:00:00Z', 80, 8],
                    ['Japan', '2019-05-26T00:00:00Z', 20, 2]
                ],
                columns: [
                    { name: 'country', type: DraftColumnType.String },
                    { name: 'date', type: DraftColumnType.DateTime },
                    { name: 'request_count', type: DraftColumnType.Int },
                    { name: 'second_count', type: DraftColumnType.Real },     
                ]
            };

            const chartOptions = {
                columnsSelection: {
                    xAxis: queryResultData.columns[1],
                    yAxes: [{ name: 'request_count', type: DraftColumnType.Decimal }, { name: 'second_count', type: DraftColumnType.Long }]
                }
            };

            // Act
            const result = kustoChartHelper['transformQueryResultData'](queryResultData, <any>chartOptions);
            const aggregatedRows = [
                ['2000-05-24T00:00:00Z', 100, 10],
                ['2000-05-25T00:00:00Z', 80, 8],
                ['2019-05-26T00:00:00Z', 20, 2]
            ];

            const expected = {
                data: {
                    rows: aggregatedRows,
                    columns: [queryResultData.columns[1], queryResultData.columns[2], queryResultData.columns[3]]
                },
                limitedResults: {
                    rows: aggregatedRows,
                    isAggregationApplied: false,
                    isPartialData: false
                }
            };

            // Assert
            expect(result).toEqual(expected);
        });

        it("When the x-axis columns selection input is invalid", () => {
            // Input
            const queryResultData = {
                rows: [],
                columns: [
                    { name: 'date', type: DraftColumnType.DateTime },
                    { name: 'city', type: DraftColumnType.String },
                    { name: 'request_count', type: DraftColumnType.Int },
                ]
            };

            const chartOptions = {
                columnsSelection: {
                    xAxis: { name: 'date', type: 'TimeSpan' },
                    yAxes: [{ name: 'request_count', type: DraftColumnType.Int }],
                }
            };

            // Act
            let errorMessage;

            try {
                kustoChartHelper['transformQueryResultData'](queryResultData, <any>chartOptions);
            } catch(err) {
                errorMessage = err.message;
            }

            const expected: string =
`One or more of the selected x-axis columns don't exist in the query result data: 
name = 'date' type = 'TimeSpan'
columns in query data:
name = 'date' type = 'datetime', name = 'city' type = 'string', name = 'request_count' type = 'int'`;

            // Assert
            expect(errorMessage).toEqual(expected);
        });

        it("When the y-axes columns selection input is invalid", () => {
            // Input
            const queryResultData = {
                rows: [],
                columns: [
                    { name: 'date', type: DraftColumnType.DateTime },
                    { name: 'duration', type: DraftColumnType.Long },
                    { name: 'request_count', type: DraftColumnType.Int },
                ]
            };

            const chartOptions = {
                columnsSelection: {
                    xAxis: { name: 'date', type: DraftColumnType.DateTime },
                    yAxes: [{ name: 'duration', type: 'Date' }, { name: 'count', type: DraftColumnType.Int }]
                }
            };

            // Act
            let errorMessage;

            try {
                kustoChartHelper['transformQueryResultData'](queryResultData, <any>chartOptions);
            } catch(err) {
                errorMessage = err.message;
            }

            const expected: string =
`One or more of the selected y-axes columns don't exist in the query result data: 
name = 'duration' type = 'Date', name = 'count' type = 'int'
columns in query data:
name = 'date' type = 'datetime', name = 'duration' type = 'long', name = 'request_count' type = 'int'`;

            // Assert
            expect(errorMessage).toEqual(expected);
        });
              
        it("When the split-by columns selection input is invalid", () => {
            // Input
            const queryResultData = {
                rows: [],
                columns: [
                    { name: 'date', type: DraftColumnType.DateTime },
                    { name: 'duration', type: DraftColumnType.Long },
                    { name: 'request_count', type: DraftColumnType.Int },
                    { name: 'city', type: DraftColumnType.String },
                    { name: 'country', type: DraftColumnType.String },
                ]
            };

            const chartOptions = {
                columnsSelection: {
                    xAxis: { name: 'date', type: DraftColumnType.DateTime },
                    yAxes: [{ name: 'duration', type: DraftColumnType.Long }, { name: 'request_count', type: DraftColumnType.Int }],
                    splitBy: [{ name: 'country', type: DraftColumnType.String }, { name: 'city', type: DraftColumnType.Int }],
                }
            };

            // Act
            let errorMessage;

            try {
                kustoChartHelper['transformQueryResultData'](queryResultData, <any>chartOptions);
            } catch(err) {
                errorMessage = err.message;
            }

            const expected: string =
`One or more of the selected split-by columns don't exist in the query result data: 
name = 'city' type = 'int'
columns in query data:
name = 'date' type = 'datetime', name = 'duration' type = 'long', name = 'request_count' type = 'int', name = 'city' type = 'string', name = 'country' type = 'string'`;

            // Assert
            expect(errorMessage).toEqual(expected);
        });
    });

    //#endregion Tests
});