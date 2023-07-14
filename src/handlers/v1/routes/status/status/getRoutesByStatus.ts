import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import connect from '@db/connect';
import { Routes, Transports } from '@db/models';
import headers from '@headers';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    await connect();

    const status = event.pathParameters?.status;

    const routes = await Routes.findAll({
      where: { status: status },
      include: [
        {
          model: Transports,
          attributes: ['plate_number']
        },
      ]
    });

    const remappedRoutes = routes.map(route => {
      return {
        ...route.get(),
        // may not have attached transport
        plate_number: route.get().Transport?.get().plate_number,
        Transport: undefined
      };
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ data: remappedRoutes }),
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
