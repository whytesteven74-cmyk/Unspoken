import { ChatInterface } from '@/components/chat-interface';
import { ErrorBoundary } from '@/components/error-boundary';

export const metadata = {
  title: 'Unspoken | AI CBT Companion',
  description: 'A serverless mental health bridge application.',
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <ErrorBoundary>
        <ChatInterface />
      </ErrorBoundary>
    </main>
  );
}
