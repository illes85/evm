import { nanoid } from 'nanoid'
import type { Client } from '../types'
import { db } from './db'

export async function listClients(): Promise<Client[]> {
  return db.clients.orderBy('name').toArray()
}

export async function getClient(id: string): Promise<Client | undefined> {
  return db.clients.get(id)
}

export async function createClient(data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
  const now = new Date().toISOString()
  const client: Client = { ...data, id: nanoid(), createdAt: now, updatedAt: now }
  await db.clients.put(client)
  return client
}

export async function updateClient(id: string, data: Partial<Omit<Client, 'id' | 'createdAt'>>): Promise<void> {
  await db.clients.update(id, { ...data, updatedAt: new Date().toISOString() })
}

export async function deleteClient(id: string): Promise<void> {
  await db.clients.delete(id)
}
