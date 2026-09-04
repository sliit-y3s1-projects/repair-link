import { BrowserRouter, Route, Routes } from 'react-router'
import { Header } from '@/features/discovery/components/Header'
import { DiscoveryPage } from '@/features/discovery/DiscoveryPage'
import { AdminPage } from '@/features/pages/AdminPage'
import { ConsumerDashboardPage } from '@/features/pages/ConsumerDashboardPage'
import { ImpactPage } from '@/features/pages/ImpactPage'
import { MessagesPage } from '@/features/pages/MessagesPage'
import { PartsPage } from '@/features/pages/PartsPage'
import { RepairerProfilePage } from '@/features/pages/RepairerProfilePage'
import { RequestPage } from '@/features/pages/RequestPage'
import { SellerPage } from '@/features/pages/SellerPage'
import { TechnicianPage } from '@/features/pages/TechnicianPage'

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<DiscoveryPage />} />
        <Route path="/request" element={<RequestPage />} />
        <Route path="/repairers" element={<DiscoveryPage />} />
        <Route path="/repairers/:repairerId" element={<RepairerProfilePage />} />
        <Route path="/parts" element={<PartsPage />} />
        <Route path="/dashboard" element={<ConsumerDashboardPage />} />
        <Route path="/technician" element={<TechnicianPage />} />
        <Route path="/seller" element={<SellerPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/impact" element={<ImpactPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<DiscoveryPage />} />
      </Routes>
    </BrowserRouter>
  )
}
