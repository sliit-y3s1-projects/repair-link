import { BrowserRouter, Route, Routes } from 'react-router'
import { AuthProvider } from '@/features/auth/AuthContext'
import { RoleGuard } from '@/features/auth/RoleGuard'
import { AdminWorkspace } from '@/features/dashboard/AdminWorkspace'
import { ConsumerWorkspace } from '@/features/dashboard/ConsumerWorkspace'
import { DashboardRedirect } from '@/features/dashboard/DashboardRedirect'
import { ProfilePage } from '@/features/dashboard/ProfilePage'
import { SellerWorkspace } from '@/features/dashboard/SellerWorkspace'
import { TechnicianWorkspace } from '@/features/dashboard/TechnicianWorkspace'
import { Header } from '@/features/discovery/components/Header'
import { DiscoveryPage } from '@/features/discovery/DiscoveryPage'
import { AuthPage } from '@/features/pages/AuthPage'
import { ImpactPage } from '@/features/pages/ImpactPage'
import { MessagesPage } from '@/features/pages/MessagesPage'
import { PartsPage } from '@/features/pages/PartsPage'
import { RepairerProfilePage } from '@/features/pages/RepairerProfilePage'
import { RequestPage } from '@/features/pages/RequestPage'
import { SellerPage } from '@/features/pages/SellerPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <Header />
      <Routes>
        <Route path="/" element={<DiscoveryPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/request" element={<RoleGuard roles={['consumer']}><RequestPage /></RoleGuard>} />
        <Route path="/repairers" element={<DiscoveryPage />} />
        <Route path="/repairers/:repairerId" element={<RepairerProfilePage />} />
        <Route path="/parts" element={<PartsPage />} />
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route path="/consumer/dashboard" element={<RoleGuard roles={['consumer']}><ConsumerWorkspace /></RoleGuard>} />
        <Route path="/consumer/profile" element={<RoleGuard roles={['consumer']}><ProfilePage /></RoleGuard>} />
        <Route path="/technician" element={<DashboardRedirect />} />
        <Route path="/technician/dashboard" element={<RoleGuard roles={['technician']}><TechnicianWorkspace /></RoleGuard>} />
        <Route path="/technician/profile" element={<RoleGuard roles={['technician']}><ProfilePage /></RoleGuard>} />
        <Route path="/seller" element={<DashboardRedirect />} />
        <Route path="/seller/dashboard" element={<RoleGuard roles={['seller']}><SellerWorkspace /></RoleGuard>} />
        <Route path="/seller/storefront" element={<RoleGuard roles={['seller']}><SellerPage /></RoleGuard>} />
        <Route path="/seller/profile" element={<RoleGuard roles={['seller']}><ProfilePage /></RoleGuard>} />
        <Route path="/messages" element={<RoleGuard roles={['consumer', 'technician', 'seller', 'admin']}><MessagesPage /></RoleGuard>} />
        <Route path="/impact" element={<RoleGuard roles={['consumer']}><ImpactPage /></RoleGuard>} />
        <Route path="/admin" element={<DashboardRedirect />} />
        <Route path="/admin/dashboard" element={<RoleGuard roles={['admin']}><AdminWorkspace /></RoleGuard>} />
        <Route path="*" element={<DiscoveryPage />} />
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
