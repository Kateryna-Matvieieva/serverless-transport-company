import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import connect from '@db/connect';
import { Op } from 'sequelize';
import { Routes, Transports } from '@db/models';
import headers from '@headers';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  await connect();

  try {
    const { id } = event.pathParameters || {};
    const updatedRoute = JSON.parse(event.body || '');

    const route = await Routes.findOne({ where: { id: id } });

    if (!route) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Route not found.' }),
      };
    }

    if (route.status === 'completed') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Completed routes cannot be edited in this handler.' }),
      };
    }

    if (route.status !== 'pending' && route.transport_type !== updatedRoute.transport_type) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Type can only be changed for pending routes.' }),
      };
    }

    if (route.status === 'pending' && route.transport_id && route.transport_type !== updatedRoute.transport_type) {
      updatedRoute.transport_id = null;
    }

    if (updatedRoute.status === 'ongoing' && route.status === 'pending' && !route.transport_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Status can be changed from pending to ongoing only if there is a transport id.' }),
      };
    }

    if (updatedRoute.status === 'ongoing' && route.status === 'pending' && route.transport_id) {
      const transport = await Transports.findOne({ where: { id: route.transport_id } });

      if (transport) {
        transport.status = 'busy';
        await transport.save();
      }
    }

    if (updatedRoute.departure_date && updatedRoute.departure_date !== route.departure_date ||
      updatedRoute.completion_date && updatedRoute.completion_date !== route.completion_date) {

      // Check if the transport is available for the route
      const occupiedTransports = await Routes.findAll({
        where: {
          transport_id: {
            [Op.ne]: null
          },
          [Op.or]: [
            {
              departure_date: {
                [Op.lte]: updatedRoute.departure_date || route.departure_date,
                [Op.gte]: updatedRoute.completion_date || route.completion_date
              }
            },
            {
              completion_date: {
                [Op.lte]: updatedRoute.departure_date || route.departure_date,
                [Op.gte]: updatedRoute.completion_date || route.completion_date
              }
            }
          ]
        },
        attributes: ['transport_id']
      });

      const occupiedTransportIds = occupiedTransports.map(transport => transport.transport_id);

      if (occupiedTransportIds.includes(Number(updatedRoute.transport_id || route.transport_id))) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Selected transport is not available for these dates.' }),
        };
      }
    }

    route.start_city = updatedRoute.start_city || route.start_city;
    route.end_city = updatedRoute.end_city || route.end_city;
    route.departure_date = updatedRoute.departure_date || route.departure_date;
    route.completion_date = updatedRoute.completion_date || route.completion_date;
    route.expected_revenue = updatedRoute.expected_revenue || route.expected_revenue;
    route.distance = updatedRoute.distance || route.distance;
    route.transport_type = updatedRoute.transport_type || route.transport_type;
    route.status = updatedRoute.status || route.status;

    if (updatedRoute.hasOwnProperty('transport_id')) {
      route.transport_id = updatedRoute.transport_id;
    }

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
