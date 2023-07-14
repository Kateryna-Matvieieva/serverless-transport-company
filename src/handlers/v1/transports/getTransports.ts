// import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
// import connect from '@db/connect';
// import { Transports } from '@db/models';
// import headers from '@headers';

// export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
//   try {
//     await connect();

//     const transports = await Transports.findAll();

//     return {
//       statusCode: 200,
//       headers,
//       body: JSON.stringify({ data: transports }),
//     };
//   } catch (error) {
//     console.error('Error fetching route:', error);

//     return {
//       statusCode: 500,
//       headers,
//       body: JSON.stringify({ error: 'Failed to fetch route.' }),
//     };
//   }
// };



import { Op, Sequelize } from 'sequelize';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import connect from '@db/connect';
import { Transports, Routes } from '@db/models';
import headers from '@headers';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    await connect();

    const transports = await Transports.findAll({
      include: {
        model: Routes,
        attributes: []
      },
      attributes: {
        include: [
          [Sequelize.fn('COUNT', Sequelize.col('Routes.id')), 'total_routes']
        ]
      },
      group: ['Transports.id']
    });

    const response = transports.map(transport => {
      const { total_routes, ...transportData } = transport.get({ plain: true });
      return { ...transportData, total_routes };
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ data: response }),
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

