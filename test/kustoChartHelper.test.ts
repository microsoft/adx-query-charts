'use strict';

import { DraftColumnType, AggregationType, ChartType, IQueryResultData, ISupportedColumns, IColumn, ColumnsSelection } from '../src/common/chartModels';
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

        it("When there are multiple columns for y and no split-by column - there is multi y-axes selection", () => {
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
    });

    //#endregion Tests
});