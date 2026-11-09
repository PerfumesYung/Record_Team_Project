import { useId } from 'react';
import './StarRating.css';

export default function StarRating({ value, onChange, name }) {
  const generatedId = useId();
  const groupName = name || `rating-${generatedId}`;

  return (
    <fieldset className="star-rating">
      <legend>별점</legend>
      <div className="star-rating__choices">
        {[1, 2, 3, 4, 5].map((score) => (
          <label className="star-rating__choice" key={score}>
            <input type="radio" name={groupName} value={score} checked={value === score} onChange={() => onChange(score)} aria-label={`${score}점`} />
            <span className={score <= value ? 'star-rating__star is-selected' : 'star-rating__star'} aria-hidden="true">★</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
