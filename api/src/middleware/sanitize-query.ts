/**
 * Sanitize query parameters.
 * This ensures that query params are formatted and ready to go for the services.
 */

import type { RequestHandler } from 'express';
import { sanitizeQuery } from '../utils/sanitize-query.js';
import { validateQuery } from '../utils/validate-query.js';

const sanitizeQueryMiddleware: RequestHandler = async (req, _res, next) => {
	req.sanitizedQuery = {};
	if (!req.query) return;

	req.sanitizedQuery = await sanitizeQuery(
		{
			fields: req.query['fields'] || '*',
			...req.query,
		},
		req.schema,
		req.accountability || null,
	);

	Object.freeze(req.sanitizedQuery);

	validateQuery(req.sanitizedQuery);

	return next();
};

export default sanitizeQueryMiddleware;
