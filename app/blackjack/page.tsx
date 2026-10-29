import { PageContainer } from '@/components/layout'
import BlackjackGame from './components/BlackjackGame'
import './blackjack.css'

export default function BlackjackPage() {
  return (
    <PageContainer fullScreen>
      <BlackjackGame />
    </PageContainer>
  )
}
