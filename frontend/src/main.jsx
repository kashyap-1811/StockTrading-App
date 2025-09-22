import { createRoot } from 'react-dom/client'
import {BrowserRouter, Routes, Route} from 'react-router-dom'

import HomePage from './landing_page/home/HomePage'
import SignUp from './landing_page/signup/SignUp'
import AboutPage from './landing_page/about/AboutPage'
import ProductPage from './landing_page/products/ProductPage'
import PricingPage from './landing_page/pricing/PricingPage'
import SupportPage from './landing_page/support/SupportPage'
import NotFound from './landing_page/NotFound'
import Navbar from './landing_page/Navbar'
import Footer from './landing_page/Footer'
import AuthSuccess from './pages/AuthSuccess'
import AuthError from './pages/AuthError'
import Dashboard from './pages/Dashboard'
import ErrorPage from './components/ErrorPage'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <Navbar />

    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/products" element={<ProductPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/auth/success" element={<AuthSuccess />} />
      <Route path="/auth/error" element={<AuthError />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/*" element={<ErrorPage />} />
    </Routes>

    <Footer />
  </BrowserRouter>
)
