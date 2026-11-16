import { useId, useState } from 'react';
import './StarRating.css';

export default function StarRating({ value, onChange, name }) {
  const generatedId = useId();
  const groupName = name || `rating-${generatedId}`;
  const [hover, setHover] = useState(0);
  const activeValue = hover || value;


  return (
    <fieldset className="star-rating">
      <legend>별점</legend>
      <div className="star-rating__choices" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((score) => (
          <label className="star-rating__choice" key={score} onMouseEnter={() => setHover(score)}>
            <input type="radio" name={groupName} value={score} checked={value === score} onChange={() => onChange(score)} aria-label={`${score}점`} />
            <span className={score <= activeValue ? 'star-rating__star is-selected' : 'star-rating__star'} aria-hidden="true">★</span>            
          </label>
        ))}
      </div>
    </fieldset>
  );
}
