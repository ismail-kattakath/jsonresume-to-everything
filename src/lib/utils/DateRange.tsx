interface DateRangeProps {
  startYear?: string
  endYear?: string
  id?: string
  showOnlyEndDate?: boolean
}

const DateRange = ({ startYear, endYear, id, showOnlyEndDate = false }: DateRangeProps) => {
  // Helper function to parse date string and create Date object in local time
  const parseDate = (dateString: string | undefined): Date | null => {
    if (!dateString) return null
    const parts = dateString.split('-').map(Number)
    const year = parts[0]
    const month = parts[1]
    const day = parts[2] || 1 // Default to 1st if day is missing

    // Validate that we have at least year and month
    if (year === undefined || month === undefined) return null

    return new Date(year, month - 1, day) // month is 0-indexed
  }

  // If showOnlyEndDate is true (for education), only show graduation date
  if (showOnlyEndDate && endYear) {
    const end = parseDate(endYear)
    if (end && !isNaN(end.getTime())) {
      return (
        <p id={id} className="content whitespace-nowrap">
          {end.toLocaleString('default', { month: 'short' })}, {end.getFullYear()}
        </p>
      )
    }
    return <p id={id} className="content"></p>
  }

  // Original behavior for work experience (show date range)
  if (!startYear) {
    return <p id={id} className="content"></p>
  }

  const start = parseDate(startYear)
  const end = parseDate(endYear)

  if (!start || isNaN(start.getTime())) {
    return <p id={id} className="content"></p>
  }

  return (
    <p id={id} className="content whitespace-nowrap">
      {start.toLocaleString('default', { month: 'short' })}, {start.getFullYear()} -{' '}
      {end && !isNaN(end.getTime())
        ? end.toLocaleString('default', { month: 'short' }) + ', ' + end.getFullYear()
        : 'Present'}
    </p>
  )
}

export default DateRange
