import { ChatGPTInterface } from '@/components/chatgpt-interface'

export default async function ChatPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  return <ChatGPTInterface chatId={params.id} />
}

