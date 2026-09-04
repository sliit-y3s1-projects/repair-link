import type { Repairer } from './types'

export const repairers: Repairer[] = [
  { initials: 'KD', name: 'Kamal’s Device Care', specialty: 'Phone & laptop repairs', rating: '4.91', reviews: '124', distance: '1.4 km away', price: 'Rs. 4,500', color: 'bg-[#d6b48b]', tag: 'Top rated' },
  { initials: 'FR', name: 'FixRight Electronics', specialty: 'Appliances & home devices', rating: '4.86', reviews: '87', distance: '2.1 km away', price: 'Rs. 3,000', color: 'bg-[#7e9b91]', tag: 'Verified' },
  { initials: 'MM', name: 'Mobile Medic', specialty: 'Apple & Android specialists', rating: '4.94', reviews: '203', distance: '3.8 km away', price: 'Rs. 5,000', color: 'bg-[#aa8071]', tag: 'Top rated' },
]

export const filters = ['Filters', 'Available today', 'Top rated', 'Mobile service']
