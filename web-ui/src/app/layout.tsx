import type { Metadata } from 'next'
import './globals.css'
import { WebSocketProvider } from '@/components/WebSocketProvider'

export const metadata: Metadata = {
  title: 'ZeroClaw OS',
  description: 'Autonomous AI Agent Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <WebSocketProvider>
          {children}
        </WebSocketProvider>
      </body>
    </html>
  )
}
