import { MonopolyHeader } from './components/MonopolyHeader'

export default function MonopolyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="bg-background flex h-dvh min-h-0 flex-col overflow-hidden">
      <MonopolyHeader />
      <main className="min-h-0 flex-1 overflow-auto">{children}</main>
    </div>
  )
}
