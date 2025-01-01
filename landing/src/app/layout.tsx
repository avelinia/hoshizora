import './globals.css'
import { Outfit } from 'next/font/google'

const outfit = Outfit({ subsets: ['latin'] })


export const metadata = {
  title: 'Hoshizora',
  description: 'Hoshizora is the desktop Anime app made for You',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${outfit.className} bg-[#16161e] h-full overflow-hidden`}>
        <div
          className="h-screen overflow-y-auto [--scrollbar-size:8px] 
            [--scrollbar-thumb:#bb9af7]
            [scrollbar-width:var(--scrollbar-size)]
            [scrollbar-color:var(--scrollbar-thumb)_transparent]
            [&::-webkit-scrollbar]:w-[--scrollbar-size]
            [&::-webkit-scrollbar]:h-[--scrollbar-size]
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-[--scrollbar-thumb]
            [&::-webkit-scrollbar-track]:bg-transparent"
        >
          {children}
        </div>
      </body>
    </html>
  )
}