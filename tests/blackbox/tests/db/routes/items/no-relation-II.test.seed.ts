import { CreateCollection, CreateField, CreateItem, CreatePermission, DeleteCollection } from '@common/functions';
import vendors from '@common/get-dbs-to-test';
import { randomUUID, type UUID } from 'node:crypto';
import { expect, it } from 'vitest';

export const collection = 'test_filter';

export type Articles = {
	id?: number | string;
	user_created: UUID;
	date_created: string;
};

export const seedDBStructure = () => {
	it.each(vendors)(
		'%s',
		async (vendor) => {
			try {
				await DeleteCollection(vendor, { collection });

				await CreateCollection(vendor, {
					collection: collection,
					primaryKeyType: 'integer',
				});

				await CreateField(vendor, {
					collection: collection,
					field: 'user_created',
					type: 'uuid',
				});

				await CreateField(vendor, {
					collection: collection,
					field: 'date_created',
					type: 'timestamp',
				});

				await CreatePermission(vendor, {
					role: 'APP_ACCESS',
					permission: {
						action: 'read',
						fields: ['user_created', 'date_created'],
						collection: collection,
						permissions: {
							_and: [
								{
									user_created: {
										id: {
											_eq: '$CURRENT_USER',
										},
									},
								},
							],
						},
						policy: 'custom',
						validation: null,
						presets: null,
					},
				});

				await CreatePermission(vendor, {
					role: 'APP_ACCESS',
					permission: {
						action: 'create',
						fields: ['id', 'user_created', 'date_created'],
						collection: collection,
						permissions: null,
						policy: 'custom',
						validation: null,
						presets: null,
					},
				});

				expect(true).toBeTruthy();
			} catch (error) {
				expect(error).toBeFalsy();
			}
		},
		300000,
	);
};

export const seedDBValues = async () => {
	let isSeeded = true;

	const promises = vendors.map(async (vendor) => {
		await CreateItem(vendor, {
			collection,
			item: {
				id: '1',
				user_created: randomUUID(),
				date_created: new Date().toISOString(),
			},
		});

		await CreateItem(vendor, {
			collection,
			item: {
				id: '2',
				user_created: randomUUID(),
				date_created: new Date().toISOString(),
			},
		});
	});

	await Promise.all(promises)
		.then(() => {
			isSeeded = true;
		})
		.catch(() => {
			isSeeded = false;
		});

	return isSeeded;
};
