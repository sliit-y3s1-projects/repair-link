import 'dotenv/config';
import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';
import { db, pool } from './index';
import { deviceCategories, platformUsers, sellerProfiles, technicianCategories, technicianProfiles, consumerProfiles, partListings } from './schema';

const ids = {
  consumer: '00000000-0000-4000-8000-000000000001',
  technician: '00000000-0000-4000-8000-000000000002',
  seller: '00000000-0000-4000-8000-000000000003',
  admin: '00000000-0000-4000-8000-000000000004',
  phones: '00000000-0000-4000-8000-000000000010',
  laptops: '00000000-0000-4000-8000-000000000011',
};
const scrypt = promisify(scryptCallback);
const developmentPassword = 'RepairLink123!';
async function passwordHash(password: string) { const salt = randomBytes(16).toString('hex'); return `${salt}:${Buffer.from(await scrypt(password, salt, 64) as ArrayBuffer).toString('hex')}`; }

async function seed() {
  const seededPasswordHash = await passwordHash(developmentPassword);
  await db.insert(platformUsers).values([
    { id: ids.consumer, email: 'consumer@repairlink.local', passwordHash: seededPasswordHash, displayName: 'Nimal Fernando', primaryRole: 'consumer' },
    { id: ids.technician, email: 'technician@repairlink.local', passwordHash: seededPasswordHash, displayName: 'Kamal Device Care', primaryRole: 'technician' },
    { id: ids.seller, email: 'seller@repairlink.local', passwordHash: seededPasswordHash, displayName: 'Ruwan Perera', primaryRole: 'seller' },
    { id: ids.admin, email: 'admin@repairlink.local', passwordHash: seededPasswordHash, displayName: 'Repair Link Admin', primaryRole: 'admin' },
  ]).onConflictDoUpdate({ target: platformUsers.email, set: { passwordHash: seededPasswordHash } });
  await db.insert(consumerProfiles).values({ userId: ids.consumer }).onConflictDoNothing();
  await db.insert(technicianProfiles).values({ userId: ids.technician, businessName: 'Kamal Device Care', serviceArea: 'Colombo', verificationStatus: 'verified' }).onConflictDoNothing();
  await db.insert(sellerProfiles).values({ userId: ids.seller, storeName: 'Pettah Tech Spares Hub', serviceArea: 'Colombo', verificationStatus: 'verified' }).onConflictDoNothing();
  await db.insert(deviceCategories).values([
    { id: ids.phones, name: 'Phones', slug: 'phones' }, { id: ids.laptops, name: 'Laptops', slug: 'laptops' },
  ]).onConflictDoNothing();
  await db.insert(technicianCategories).values([{ technicianId: ids.technician, categoryId: ids.phones }, { technicianId: ids.technician, categoryId: ids.laptops }]).onConflictDoNothing();
  await db.insert(partListings).values({ sellerId: ids.seller, categoryId: ids.phones, name: 'iPhone 13 OLED display', sku: 'IP13-OLED-BLK', compatibleDevices: 'Apple iPhone 13', condition: 'compatible', price: '8500', stockQuantity: 12, warrantyDays: 90, deliveryOptions: ['Shop pickup', 'Courier'] }).onConflictDoNothing();
  console.log('Repair Link development seed completed');
}

seed().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => pool.end());
