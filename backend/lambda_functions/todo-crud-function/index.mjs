import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  ScanCommand,
  UpdateItemCommand,
  DeleteItemCommand
} from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});
const TABLE_NAME = "Tasks";

// Headers CORS constants
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
  "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
  "Content-Type": "application/json"
};

export const handler = async (event) => {
  const method = event.httpMethod;
  const id = event.pathParameters ? event.pathParameters.id : null;
  let response;

  // Handle OPTIONS request (preflight CORS)
  if (method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: ""
    };
  }

  try {
    if (method === "POST") {
      const data = JSON.parse(event.body);
      const item = {
        id: { S: data.id },
        title: { S: data.title },
        completed: { BOOL: data.completed || false }
      };
      await client.send(new PutItemCommand({ TableName: TABLE_NAME, Item: item }));
      response = {
        statusCode: 201,
        headers: CORS_HEADERS,
        body: JSON.stringify(data)
      };

    } else if (method === "GET") {
      if (id) {
        const result = await client.send(new GetItemCommand({
          TableName: TABLE_NAME,
          Key: { id: { S: id } }
        }));
        if (result.Item) {
          const task = {
            id: result.Item.id.S,
            title: result.Item.title.S,
            completed: result.Item.completed.BOOL
          };
          response = { 
            statusCode: 200, 
            headers: CORS_HEADERS,
            body: JSON.stringify(task) 
          };
        } else {
          response = { 
            statusCode: 404, 
            headers: CORS_HEADERS,
            body: JSON.stringify({ message: "Task not found" }) 
          };
        }
      } else {
        const result = await client.send(new ScanCommand({ TableName: TABLE_NAME }));
        const tasks = result.Items.map(item => ({
          id: item.id.S,
          title: item.title.S,
          completed: item.completed.BOOL
        }));
        response = { 
          statusCode: 200, 
          headers: CORS_HEADERS,
          body: JSON.stringify(tasks) 
        };
      }

    } else if (method === "PUT") {
      const data = JSON.parse(event.body);
      if (!id) {
        return { 
          statusCode: 400, 
          headers: CORS_HEADERS,
          body: JSON.stringify({ message: "Missing id in path" }) 
        };
      }
      const updateParams = {
        TableName: TABLE_NAME,
        Key: { id: { S: id } },
        UpdateExpression: "SET title = :t, completed = :c",
        ExpressionAttributeValues: {
          ":t": { S: data.title },
          ":c": { BOOL: data.completed }
        },
        ReturnValues: "ALL_NEW"
      };
      const result = await client.send(new UpdateItemCommand(updateParams));
      const updatedItem = {
        id: result.Attributes.id.S,
        title: result.Attributes.title.S,
        completed: result.Attributes.completed.BOOL
      };
      response = { 
        statusCode: 200, 
        headers: CORS_HEADERS,
        body: JSON.stringify(updatedItem) 
      };

    } else if (method === "DELETE") {
      if (!id) {
        return { 
          statusCode: 400, 
          headers: CORS_HEADERS,
          body: JSON.stringify({ message: "Missing id in path" }) 
        };
      }
      await client.send(new DeleteItemCommand({
        TableName: TABLE_NAME,
        Key: { id: { S: id } }
      }));
      
      // IMPORTANT: Utiliser 200 au lieu de 204 pour que les headers CORS soient lus
      response = { 
        statusCode: 200, 
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: "Task deleted successfully", id: id })
      };

    } else {
      response = {
        statusCode: 405,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: "Method Not Allowed" })
      };
    }

  } catch (err) {
    console.error("Error:", err);
    response = {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Internal Server Error", error: err.message })
    };
  }

  return response;
};