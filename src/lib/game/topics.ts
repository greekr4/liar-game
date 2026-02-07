/** 같은 카테고리에서 비슷하지만 다른 두 단어 쌍 */
export interface TopicPair {
  category: string;
  wordA: string;
  wordB: string;
}

export const topicPairs: TopicPair[] = [
  // 과일
  { category: "과일", wordA: "사과", wordB: "배" },
  { category: "과일", wordA: "귤", wordB: "오렌지" },
  { category: "과일", wordA: "수박", wordB: "멜론" },
  { category: "과일", wordA: "포도", wordB: "블루베리" },
  { category: "과일", wordA: "바나나", wordB: "망고" },
  { category: "과일", wordA: "딸기", wordB: "체리" },
  // 동물
  { category: "동물", wordA: "고양이", wordB: "강아지" },
  { category: "동물", wordA: "호랑이", wordB: "사자" },
  { category: "동물", wordA: "토끼", wordB: "다람쥐" },
  { category: "동물", wordA: "독수리", wordB: "매" },
  { category: "동물", wordA: "돌고래", wordB: "고래" },
  { category: "동물", wordA: "펭귄", wordB: "오리" },
  // 음식
  { category: "음식", wordA: "김치찌개", wordB: "된장찌개" },
  { category: "음식", wordA: "짜장면", wordB: "짬뽕" },
  { category: "음식", wordA: "치킨", wordB: "피자" },
  { category: "음식", wordA: "떡볶이", wordB: "라볶이" },
  { category: "음식", wordA: "라면", wordB: "우동" },
  { category: "음식", wordA: "햄버거", wordB: "샌드위치" },
  { category: "음식", wordA: "초밥", wordB: "회" },
  // 스포츠
  { category: "스포츠", wordA: "축구", wordB: "야구" },
  { category: "스포츠", wordA: "농구", wordB: "배구" },
  { category: "스포츠", wordA: "테니스", wordB: "배드민턴" },
  { category: "스포츠", wordA: "수영", wordB: "다이빙" },
  { category: "스포츠", wordA: "스키", wordB: "스노보드" },
  // 음료
  { category: "음료", wordA: "콜라", wordB: "사이다" },
  { category: "음료", wordA: "커피", wordB: "녹차" },
  { category: "음료", wordA: "우유", wordB: "두유" },
  { category: "음료", wordA: "맥주", wordB: "소주" },
  // 장소
  { category: "장소", wordA: "학교", wordB: "학원" },
  { category: "장소", wordA: "바다", wordB: "수영장" },
  { category: "장소", wordA: "카페", wordB: "식당" },
  { category: "장소", wordA: "영화관", wordB: "놀이공원" },
  // 직업
  { category: "직업", wordA: "의사", wordB: "간호사" },
  { category: "직업", wordA: "경찰", wordB: "소방관" },
  { category: "직업", wordA: "선생님", wordB: "교수" },
  { category: "직업", wordA: "요리사", wordB: "제빵사" },
  // 기타
  { category: "탈것", wordA: "버스", wordB: "지하철" },
  { category: "탈것", wordA: "비행기", wordB: "기차" },
  { category: "계절", wordA: "봄", wordB: "가을" },
  { category: "계절", wordA: "여름", wordB: "겨울" },
];

export function getRandomPair(): TopicPair {
  return topicPairs[Math.floor(Math.random() * topicPairs.length)];
}
