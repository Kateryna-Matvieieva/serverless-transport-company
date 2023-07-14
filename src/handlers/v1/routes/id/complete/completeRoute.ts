import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import connect from '@db/connect';
import { Routes, Transports } from '@db/models';
import headers from '@headers';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  await connect();

  try {
    const { id } = event.pathParameters || {};

    const route = await Routes.findOne({ where: { id: id } });

    if (!route) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Route not found.' }),
      };
    }

    if (route.status !== 'ongoing') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Only ongoing routes can be completed.' }),
      };
    }

    const now = new Date();
    console.log('new Date(route.departure_date) > now || new Date(route.completion_date) > now', new Date(route.departure_date) > now || new Date(route.completion_date) > now)
    if (new Date(route.departure_date) > now || new Date(route.completion_date) > now) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'The dates of the route are still in the future. Sorry, you cannot complete future routes.' }),
      };
    }

    const transport = await Transports.findOne({ where: { id: route.transport_id, status: 'busy' } });

    if (!transport) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Assigned transport not found or not busy.' }),
      };
    }

    transport.status = 'free';
    transport.mileage += route.distance;

    route.status = 'completed';

    await transport.save();
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
