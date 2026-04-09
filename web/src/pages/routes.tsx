import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { Home } from '@/pages/home'
import { NotFound } from '@/pages/not-found'
import { RedirectPage } from '@/pages/redirect'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/not-found" element={<NotFound />} />
        <Route path=":shortUrl" element={<RedirectPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
