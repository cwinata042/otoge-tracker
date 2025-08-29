import { TStatuses } from '@/lib/types'

export default function GameStatus({ status }: { status: TStatuses }) {
  return <div className={'gameStatus ' + status}>{status}</div>
}
