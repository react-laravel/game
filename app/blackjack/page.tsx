import { PageContainer } from '@/components/layout'
import BlackjackGame from './components/BlackjackGame'

export default function BlackjackPage() {
  return (
    <PageContainer maxWidth="2xl" className="!px-2 !py-1.5 sm:!px-3 sm:!py-2">
      <BlackjackGame />
    </PageContainer>
  )
}
