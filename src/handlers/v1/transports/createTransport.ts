// createTransport.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import connect from '@db/connect';
import { Transports } from '@db/models';
import headers from '@headers';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  await connect();

  try {
    const { plate_number, model, purchase_date, mileage, transport_type } = JSON.parse(event.body || '');

    const transport = new Transports();
    transport.plate_number = plate_number;
    transport.status = 'free'; // Status set to 'free' by default
    transport.model = model;
    transport.purchase_date = new Date(purchase_date);
    transport.mileage = mileage;
    transport.transport_type = transport_type;

    await transport.save();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(transport),
    };
  } catch (error) {
    console.error('Error creating transport:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to create transport.' }),
    };
  }
};
