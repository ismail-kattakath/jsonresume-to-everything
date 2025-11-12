const DateRange = ({ startYear, endYear, id, showOnlyEndDate = false }) => {
    // Helper function to parse date string and create Date object in local time
    const parseDate = (dateString) => {
        if (!dateString) return null;
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day); // month is 0-indexed
    };

    // If showOnlyEndDate is true (for education), only show graduation date
    if (showOnlyEndDate && endYear) {
        const end = parseDate(endYear);
        if (end && end != "Invalid Date") {
            return (
                <p id={id} className="sub-content whitespace-nowrap">
                    {end.toLocaleString('default', { month: 'short' })}, {end.getFullYear()}
                </p>
            );
        }
        return <p id={id} className="sub-content"></p>;
    }

    // Original behavior for work experience (show date range)
    if (!startYear) {
        return <p id={id} className="sub-content"></p>;
    }

    const start = parseDate(startYear);
    const end = parseDate(endYear);
    return (
        <p id={id} className="sub-content whitespace-nowrap">
            {start.toLocaleString('default', { month: 'short' })}, {start.getFullYear()} - {end && end != "Invalid Date" ? end.toLocaleString('default', { month: 'short' }) + ', ' + end.getFullYear() : 'Present'}
        </p>
    );
};

export default DateRange;
