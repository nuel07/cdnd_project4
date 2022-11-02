import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
//import { deleteTodo } from './todos'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DyamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE
    ){}

    //GET todo items of a user
    async getTodosForUser(userId: string): Promise<TodoItem[]>{
        logger.info('Getting all todo items for user');
        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();
        return result.Items as TodoItem[];
    }

    //GET single todo item
    async getTodo(userId: string, todoId: string): Promise<TodoItem>{
        logger.info(`Getting todo item: ${todoId}`);
        const result = await this.docClient.query({
            TableName: this.docClient,
            KeyConditionExpression: 'userId = :userId and todoId = :todoId',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':todoId': todoId
            }
        }).promise();
        const todoItem = result.Items[0]
        return todoItem as TodoItem;
    }

    //CREATE todo item
    async createTodo(newItem: TodoItem): Promise<TodoItem>{
        logger.info(`Creating new todo item: ${newItem.todoId}`);
        await this.docClient.put({
            TableName: this.todosTable,
            Item: newItem
        }).promise();
        return newItem;
    }

    //UPDATE todo item
    async updateTodo(userId: string, todoId: string, update: TodoUpdate): Promise<void>{
        logger.info(`Updating todo item: ${todoId}`);
        await this.docClient.update({
            TableName: this.todosTable,
            Key: { userId, todoId },
            ConditionExpression: 'attribute_exists(todoId)',
            UpdateExpression: 'set #n = :n, dueDate = :due, done = :dne',
            ExpressionAttributeNames: { '#n': 'name'},
            ExpressionAttributeValues: {
                ':n': update.name,
                ':due': update.dueDate,
                ':dne': update.done
            }
        }).promise();
    }

    //DELETE todo item
    async deleteTodo(userId: string, todoId: string): Promise<void>{
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: { userId, todoId }
        }).promise();
    }
}