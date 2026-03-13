// src/components/CarouselBackground.tsx
const rows = [
  {
    photos: Array.from({ length: 10 }, (_, i) => `/photos/photo${i + 1}.jpg`),
    direction: "left",
  },
  {
    photos: Array.from({ length: 10 }, (_, i) => `/photos/photo${i + 11}.jpg`),
    direction: "right",
  },
  {
    photos: Array.from({ length: 10 }, (_, i) => `/photos/photo${i + 21}.jpg`),
    direction: "left",
  },
];

export default function CarouselBackground() {
  return (
    <div className="absolute inset-0 flex flex-col h-full gap-2 overflow-hidden">
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="overflow-hidden flex items-center min-h-0"
        >
          <div
            className={`flex gap-2 ${row.direction === "left" ? "animate-scroll-left" : "animate-scroll-right"}`}
          >
            {/* Duplicate for seamless loop */}
            {[...row.photos, ...row.photos].map((photo, i) => (
              <img
                key={i}
                src={photo}
                alt=""
                className="w-48 object-cover rounded-sm shrink-0"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
