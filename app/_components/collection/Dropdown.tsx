import { IoMdArrowDropdown } from 'react-icons/io'
import { RxCross2 } from 'react-icons/rx'

export default function Dropdown({
  dropdownName,
  dropdownOptions,
  allowMulti,
  currSelected,
  setSelected,
}: {
  dropdownName: string
  dropdownOptions: string[]
  allowMulti: boolean
  currSelected: string[]
  setSelected: any
}) {
  function handleSelect(option: string) {
    if (currSelected.includes(option)) {
      setSelected(
        dropdownName.toLowerCase(),
        currSelected.filter((selected) => selected !== option)
      )
    } else if (allowMulti) {
      setSelected(dropdownName.toLowerCase(), [...currSelected, option])
    } else {
      setSelected(dropdownName.toLowerCase(), [option])
    }
  }

  const dropdownOptionsList = dropdownOptions.map((option) => {
    if (option !== '') {
      return (
        <li
          key={`${dropdownName}-${option}`}
          className={currSelected.includes(option) ? 'selected' : ''}
          onClick={() => handleSelect(option)}
        >
          <span>{option}</span>
          {currSelected.includes(option) && <RxCross2 />}
        </li>
      )
    }
  })

  return (
    <div className="dropdown" tabIndex={0}>
      <button className={`dropdown-btn nobg ${currSelected.length > 0 ? 'main' : ''}`}>
        <span>{dropdownName}</span>
        <IoMdArrowDropdown className="dropdown-btn-arrow" />
      </button>
      <ul className="dropdown-content" tabIndex={-1}>
        {dropdownOptionsList}
      </ul>
    </div>
  )
}
