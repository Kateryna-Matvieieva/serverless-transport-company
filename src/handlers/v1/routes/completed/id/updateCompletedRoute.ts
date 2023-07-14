import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import connect from '@db/connect';
import { Routes } from '@db/models';
import headers from '@headers';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  await connect();

  try {
    const { id } = event.pathParameters || {};
    const { expected_revenue, distance } = JSON.parse(event.body || '');

    const route = await Routes.findOne({ where: { id: id } });

    if (!route) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Route not found.' }),
      };
    }

    if (route.status !== 'completed') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Only completed routes can be edited.' }),
      };
    }

    route.expected_revenue = expected_revenue;
    route.distance = distance;

    await route.save();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ data: route }),
    };
  } catch (error) {
    console.error('Error fetching route:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch route.' }),
    };
  }
};
