import assert from 'node:assert/strict';
import { repairRequestsRepository } from './repair-requests.repository';
import { repairRequestsService } from './repair-requests.service';
import { DevActor } from './repair-requests.types';

console.log('--- Starting Feature 3: Repair Requests Test Suite ---');

const runTests = () => {
  // Reset repository state before test run
  repairRequestsRepository.resetStore();

  const consumerColombo: DevActor = {
    id: 'consumer_test_01',
    name: 'Nimal Fernando',
    role: 'consumer',
  };

  const techColombo: DevActor = {
    id: 'tech_colombo_01',
    name: 'Sunil repairs',
    role: 'technician',
    serviceArea: 'Colombo',
    supportedCategories: ['Smartphones', 'Audio'],
  };

  const techKandy: DevActor = {
    id: 'tech_kandy_01',
    name: 'Chaminda Silva',
    role: 'technician',
    serviceArea: 'Kandy',
    supportedCategories: ['Laptops'],
  };

  // Test 1: Pre-sign photo upload URL generator
  console.log('✓ Test 1: Generate pre-signed object storage photo upload metadata');
  const presignResult = repairRequestsService.presignPhotoUpload({
    fileName: 'broken_camera_glass.jpg',
    fileType: 'image/jpeg',
    fileSize: 2450000,
  });

  assert.ok(presignResult.key.startsWith('photos/requests/'), 'Object key must start with photos/requests/');
  assert.ok(presignResult.uploadUrl.includes('storage.repairlink.lk'), 'Upload URL must point to object storage');
  assert.equal(presignResult.fileType, 'image/jpeg');
  assert.equal(presignResult.fileSize, 2450000);

  // Test 2: Consumer creates repair request with validated photo metadata
  console.log('✓ Test 2: Consumer creates repair request with object keys and validated metadata');
  const newRequest = repairRequestsService.createRequest(
    {
      deviceCategory: 'Smartphones',
      deviceBrand: 'Google',
      deviceModel: 'Pixel 7',
      issueDescription: 'Rear camera glass shattered. Photos are blurry with artifacts. Needs glass and sensor check.',
      photos: [
        {
          key: presignResult.key,
          fileName: 'broken_camera_glass.jpg',
          fileType: 'image/jpeg',
          fileSize: 2450000,
          url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea',
        },
      ],
      preferredRepairMethod: 'carry_in',
      approximateLocation: 'Colombo 04 (Bambalapitiya)',
      preferredTime: 'Any weekday afternoon',
      budget: 18000,
      contactPhone: '0777123456',
    },
    consumerColombo,
  );

  assert.ok(newRequest.id.startsWith('req_'), 'Request ID should have req_ prefix');
  assert.equal(newRequest.status, 'requested', 'Initial status must be requested');
  assert.equal(newRequest.photos.length, 1, 'Photos array should contain 1 photo');
  assert.equal(newRequest.photos[0].key, presignResult.key, 'Photo key must match stored key');

  // Verify initial history record
  const initialHistory = repairRequestsService.getStatusHistory(newRequest.id, consumerColombo);
  assert.equal(initialHistory.length, 1, 'Initial history must have 1 record');
  assert.equal(initialHistory[0].newStatus, 'requested');
  assert.equal(initialHistory[0].actor.id, consumerColombo.id);

  // Test 3: Technician lead matching by category & service area
  console.log('✓ Test 3: Technician lead discovery filters strictly by category and service area');
  // Colombo technician (Smartphones) should see Pixel 7 lead in Colombo
  const colomboLeads = repairRequestsService.getLeadsForTechnician(techColombo);
  const foundInColombo = colomboLeads.find((l) => l.id === newRequest.id);
  assert.ok(foundInColombo, 'Colombo technician should see Colombo Smartphone lead');

  // Kandy technician (Laptops) should NOT see Colombo Smartphone lead
  const kandyLeads = repairRequestsService.getLeadsForTechnician(techKandy);
  const foundInKandy = kandyLeads.find((l) => l.id === newRequest.id);
  assert.equal(foundInKandy, undefined, 'Kandy laptop technician must NOT see Colombo smartphone lead');

  // Test 4: Quoting rule — eligible technician quotes, status transitions requested -> quoted
  console.log('✓ Test 4: Technician quotes once, request transitions from requested -> quoted');
  const quoteResult = repairRequestsService.submitQuote(
    newRequest.id,
    {
      amount: 16500,
      currency: 'LKR',
      message: 'Genuine Google OEM camera glass replacement in stock. 2 hours turnaround in Bambalapitiya.',
      estimatedDurationHours: 2,
    },
    techColombo,
  );

  assert.equal(quoteResult.quote.amount, 16500);
  assert.equal(quoteResult.quote.technicianId, techColombo.id);
  assert.equal(quoteResult.request.status, 'quoted', 'Status must transition to quoted on first quote');

  // Verify status history updated
  const historyAfterQuote = repairRequestsService.getStatusHistory(newRequest.id, consumerColombo);
  assert.equal(historyAfterQuote.length, 2, 'History must contain 2 records');
  assert.equal(historyAfterQuote[1].oldStatus, 'requested');
  assert.equal(historyAfterQuote[1].newStatus, 'quoted');
  assert.equal(historyAfterQuote[1].actor.id, techColombo.id);

  // Test 5: Quoting rule — Strictly one quote per technician per request
  console.log('✓ Test 5: Re-quoting by the same technician is strictly rejected');
  assert.throws(
    () => {
      repairRequestsService.submitQuote(
        newRequest.id,
        {
          amount: 15000,
          currency: 'LKR',
          message: 'Revised lower quote',
        },
        techColombo,
      );
    },
    {
      message: 'Technicians may quote only once per repair request. Quote revisions are not permitted.',
    },
    'Duplicate quote by same technician must be rejected',
  );

  // Test 6: Ineligible technician cannot quote on non-matching lead
  console.log('✓ Test 6: Non-matching technician cannot quote on lead');
  assert.throws(
    () => {
      repairRequestsService.submitQuote(
        newRequest.id,
        {
          amount: 20000,
          currency: 'LKR',
          message: 'Kandy technician trying to quote Colombo smartphone',
        },
        techKandy,
      );
    },
    (err: any) => err.statusCode === 403,
    'Non-matching category or location technician should receive 403',
  );

  // Test 7: Consumer books request by accepting quote (quoted -> booked)
  console.log('✓ Test 7: Consumer accepts quote, request transitions to booked');
  const bookedRequest = repairRequestsService.bookRepairRequest(
    newRequest.id,
    {
      quoteId: quoteResult.quote.id,
      scheduledAt: '2026-09-08T10:00:00Z',
      notes: 'Will drop off at 10 AM',
    },
    consumerColombo,
  );

  assert.equal(bookedRequest.status, 'booked');
  assert.equal(bookedRequest.assignedTechnicianId, techColombo.id);
  assert.ok(bookedRequest.booking, 'Booking details must be created');
  assert.equal(bookedRequest.booking?.acceptedQuoteId, quoteResult.quote.id);

  const historyAfterBooking = repairRequestsService.getStatusHistory(newRequest.id, consumerColombo);
  assert.equal(historyAfterBooking.length, 3);
  assert.equal(historyAfterBooking[2].newStatus, 'booked');

  // Test 8: Assigned technician updates work status (booked -> in_progress -> waiting_for_parts -> completed)
  console.log('✓ Test 8: Assigned technician updates work status sequentially');
  
  // booked -> in_progress
  const inProgressReq = repairRequestsService.updateWorkStatus(
    newRequest.id,
    { status: 'in_progress', note: 'Device received at workshop' },
    techColombo,
  );
  assert.equal(inProgressReq.status, 'in_progress');

  // in_progress -> waiting_for_parts
  const waitingReq = repairRequestsService.updateWorkStatus(
    newRequest.id,
    { status: 'waiting_for_parts', note: 'Waiting for camera optical adhesive' },
    techColombo,
  );
  assert.equal(waitingReq.status, 'waiting_for_parts');

  // waiting_for_parts -> completed
  const completedReq = repairRequestsService.updateWorkStatus(
    newRequest.id,
    { status: 'completed', note: 'Camera glass replaced and tested successfully' },
    techColombo,
  );
  assert.equal(completedReq.status, 'completed');

  const historyAfterCompletion = repairRequestsService.getStatusHistory(newRequest.id, consumerColombo);
  assert.equal(historyAfterCompletion.length, 6, 'Should have 6 history steps');
  assert.equal(historyAfterCompletion[5].newStatus, 'completed');

  // Test 9: Invalid status transition rejected
  console.log('✓ Test 9: Invalid state transition is rejected');
  assert.throws(
    () => {
      repairRequestsService.updateWorkStatus(
        newRequest.id,
        { status: 'in_progress', note: 'Cannot revert completed back to in_progress' },
        techColombo,
      );
    },
    (err: any) => err.statusCode === 400,
    'Invalid transition from completed to in_progress must be rejected',
  );

  // Test 10: Unauthorized user cannot update work status
  console.log('✓ Test 10: Unauthorized technician cannot update work status');
  assert.throws(
    () => {
      repairRequestsService.updateWorkStatus(
        'req_galle_003', // Seeded request assigned to tech_galle_01
        { status: 'waiting_for_parts', note: 'Unassigned tech trying to update' },
        techColombo, // tech_colombo is NOT assigned
      );
    },
    (err: any) => err.statusCode === 403,
    'Unassigned technician must receive 403',
  );

  // Test 11: Cancellation by consumer
  console.log('✓ Test 11: Consumer can cancel active request');
  const cancelTestReq = repairRequestsService.createRequest(
    {
      deviceCategory: 'Smartphones',
      deviceBrand: 'Apple',
      deviceModel: 'iPhone 11',
      issueDescription: 'Battery drain test request to be cancelled',
      photos: [],
      preferredRepairMethod: 'carry_in',
      approximateLocation: 'Colombo 05',
      preferredTime: 'Tomorrow',
    },
    consumerColombo,
  );

  const cancelledReq = repairRequestsService.cancelRequest(
    cancelTestReq.id,
    { reason: 'Found another device' },
    consumerColombo,
  );
  assert.equal(cancelledReq.status, 'cancelled');

  // Cancelling already cancelled request must fail
  assert.throws(
    () => {
      repairRequestsService.cancelRequest(
        cancelTestReq.id,
        { reason: 'Trying to cancel again' },
        consumerColombo,
      );
    },
    (err: any) => err.statusCode === 400,
  );

  // Test 12: Dispute opening by participant
  console.log('✓ Test 12: Either participant can open a dispute');
  const disputedReq = repairRequestsService.openDispute(
    newRequest.id, // currently completed
    { reason: 'Camera lens has fine dust inside after repair' },
    consumerColombo,
  );
  assert.equal(disputedReq.status, 'disputed');

  const historyAfterDispute = repairRequestsService.getStatusHistory(newRequest.id, consumerColombo);
  const lastHistory = historyAfterDispute[historyAfterDispute.length - 1];
  assert.equal(lastHistory.newStatus, 'disputed');
  assert.ok(lastHistory.note?.includes('dust inside'));

  console.log('\nAll 12 Feature 3 automated test scenarios passed successfully!');
};

runTests();

