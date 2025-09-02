import { IoMdArrowDropdown } from 'react-icons/io'
import { RxCross2 } from 'react-icons/rx'
import { FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa'
import { TSort } from '@/lib/types'

export default function Sort({
  sortOptions,
  currSort,
  setCurrSort,
}: {
  sortOptions: string[]
  currSort: TSort
  setCurrSort: any
}) {
  function handleSelect(option: string) {
    if (currSort.name === option) {
      setCurrSort({ name: currSort.name, isDesc: !currSort.isDesc })
    } else {
      setCurrSort({ name: option, isDesc: true })
    }
  }

  const sortOptionsList = sortOptions.map((option) => {
    if (option !== '') {
      return (
        <li
          key={`sort-${option}`}
          className={`${currSort.name === option ? 'selected' : ''}`}
          onClick={() => handleSelect(option)}
        >
          <span>{option}</span>
          {currSort.name === option && (currSort.isDesc ? <FaSortAmountDown /> : <FaSortAmountUp />)}
        </li>
      )
    }
  })

  return (
    <div className="sort" tabIndex={0}>
      <button className={`sort-btn nobg ${Object.keys(currSort).length > 0 ? 'main' : ''}`}>
        Sort
        <IoMdArrowDropdown className="sort-btn-arrow" />
      </button>
      <ul className="sort-content" tabIndex={-1}>
        {sortOptionsList}
      </ul>
    </div>
  )
}
