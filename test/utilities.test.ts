'use strict';

import { Utilities } from '../src/common/utilities';
import { DraftColumnType } from '../src/common/chartModels';

describe('Unit tests for Utilities', () => {
    //#region Tests

    describe('Validate getColumnIndex method', () => {
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
    });

    //#endregion Tests
});