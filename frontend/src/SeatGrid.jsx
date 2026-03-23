import "./SeatGrid.css";

export default function SeatGrid({ rows, selected, occupied, onToggle }) {
  if (!rows) return null;

  const rowKeys = Object.keys(rows).sort();

  // Find highest seat number so grid lines up
  let maxSeat = 0;
  rowKeys.forEach((r) => {
    rows[r].forEach((n) => {
      if (n > maxSeat) maxSeat = n;
    });
  });

  return (
    <div className="seat-grid">
      {rowKeys.map((row) => {
        const seatSet = new Set(rows[row]);

        return (
          <div key={row} className="seat-row">
            <div className="row-label">{row}</div>

            <div
              className="row-cells"
              style={{ gridTemplateColumns: `repeat(${maxSeat}, 40px)` }}
            >
              {Array.from({ length: maxSeat }, (_, i) => {
                const seatNumber = i + 1;
                const exists = seatSet.has(seatNumber);

                if (!exists) {
                  return <div key={seatNumber} className="seat-dot" />;
                }

                const key = `${row}-${seatNumber}`;
                const isSelected = selected.has(key);
                const isOccupied = occupied?.has(key);

                return (
                  <button
                    key={seatNumber}
                    className={`seat ${isOccupied ? "occupied" : isSelected ? "selected" : "available"}`}
                    onClick={() => !isOccupied && onToggle(key)}
                    disabled={isOccupied}
                    
                  >
                   {row}-{seatNumber}
                
                    
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}