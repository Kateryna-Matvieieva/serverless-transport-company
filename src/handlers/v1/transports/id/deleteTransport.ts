import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import connect from '@db/connect';
import { Routes, Transports } from '@db/models';
import headers from '@headers';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    await connect();

    const { id } = event.pathParameters || {};
    const transport = await Transports.findByPk(id, {
      include: [{
        model: Routes,
        as: 'routes',
      }],
    });

    if (!transport) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: 'Transport not found' }),
      };
    }

    if (transport.Routes && transport.Routes.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Transport is assigned to one or more routes. Deletion not allowed.' }),
      };
    }

    await transport.destroy();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Transport deleted successfully' }),
    };
  } catch (error) {
    console.error('Error fetching transport:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch transport.' }),
    };
  }
};
