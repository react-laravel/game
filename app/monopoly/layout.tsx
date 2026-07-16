export default function MonopolyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="bg-background h-dvh min-h-0 overflow-hidden">
      <main className="size-full overflow-auto">{children}</main>
    </div>
  )
}
