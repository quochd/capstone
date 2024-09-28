import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { TodosAccess } from './todosAcess'

const XAWS = AWSXRay.captureAWS(AWS)

const todosAccess = new TodosAccess()
const s3 = new XAWS.S3({ signatureVersion: 'v4' })

const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export async function createAttachmentPresignedUrl(userId: string, todoId: string): Promise<string> {
  const presignedUrl =  s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires:  parseInt(urlExpiration)
  })
  await todosAccess.updateAttachmentUrlDB(userId, todoId, `https://${bucketName}.s3.amazonaws.com/${todoId}`)
  return presignedUrl
}