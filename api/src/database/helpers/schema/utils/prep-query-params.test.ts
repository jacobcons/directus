import { test, expect, describe } from 'vitest';
import { prepQueryParams } from './prep-query-params.js';

const format = (index: number) => `$${index + 1}`;

test('Returns an escaped question mark, so it stays escaped', () => {
	expect(prepQueryParams(`SELECT * FROM table WHERE column = "\\?"`, { format }).sql).toEqual(
		'SELECT * FROM table WHERE column = "\\?"',
	);

	expect(prepQueryParams(`SELECT * FROM table WHERE column = "\\\\\\?"`, { format }).sql).toEqual(
		'SELECT * FROM table WHERE column = "\\\\\\?"',
	);
});

describe('Replaces question marks with $1, $2, etc.', () => {
	test('without duplicated values', () => {
		const bindings = prepQueryParams(
			{ sql: `SELECT * FROM table WHERE column = ? LIMIT ?`, bindings: [1, 100] },
			{ format },
		);

		expect(bindings.sql).toEqual('SELECT * FROM table WHERE column = $1 LIMIT $2');
		expect(bindings.bindings).toEqual([1, 100]);
	});

	test('with removing duplicates of the same type', () => {
		const bindings = prepQueryParams(
			{
				sql: `SELECT * FROM table WHERE column = ? AND other = ? LIMIT ?`,
				bindings: [10, 'foo', 10],
			},
			{ format },
		);

		expect(bindings.sql).toEqual('SELECT * FROM table WHERE column = $1 AND other = $2 LIMIT $1');
		expect(bindings.bindings).toEqual([10, 'foo']);
	});

	test('with removing multiple duplicates', () => {
		const bindings = prepQueryParams(
			{
				sql: `SELECT * FROM table WHERE column in [?, ?, ?] and other in [?, ?] LIMIT ?`,
				bindings: [1, 1, 1, 100, 5, 100],
			},
			{ format },
		);

		expect(bindings.sql).toEqual('SELECT * FROM table WHERE column in [$1, $1, $1] and other in [$2, $3] LIMIT $2');
		expect(bindings.bindings).toEqual([1, 100, 5]);
	});

	test('without removing duplicates for columns of different types', () => {
		const bindings = prepQueryParams(
			{
				sql: `SELECT * FROM table WHERE other = ? AND yet_another = ?`,
				bindings: ['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174000'],
			},
			{ format },
			false,
		);

		expect(bindings.sql).toEqual('SELECT * FROM table WHERE other = $1 AND yet_another = $2');
		expect(bindings.bindings).toEqual(['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174000']);
	});
});
