import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import connect from '@db/connect';
import { Routes, Transports } from '@db/models';
import headers from '@headers';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    await connect();

    const { id } = event.pathParameters || {};
    const route = await Routes.findByPk(id);

    if (!route) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: 'Route not found' }),
      };
    }

    if (route.status === 'ongoing') {
      const transport = await Transports.findByPk(route.transport_id);
      if (transport) {
        transport.status = 'free';
        await transport.save();
      }
    }

    await route.destroy();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Route deleted successfully' }),
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
