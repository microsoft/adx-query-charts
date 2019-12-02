'use strict';

import { Utilities } from '../src/common/utilities';
import { DraftColumnType } from '../src/common/chartModels';

describe('Unit tests for Utilities', () => {
    //#region Tests

    describe('Validate getValidDate method', () => {    
        //#region getColumnIndex

        const columns = [
            { name: 'country', type: DraftColumnType.String },
            { name: 'country', type: DraftColumnType.Long },
            { name: 'percentage', type: DraftColumnType.Decimal },
            { name: 'request_count', type: DraftColumnType.Int },
        ];

        it("Validate getColumnIndex: column doesn't exist - incompatible types", () => {
            const queryResultData = {
                rows: [],
                columns: columns
            }

            const columnToFind = { name: 'country', type: DraftColumnType.Guid };

            // Act
            const result = Utilities.getColumnIndex(queryResultData, columnToFind);

            // Assert
            expect(result).toEqual(-1);
        });

        it("Validate getColumnIndex: column doesn't exist - incompatible names", () => {
            const queryResultData = {
                rows: [],
                columns: columns
            }

            const columnToFind = { name: 'country_', type: DraftColumnType.String };

            // Act
            const result = Utilities.getColumnIndex(queryResultData, columnToFind);

            // Assert
            expect(result).toEqual(-1);
        });

        it("Validate getColumnIndex: column doesn't exist - incompatible type and name", () => {
            const queryResultData = {
                rows: [],
                columns: columns
            }

            const columnToFind = { name: 'country_', type: DraftColumnType.Guid };

            // Act
            const result = Utilities.getColumnIndex(queryResultData, columnToFind);

            // Assert
            expect(result).toEqual(-1);
        });

        it("Validate getColumnIndex: column exists when there are two columns with the same name", () => {
            const queryResultData = {
                rows: [],
                columns: columns
            }

            const columnToFind = { name: 'country', type: DraftColumnType.Long };

            // Act
            const result = Utilities.getColumnIndex(queryResultData, columnToFind);

            // Assert
            expect(result).toEqual(1);
        });

        it("Validate getColumnIndex: column exists", () => {
            const queryResultData = {
                rows: [],
                columns: columns
            }

            const columnToFind = { name: 'request_count', type: DraftColumnType.Int };

            // Act
            const result = Utilities.getColumnIndex(queryResultData, columnToFind);

            // Assert
            expect(result).toEqual(3);
        });

        //#endregion getColumnIndex

        //#region getValidDate

        function validateDateResult(actual: Date, expected: Date) {
            expect(actual.getFullYear()).toEqual(expected.getFullYear());
            expect(actual.getMonth()).toEqual(expected.getMonth());
            expect(actual.getDay()).toEqual(expected.getDay());
            expect(actual.getHours()).toEqual(expected.getHours());
            expect(actual.getMinutes()).toEqual(expected.getMinutes());
            expect(actual.getMilliseconds()).toEqual(expected.getMilliseconds());
        }

        it('Validate getValidDate: no offset', () => {
            const dateStr: string = '2019-11-25T14:00:00Z';
            const utcOffset: number = 0;

            // Act
            const result = Utilities.getValidDate(dateStr, utcOffset);
            const expectedResult = new Date(2019, 10, 25, 14, 0, 0, 0);

            // Assert
            validateDateResult(result, expectedResult);
        });

        it('Validate getValidDate: positive offset', () => {
            const dateStr: string = '2019-11-25T14:00:00Z';
            const utcOffset: number = 5;

            // Act
            const result = Utilities.getValidDate(dateStr, utcOffset);
            const expectedResult = new Date(2019, 10, 25, 19, 0, 0, 0);

            // Assert
            validateDateResult(result, expectedResult);
        });

        it('Validate getValidDate: negative offset', () => {
            const dateStr: string = '2019-11-25T14:00:00Z';
            const utcOffset: number = -7;

            // Act
            const result = Utilities.getValidDate(dateStr, utcOffset);
            const expectedResult = new Date(2019, 10, 25, 7, 0, 0, 0);

            // Assert
            validateDateResult(result, expectedResult);
        });

        it('Validate getValidDate: date with milliseconds, no offset', () => {
            const dateStr: string = '2019-12-01T14:13:19.231Z';
            const utcOffset: number = 0;

            // Act
            const result = Utilities.getValidDate(dateStr, utcOffset);
            const expectedResult = new Date(2019, 11, 1, 14, 13, 19, 231);

            // Assert
            validateDateResult(result, expectedResult);
        });

        it('Validate getValidDate: date with milliseconds, positive offset - next date', () => {
            const dateStr: string = '2019-12-01T23:13:19.300Z';
            const utcOffset: number = 8;

            // Act
            const result = Utilities.getValidDate(dateStr, utcOffset);
            const expectedResult = new Date(2019, 11, 2, 7, 13, 19, 300);

            // Assert
            validateDateResult(result, expectedResult);
        });
    });
   
    //#endregion Tests
});