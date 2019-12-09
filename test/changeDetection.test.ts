'use strict';

import { DraftColumnType, IQueryResultData, IChartOptions, IColumn, ChartType } from '../src/common/chartModels';
import { ChangeDetection } from '../src/common/changeDetection';
import { Changes, ChartChange } from '../src/common/chartChange';

describe('Unit tests for ChangeDetection', () => {
    //#region Tests

    describe('Validate detectChanges method', () => {
        const columns: IColumn[] = [
            { name: 'country', type: DraftColumnType.String },
            { name: 'city', type: DraftColumnType.String },
            { name: 'request_count', type: DraftColumnType.Int },
            { name: 'timestamp', type: DraftColumnType.DateTime },
            { name: 'name', type: DraftColumnType.String },
            { name: 'age', type: DraftColumnType.Int },
        ];

        it('When only the columns selection order was changed - chart changes is empty', () => {
            const oldQueryResultData: IQueryResultData = { rows: [], columns: columns };
            const oldChartOptions: IChartOptions = {
                chartType: ChartType.Line,
                columnsSelection: {
                    xAxis: columns[0],
                    yAxes: [columns[1], columns[2], columns[3]]
                }         
            };

            const newQueryResultData: IQueryResultData = oldQueryResultData;
            const newChartOptions: IChartOptions = {
                chartType: ChartType.Line,
                columnsSelection: {
                    xAxis: columns[0],
                    yAxes: [columns[2], columns[1], columns[3]]
                }         
            };

            // Act
            const result: Changes = ChangeDetection.detectChanges(oldQueryResultData, oldChartOptions, newQueryResultData, newChartOptions);
            const expected = {
                count: 0,
                changesMap: {}
            };

            // Assert
            expect(result.count).toEqual(expected.count);
            expect(result['changesMap']).toEqual(expected.changesMap);
        });
        
        it('When only the chart type was changed - chart changes is as expected', () => {
            const oldQueryResultData: IQueryResultData = { rows: [], columns: columns };
            const oldChartOptions: IChartOptions = {
                chartType: ChartType.Line,
                columnsSelection: {
                    xAxis: columns[0],
                    yAxes: [columns[1], columns[2]],
                    splitBy: [columns[3]]
                }         
            };

            const newQueryResultData: IQueryResultData = oldQueryResultData;
            const newChartOptions: IChartOptions = {
                chartType: ChartType.StackedArea,
                columnsSelection: {
                    xAxis: columns[0],
                    yAxes: [columns[1], columns[2]],
                    splitBy: [columns[3]]
                }         
            };

            // Act
            const result: Changes = ChangeDetection.detectChanges(oldQueryResultData, oldChartOptions, newQueryResultData, newChartOptions);
            const expected = {
                count: 1,
                changesMap: {
                    [ChartChange.ChartType]: true
                }
            };

            // Assert
            expect(result.count).toEqual(expected.count);
            expect(result['changesMap']).toEqual(expected.changesMap);
        });
                
        it('When there was columns selection change - chart changes is as expected', () => {
            const oldQueryResultData: IQueryResultData = { rows: [], columns: columns };
            const oldChartOptions: IChartOptions = {
                chartType: ChartType.Line,
                columnsSelection: {
                    xAxis: columns[0],
                    yAxes: [columns[1], columns[2]],
                    splitBy: [columns[3]]
                }         
            };

            const newQueryResultData: IQueryResultData = oldQueryResultData;
            const newChartOptions: IChartOptions = {
                chartType: ChartType.Line,
                columnsSelection: {
                    xAxis: columns[0],
                    yAxes: [columns[1], columns[5]],
                    splitBy: [columns[3]]
                }         
            };

            // Act
            const result: Changes = ChangeDetection.detectChanges(oldQueryResultData, oldChartOptions, newQueryResultData, newChartOptions);
            const expected = {
                count: 1,
                changesMap: {
                    [ChartChange.ColumnsSelection]: true
                }
            };

            // Assert
            expect(result.count).toEqual(expected.count);
            expect(result['changesMap']).toEqual(expected.changesMap);
        });
               
        it('When there was both columns selection and chart type change - chart changes is as expected', () => {
            const oldQueryResultData: IQueryResultData = { rows: [], columns: columns };
            const oldChartOptions: IChartOptions = {
                chartType: ChartType.Line,
                columnsSelection: {
                    xAxis: columns[0],
                    yAxes: [columns[1], columns[2]],
                    splitBy: [columns[3]]
                }         
            };

            const newQueryResultData: IQueryResultData = oldQueryResultData;
            const newChartOptions: IChartOptions = {
                chartType: ChartType.Pie,
                columnsSelection: {
                    xAxis: columns[0],
                    yAxes: [columns[1], columns[5]],
                    splitBy: [columns[3]]
                }         
            };

            // Act
            const result: Changes = ChangeDetection.detectChanges(oldQueryResultData, oldChartOptions, newQueryResultData, newChartOptions);
            const expected = {
                count: 2,
                changesMap: {
                    [ChartChange.ColumnsSelection]: true,
                    [ChartChange.ChartType]: true
                }
            };

            // Assert
            expect(result.count).toEqual(expected.count);
            expect(result['changesMap']).toEqual(expected.changesMap);
        });
        
        it('When only the query result data was changed - chart changes is as expected', () => {
            const oldQueryResultData: IQueryResultData = { rows: [], columns: columns };
            const oldChartOptions: IChartOptions = {
                chartType: ChartType.Line,
                columnsSelection: {
                    xAxis: columns[0],
                    yAxes: [columns[1]]
                }         
            };

            const newQueryResultData: IQueryResultData = { rows: [], columns: [ columns[0], columns[1], columns[2] ] };
            const newChartOptions: IChartOptions = {
                chartType: ChartType.Line,
                columnsSelection: {
                    xAxis: columns[0],
                    yAxes: [columns[1]]
                }         
            };

            // Act
            const result: Changes = ChangeDetection.detectChanges(oldQueryResultData, oldChartOptions, newQueryResultData, newChartOptions);
            const expected = {
                count: 1,
                changesMap: {
                    [ChartChange.QueryData]: true
                }
            };

            // Assert
            expect(result.count).toEqual(expected.count);
            expect(result['changesMap']).toEqual(expected.changesMap);
        });
    });
    
    //#endregion Tests
});