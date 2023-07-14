import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import connect from '@db/connect';
import { Routes, Transports } from '@db/models';
import headers from '@headers';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  await connect();

  try {
    const route = await Routes.findOne({
      where: { id: event.pathParameters?.id },
      include: [{
        model: Transports,
        attributes: ['id', 'plate_number', 'status', 'model', 'purchase_date', 'mileage', 'transport_type']
      }],
      raw: true
    });

    if (!route) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Route not found.' }),
      };
    }

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
