import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ToastContainer } from 'react-toastify'

import { AppRouter } from '@/pages/routes'

import 'react-toastify/dist/ReactToastify.css'
import './globals.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: true,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <ToastContainer
        position="top-right"
        autoClose={3200}
        closeOnClick
        pauseOnHover
        theme="light"
        toastClassName="rounded-lg text-sm"
      />
    </QueryClientProvider>
  </StrictMode>,
)
