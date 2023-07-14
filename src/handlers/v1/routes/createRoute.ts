// createRoute.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import connect from '@db/connect';
import { Routes } from '@db/models';
import headers from '@headers';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  await connect();

  try {
    const { start_city, end_city, departure_date, completion_date, expected_revenue, distance, transport_type } = JSON.parse(event.body || '');

    const route = new Routes();
    route.start_city = start_city;
    route.end_city = end_city;
    route.departure_date = departure_date;
    route.completion_date = completion_date;
    route.expected_revenue = expected_revenue;
    route.distance = distance;
    route.transport_type = transport_type;
    route.status = 'pending';

    await route.save();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(route),
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
