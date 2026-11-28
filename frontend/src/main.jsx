import { StrictMode } from 'react'
import { BrowserRouter } from 'react-router'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider as JotaiProvider } from 'jotai'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'

import './index.css'

import App from './App.jsx'
import { AuthSync } from './features/auth/AuthSync'
import { store } from './store'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
      retry: (count, error) =>
        !(error?.status >= 400 && error?.status < 500) && count < 2,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <JotaiProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthSync />
        <BrowserRouter>
          <App />
          <Toaster position="top-center" richColors closeButton />
        </BrowserRouter>
      </QueryClientProvider>
    </JotaiProvider>
  </StrictMode>,
)
