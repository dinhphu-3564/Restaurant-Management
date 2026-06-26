import { Star } from "lucide-react";

function RatingStars({ rating = 0, size = 16 }) {
  const safeRating = Math.max(0, Math.min(5, Number(rating || 0)));

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = safeRating >= starValue;

        return (
          <Star
            key={index}
            size={size}
            className={
              isFilled ? "text-[#d6a84f] fill-[#d6a84f]" : "text-gray-300"
            }
          />
        );
      })}
    </div>
  );
}

export default RatingStars;
