import { asc, eq } from 'drizzle-orm';
import { db } from '../../db';
import { deviceCategories } from '../../db/schema';
import type { CategoryInput } from './categories.schema';

export const categoriesRepository = {
  list() { return db.select().from(deviceCategories).orderBy(asc(deviceCategories.name)); },
  async get(id: string) { const [row] = await db.select().from(deviceCategories).where(eq(deviceCategories.id, id)); return row; },
  async create(input: CategoryInput) { const [row] = await db.insert(deviceCategories).values(input).returning(); return row; },
  async update(id: string, input: Partial<CategoryInput>) { const [row] = await db.update(deviceCategories).set({ ...input, updatedAt: new Date() }).where(eq(deviceCategories.id, id)).returning(); return row; },
  async remove(id: string) { const [row] = await db.update(deviceCategories).set({ isActive: false, updatedAt: new Date() }).where(eq(deviceCategories.id, id)).returning({ id: deviceCategories.id }); return row; },
};
