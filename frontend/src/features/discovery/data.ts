import type { Repairer } from './types'

export const repairers: Repairer[] = [
  { id: 'kamals-device-care', initials: 'KD', name: 'Kamal’s Device Care', specialty: 'Phone & laptop repairs', rating: '4.91', reviews: '124', distance: '1.4 km away', price: 'Rs. 4,500', color: 'bg-[#d6b48b]', tag: 'Top rated', imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=85', coordinates: [6.9147, 79.8646], availableToday: true, mobileService: true },
  { id: 'fixright-electronics', initials: 'FR', name: 'FixRight Electronics', specialty: 'Appliances & home devices', rating: '4.86', reviews: '87', distance: '2.1 km away', price: 'Rs. 3,000', color: 'bg-[#7e9b91]', tag: 'Verified', imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=85', coordinates: [6.9024, 79.8707], availableToday: true, mobileService: false },
  { id: 'mobile-medic', initials: 'MM', name: 'Mobile Medic', specialty: 'Apple & Android specialists', rating: '4.94', reviews: '203', distance: '3.8 km away', price: 'Rs. 5,000', color: 'bg-[#aa8071]', tag: 'Top rated', imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85', coordinates: [6.9271, 79.8612], availableToday: false, mobileService: true },
]

export const filters = ['Filters', 'Available today', 'Top rated', 'Mobile service']
