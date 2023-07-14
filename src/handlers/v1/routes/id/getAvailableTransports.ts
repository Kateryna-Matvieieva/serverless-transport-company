import { Op } from 'sequelize';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import connect from '@db/connect';
import { Routes, Transports } from '@db/models';
import headers from '@headers';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  await connect();

  try {
    const routeId = event.pathParameters?.id;

    if (!routeId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid route ID.' }),
      };
    }

    const route = await Routes.findOne({
      where: { id: routeId },
    });

    if (!route) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Route not found.' }),
      };
    }

    const occupiedTransports = await Routes.findAll({
      where: {
        id: {
          [Op.ne]: routeId
        },
        transport_id: {
          [Op.ne]: null
        },
        [Op.or]: [
          {
            departure_date: {
              [Op.lte]: route.departure_date,
              [Op.gte]: route.completion_date
            }
          },
          {
            completion_date: {
              [Op.lte]: route.departure_date,
              [Op.gte]: route.completion_date
            }
          }
        ]
      },
      attributes: ['transport_id']
    });

    const occupiedTransportIds = occupiedTransports.map(transport => transport.transport_id);

    const availableTransports = await Transports.findAll({
      where: {
        id: {
          [Op.notIn]: occupiedTransportIds
        },
        transport_type: route.transport_type
      },
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ data: { route, availableTransports } }),
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
