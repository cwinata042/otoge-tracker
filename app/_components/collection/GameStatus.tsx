interface GameStatusProps {
    status: string;
}

export default function GameStatus({status} : GameStatusProps) {
    return (
        <div className={"gameStatus " + status}>
            {status}
        </div>
    )
}