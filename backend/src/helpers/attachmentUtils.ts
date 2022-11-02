import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStorage logic
export class AttachmentUtils {
    constructor(
      private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
      private readonly todosTable = process.env.TODOS_TABLE
    ) {}
  
    async todoImgUrl(userId: string, todoId: string, bucketName: string): Promise<void> {
      await this.docClient
        .update({
          TableName: this.todosTable,
          Key: { userId, todoId },
          ConditionExpression: 'attribute_exists(todoId)',
          UpdateExpression: 'set attachmentUrl = :attachmentUrl',
          ExpressionAttributeValues: {
            ':attachmentUrl': `https://${bucketName}.s3.amazonaws.com/${todoId}`
          }
        })
        .promise();
    }
  }
  
