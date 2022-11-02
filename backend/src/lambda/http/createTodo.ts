import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
//import * as middy from 'middy'
//import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
//import { getUserId } from '../utils';
import { createTodo } from '../../helpers/todos'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    //console.log('Processing event: ', event);
    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    // TODO: Implement creating a new TODO item
    const todo = await createTodo(newTodo, jwtToken)

    return {
      statusCode: 201,
      headers:{
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        todo: todo
      })
    }
  }

/*handler.use(
  cors({
    credentials: true
  })
)*/
