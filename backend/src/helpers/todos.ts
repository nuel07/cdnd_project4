import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
//import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as AWS from 'aws-sdk'
import * as createError from 'http-errors'
import { getUserId } from '../lambda/utils';

// TODO: Implement businessLogic
const todosAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()


//Get todos for a given user
export async function getTodosForUser(jwtToken: string): Promise<TodoItem[]>{
    const userId: string = getUserId(jwtToken)
    return todosAccess.getTodosForUser(userId)
}

//Get single todo item
export async function getTodo(jwtToken: string, todoId: string): Promise<TodoItem>{
    const userId: string = getUserId(jwtToken)
    return todosAccess.getTodo(userId, todoId)
}

//create todo item
export async function createTodo(
    createTodoReq: CreateTodoRequest,
    jwtToken: string ): Promise<TodoItem>{
        const itemId = uuid.v4()
        const userId: string = getUserId(jwtToken)

        return todosAccess.createTodo({
            todoId: itemId,
            userId: userId,
            done: false,
            name: createTodoReq.name,
            dueDate: createTodoReq.dueDate,
            createdAt: new Date().toISOString()
        })
    }

//update todo item
export async function updateTodo(
    jwtToken: string,
    todoId: string,
    updateReq: UpdateTodoRequest
  ): Promise<void> {
    const userId = getUserId(jwtToken);
    return todosAccess.updateTodo(userId, todoId, updateReq);
  }
  
  //delete todo item
  export async function deleteTodo(jwtToken: string, todoId: string): Promise<void> {
    const userId = getUserId(jwtToken);
    return todosAccess.deleteTodo(userId, todoId);
  }
  
  //generate upload url for todo item
  export async function createAttachmentPresignedUrl(jwtToken: string, todoId: string): Promise<string> {
    const userId = getUserId(jwtToken);
    const bucketName = process.env.ATTACHMENT_S3_BUCKET;
    const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION, 10);
    const s3 = new AWS.S3({ signatureVersion: 'v4' });
    const signedUrl = s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: todoId,
      Expires: urlExpiration
    });
    await attachmentUtils.todoImgUrl(userId, todoId, bucketName);
    return signedUrl;
  }