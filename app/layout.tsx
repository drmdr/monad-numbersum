import type { Metadata } from 'next'
import { Darumadrop_One } from 'next/font/google'

import { Providers } from '@/components/providers'
import './globals.css'

const darumadrop = Darumadrop_One({
  subsets: ['latin'],
  weight: '400',
})

export const metadata: Metadata = {
  title: 'Monad Farcaster MiniApp Template',
  description: 'A template for building mini-apps on Farcaster and Monad',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${darumadrop.className} overflow-hidden`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
