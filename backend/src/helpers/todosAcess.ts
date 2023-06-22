import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

export class TodosAccess {
  constructor(
    private readonly dynamoDBClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly idIndex = process.env.TODOS_CREATED_AT_INDEX
  ) { }

  async getTodosDB(userId: string): Promise<TodoItem[]> {
    logger.info(`getTodosDB of ${userId} `)
    const result = await this.dynamoDBClient.query({
      TableName: this.todosTable,
      IndexName: this.idIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async searchTodosDB(userId: string, todoName: string): Promise<TodoItem[]> {
    const result = await this.dynamoDBClient.query({
      TableName: this.todosTable,
      IndexName: this.idIndex,
      KeyConditionExpression: 'userId = :userId',
      FilterExpression: 'begins_with (todoName, :todoName)',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':todoName': todoName
      }
    }).promise()
  
    const items = result.Items
    return items as TodoItem[]
  }

  async createTodoDB(todoItem: TodoItem): Promise<TodoItem> {
    logger.info(`createTodoDB ${todoItem}`)
    await this.dynamoDBClient.put({
      TableName: this.todosTable,
      Item: todoItem
    }).promise()

    return todoItem
  }

  async updateTodoDB(todoId: string, userId: string, todoUpdate: TodoUpdate): Promise<void> {
    logger.info(`updateTodoDB ${todoId}`)
    await this.dynamoDBClient.update({
      TableName: this.todosTable,
      Key: {
        todoId,
        userId
      },
      UpdateExpression: 'set #todoName = :todoName, dueDate = :dueDate, done = :done',
      ExpressionAttributeValues: {
        ':todoName': todoUpdate.todoName,
        ':dueDate': todoUpdate.dueDate,
        ':done': todoUpdate.done
      },
      ExpressionAttributeNames: {
        '#todoName': 'todoName'
      }
    }).promise()
  }

  async deleteTodoDB(todoId: string, userId: string): Promise<void> {
    logger.info(`deleteTodoDB ${todoId}`)
    await this.dynamoDBClient.delete({
      TableName: this.todosTable,
      Key: {
        todoId,
        userId
      }
    }).promise()
  }

  async updateAttachmentUrlDB(userId: string, todoId: string, attachmentUrl: string): Promise<void> {
    logger.info(`updateAttachmentUrlDB ${todoId} ` )
    await this.dynamoDBClient.update({
      TableName: this.todosTable,
      Key: {
        "userId": userId,
        "todoId": todoId
      },
      UpdateExpression: "set attachmentUrl=:attachmentUrl",
      ExpressionAttributeValues: {
        ":attachmentUrl": attachmentUrl
      }
    }).promise()
  }
}