import dynamic from 'next/dynamic';

const ChatRedirect = dynamic(() => import('./ChatRedirect'), { ssr: false });

export default function ChatPage() {
  return <ChatRedirect />;
}
