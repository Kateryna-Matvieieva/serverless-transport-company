import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import connect from '@db/connect';
import { Transports } from '@db/models';
import headers from '@headers';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    await connect();

    const { id } = event.pathParameters || {};
    const transport = await Transports.findByPk(id, {
      include: {
        association: 'Routes',
        attributes: ['id', 'start_city', 'end_city', 'departure_date', 'completion_date', 'distance', 'expected_revenue']
      },
    });

    if (!transport) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: 'Transport not found' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ data: transport }),
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
