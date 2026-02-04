import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import MobileNav from '@/components/layout/MobileNav'
import NetworkStatus from '@/components/ui/NetworkStatus'
import ErrorBoundaryWrapper from '@/components/layout/ErrorBoundaryWrapper'
import Providers from '@/components/layout/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dynamic Endurance Training Platform',
  description: 'Build once, assign many - Dynamic workout scaling based on VDOT and FTP',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundaryWrapper>
          <Providers>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <NetworkStatus />
              <main className="flex-grow pb-16 md:pb-0">{children}</main>
              <Footer />
              <MobileNav />
            </div>
          </Providers>
        </ErrorBoundaryWrapper>
      </body>
    </html>
  )
}
