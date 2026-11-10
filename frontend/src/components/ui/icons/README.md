# 공용 아이콘과 별점

별도의 아이콘 패키지 없이 사용할 수 있는 컴포넌트입니다. 프로필과 장바구니는 SVG이며 별점은 별 문자와 CSS를 사용합니다.

```jsx
import { useState } from 'react';
import ProfileIcon from './components/ui/icons/ProfileIcon';
import CartIcon from './components/ui/icons/CartIcon';
import SearchIcon from './components/ui/icons/SearchIcon';
import StarRating from './components/ui/icons/StarRating';

function Example() {
  const [rating, setRating] = useState(5);
  return (
    <>
      <button type="button"><SearchIcon /> 검색</button>
      <a href="/mypage"><ProfileIcon /> 내 계정</a>
      <a href="/cart"><CartIcon /> 장바구니</a>
      <StarRating value={rating} onChange={setRating} />
      <p>선택한 별점: {rating}점</p>
    </>
  );
}
```

위 import 경로는 `src` 바로 아래 파일을 기준으로 한 예시입니다. 파일 위치에 따라 경로를 바꿔 주세요. 링크 주소는 실제 라우팅이 정해지면 맞춰 주세요. `size`를 전달하면 프로필·장바구니·검색 아이콘 크기를 바꿀 수 있습니다. 글자 없이 아이콘만 표시하는 버튼이나 링크에는 `aria-label`로 이름을 넣어 주세요.

별점은 1~5점 정수입니다. `value`는 현재 선택값, `onChange`는 선택값을 바꾸는 함수입니다. 폼 전송 이름을 지정하려면 `name="rating"`을 추가하세요. 별점 선택은 화면용이며 실제 저장과 API 연결은 리뷰 담당자가 구현합니다. 위 예시는 기본값 5점을 선택하며 필요하면 초기값을 변경할 수 있습니다.
