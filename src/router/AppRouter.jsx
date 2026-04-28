import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../pages/auth/LoginPage'
import AdminLayout from '../components/layout/AdminLayout'
import VehiculosPage from '../pages/admin/vehiculos/VehiculosPage'
import ExtrasPage from '../pages/admin/extras/ExtrasPage'
import CategoriasPage from '../pages/admin/categorias/CategoriasPage'
import MarcasPage from '../pages/admin/marcas/MarcasPage'
import LocalizacionesPage from '../pages/admin/localizaciones/LocalizacionesPage'
import ClientesPage from '../pages/admin/clientes/ClientesPage'
import ConductoresPage from '../pages/admin/conductores/ConductoresPage'
import ReservasPage from '../pages/admin/reservas/ReservasPage'
import FacturasPage from '../pages/admin/facturas/FacturasPage'
import DashboardPage from '../pages/admin/dashboard/DashboardPage'

// Marketplace (rutas públicas — sin autenticación)
import BookingSearchPage from '../pages/booking/BookingSearchPage'
import BookingVehiculosPage from '../pages/booking/BookingVehiculosPage'
import BookingExtrasPage from '../pages/booking/BookingExtrasPage'
import BookingClientePage from '../pages/booking/BookingClientePage'
import BookingConfirmacionPage from '../pages/booking/BookingConfirmacionPage'
import BookingExitoPage from '../pages/booking/BookingExitoPage'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Autenticación ── */}
        <Route path="/login" element={<LoginPage />} />

        {/* ── Área administrativa (requiere token JWT) ── */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard"     element={<DashboardPage />} />
          <Route path="vehiculos"     element={<VehiculosPage />} />
          <Route path="extras"        element={<ExtrasPage />} />
          <Route path="categorias"    element={<CategoriasPage />} />
          <Route path="marcas"        element={<MarcasPage />} />
          <Route path="localizaciones" element={<LocalizacionesPage />} />
          <Route path="clientes"      element={<ClientesPage />} />
          <Route path="conductores"   element={<ConductoresPage />} />
          <Route path="reservas"      element={<ReservasPage />} />
          <Route path="facturas"      element={<FacturasPage />} />
        </Route>

        {/* ── Marketplace / Booking (público) ── */}
        <Route path="/booking">
          <Route index                element={<BookingSearchPage />} />
          <Route path="vehiculos"     element={<BookingVehiculosPage />} />
          <Route path="extras"        element={<BookingExtrasPage />} />
          <Route path="cliente"       element={<BookingClientePage />} />
          <Route path="confirmacion"  element={<BookingConfirmacionPage />} />
          <Route path="exito"         element={<BookingExitoPage />} />
        </Route>

        {/* ── Raíz: redirige al marketplace ── */}
        <Route path="/" element={<Navigate to="/booking" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
