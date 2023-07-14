import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Op } from 'sequelize';
import connect from '@db/connect';
import { Routes, Transports } from '@db/models';
import headers from '@headers';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  await connect();

  try {
    const routeId = event.pathParameters?.id;
    const transportId = event.pathParameters?.transportId;

    if (!routeId || !transportId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid route ID or transport ID.' }),
      };
    }

    const route = await Routes.findOne({
      where: { id: routeId },
      include: [
        {
          model: Transports,
          attributes: ['plate_number']
        },
      ]
    });

    if (!route) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Route not found.' }),
      };
    }

    // Check if the transport is available for the route
    const occupiedTransports = await Routes.findAll({
      where: {
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

    if (occupiedTransportIds.includes(Number(transportId))) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Selected transport is not available for these dates.' }),
      };
    }

    const transport = await Transports.findOne({
      where: { id: transportId },
    });

    if (!transport) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Transport not found.' }),
      };
    }

    if (route.status === 'ongoing') {
      transport.status = 'busy';
      await transport.save();
    }

    route.transport_id = Number(transportId);
    await route.save();

    const routeData = route.get({ plain: true });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ data: { ...routeData, plate_number: transport.plate_number } }),
    };

  } catch (error) {
    console.error('Error assigning transport to route:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to assign transport to route.' }),
    };
  }
};
