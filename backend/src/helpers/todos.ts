import { TodosAccess } from './todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { TodoUpdate } from '../models/TodoUpdate';

// TODO: Implement businessLogic
const logger = createLogger('todos')
const todosAccess = new TodosAccess()

export async function getTodos(userId: string): Promise<TodoItem[]> {
  logger.info(`getTodos ${userId}`)
  return await todosAccess.getTodosDB(userId)
}

export async function createTodo(userId: string, createTodoRequest: CreateTodoRequest): Promise<TodoItem> {
  logger.info(`createTodo ${userId}`)
  const todoId = uuid.v4()

  const newTodo: TodoItem = {
    userId,
    todoId,
    createdAt: new Date().toISOString(),
    done: false,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate
  }

  return await todosAccess.createTodoDB(newTodo)
}

export async function updateTodo(todoId: string, userId: string, udateTodoRequest: UpdateTodoRequest): Promise<void> {
  logger.info(`updateTodo ${userId} `)

  const newTodo: TodoUpdate = {
    done: udateTodoRequest.done,
    name: udateTodoRequest.name,
    dueDate: udateTodoRequest.dueDate
  }

  await todosAccess.updateTodoDB(todoId, userId, newTodo)
}

export async function deleteTodo(todoId: string, userId: string): Promise<void> {
  logger.info(`deleteTodo ${todoId}`)
  await todosAccess.deleteTodoDB(todoId, userId)
}