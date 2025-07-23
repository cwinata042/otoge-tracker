import Head from 'next/head'
import GameGrid from '../_components/collection/GameGrid'

export default function Collection() {
  return (
    <div className="main-container">
      <div className="header">Cool header here</div>
      <div className="body">
        <div className="collection-header">
          <div className="collection-title">
            <div className="title">Collection (30)</div>
            <button>Add new game</button>
          </div>
          <div className="filter-sort">filter and sort</div>
        </div>
        <GameGrid />
      </div>
    </div>
  )
}
