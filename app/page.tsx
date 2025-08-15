import Link from 'next/link'

export default function Home() {
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl">Welcome</h1>
        <Link href="/chat/new" className="underline">Start a new chat</Link>
      </div>
    </div>
  )
}
