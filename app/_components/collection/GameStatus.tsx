import { TGameStatuses } from '@/lib/types'

export default function GameStatus({ status }: { status: TGameStatuses }) {
  return <div className={'gameStatus ' + status}>{status}</div>
}
