import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as AWS from 'aws-sdk'
//import * as createError from 'http-errors'
//import { getUserId } from '../lambda/utils';

// TODO: Implement businessLogic
const todosAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()
const logger = createLogger('TodosAccess')


//Get todos for a given user
export async function getTodosForUser(userId: string): Promise<TodoItem[]>{
    logger.info("Get todos for user")
    return todosAccess.getTodosForUser(userId)
}

//Get single todo item
export async function getTodo(userId: string, todoId: string): Promise<TodoItem>{
    return todosAccess.getTodo(userId, todoId)
}

//function to create todo item
export async function createTodo(
    createTodoReq: CreateTodoRequest,
    userId: string ): Promise<TodoItem>{
        const itemId = uuid.v4()
        const s3AttachmentUrl = attachmentUtils.getAttachmentUrl(itemId)
        return todosAccess.createTodo({
            todoId: itemId,
            userId: userId,
            done: false,
            name: createTodoReq.name,
            dueDate: createTodoReq.dueDate,
            createdAt: new Date().toISOString(),
            attachmentUrl: s3AttachmentUrl
        })
    }

//update todo item
export async function updateTodo(
    todoId: string,
    updateReq: UpdateTodoRequest,
    userId: string
  ): Promise<void> {
    return todosAccess.updateTodo(userId, todoId, updateReq);
  }
  
  //delete todo item
  export async function deleteTodo(userId: string, todoId: string): Promise<void> {
    logger.info("Delete todo")
    return todosAccess.deleteTodo(userId, todoId);
  }
  
  //generate upload url for todo item
  export async function createAttachmentPresignedUrl(userId: string, todoId: string): Promise<string> {
    const bucketName = process.env.ATTACHMENT_S3_BUCKET;
    const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION, 10);
    const s3 = new AWS.S3({ signatureVersion: 'v4' });
    const signedUrl = s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: todoId,
      Expires: urlExpiration
    });
    await attachmentUtils.getUploadUrl(userId);
    return signedUrl;
  }