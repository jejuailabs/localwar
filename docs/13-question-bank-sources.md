# 지역 문제 은행과 출처 검수 기록

검수일: 2026-10-11. 추가 문항은 `lib/question-bank.ts`의 `EXTRA_QUESTIONS`에 저장한다. 이 문서의 첫 3개 지역은 기존 48문항과 합쳐 144문항이다. 이후 경주·전주·강릉 144문항을 추가해 현재 전체는 288문항이며, 신규 사실 원장과 근거는 docs/15~17 문서를 참고한다. 매일 출제는 이 저장 데이터로 처리하며 실시간 AI 호출을 요구하지 않는다.

## 추가 문항의 범위

| 지역   | 역사·문화 | 인물·이야기 | 특산물·음식 | 관광·지역상식 | 합계 |
| ------ | --------: | ----------: | ----------: | ------------: | ---: |
| 서귀포 |         8 |           8 |           8 |             8 |   32 |
| 충주   |         8 |           8 |           8 |             8 |   32 |
| 종로   |         8 |           8 |           8 |             8 |   32 |
| 합계   |        24 |          24 |          24 |            24 |   96 |

각 지역의 분야×난이도 16칸마다 새 문항 2개를 추가했다. 기존 문항을 포함하면 각 칸 3개, 난이도별 전국 풀은 36개이다. 새 문항은 각 난이도에 서로 다른 사실 ID 24개를 제공한다. 같은 장소·인물을 다시 다루더라도 직업, 시기, 작품, 구조 등 서로 다른 사실을 묻는다.

## 출처 확인 방법

지자체·관광 공공기관·국립박물관·국가유산청·유네스코·국사편찬위원회·한국학중앙연구원·한식진흥원이 직접 발행한 상세 자료를 검색 및 본문 열람으로 확인했다. 검색 결과로 본문이 확인되는 페이지도 포함한다. 일부 관광 사이트는 동적 페이지라 도구에서 직접 열면 메뉴만 반환하지만 공식 검색 색인에서 같은 상세 URL의 본문을 확인할 수 있었다.

기관 발행 설명·학술 백과의 서술은 원사료 자체와 구분한다. 불명확한 설, 추정 건립 연대, 임경업의 출생지에 관한 이설 등은 정답 판별 근거로 삼지 않았다. 유적 방문시간·입장료·현재 휴관 여부·현직 인물·상품 가격 등 바뀌기 쉬운 정보는 출제하지 않았다.

## 문항별 출처 목록

아래 ID는 추가 문항 ID의 지역·분야·난이도·번호이다. 각 문항에는 정답 해설과 함께 같은 상세 URL이 들어간다.

1. [제주관광공사 비짓제주 자료 1](https://www.visitjeju.net/kr/detail/view?contentsid=CONT_000000000500351) — jeju-seogwipo-history-1-bank-1, jeju-seogwipo-history-2-bank-1, jeju-seogwipo-history-3-bank-1
2. [제주관광공사 비짓제주 자료 2](https://www.visitjeju.net/kr/detail/view?contentsid=CONT_000000000500417) — jeju-seogwipo-history-1-bank-2, jeju-seogwipo-history-3-bank-2
3. [제주관광공사 비짓제주 자료 3](https://www.visitjeju.net/kr/detail/view?contentsid=CNTS_000000000018467) — jeju-seogwipo-history-2-bank-2, jeju-seogwipo-people-1-bank-2, jeju-seogwipo-people-2-bank-2, jeju-seogwipo-people-3-bank-2
4. [유네스코 세계유산센터 자료 4](https://whc.unesco.org/en/list/1264/) — jeju-seogwipo-history-4-bank-1
5. [제주관광공사 비짓제주 자료 5](https://www.visitjeju.net/kr/detail/view?contentsid=CNTS_200000000014386) — jeju-seogwipo-history-4-bank-2
6. [제주관광공사 비짓제주 자료 6](https://www.visitjeju.net/kr/detail/view?contentsid=CONT_000000000500509) — jeju-seogwipo-people-1-bank-1, jeju-seogwipo-people-2-bank-1, jeju-seogwipo-people-3-bank-1, jeju-seogwipo-people-4-bank-1
7. [제주관광공사 비짓제주 자료 7](https://www.visitjeju.net/kr/detail/view?contentsid=CNTS_000000000021487) — jeju-seogwipo-people-4-bank-2
8. [제주관광공사 비짓제주 자료 8](https://www.visitjeju.net/pdf/Official%20Jeju%20Tourism%20Guidebook_kr.pdf) — jeju-seogwipo-food-1-bank-1, jeju-seogwipo-food-1-bank-2, jeju-seogwipo-food-2-bank-1, jeju-seogwipo-food-2-bank-2, jeju-seogwipo-food-3-bank-1, jeju-seogwipo-food-3-bank-2, jeju-seogwipo-food-4-bank-1, jeju-seogwipo-food-4-bank-2, jeju-seogwipo-travel-1-bank-2, jeju-seogwipo-travel-4-bank-2
9. [제주관광공사 비짓제주 자료 9](https://www.visitjeju.net/kr/detail/view?contentsid=CONT_000000000500531) — jeju-seogwipo-travel-1-bank-1
10. [제주관광공사 비짓제주 자료 10](https://www.visitjeju.net/kr/detail/view?contentsid=CONT_000000000500171) — jeju-seogwipo-travel-2-bank-1
11. [제주관광공사 비짓제주 자료 11](https://www.visitjeju.net/kr/detail/view?contentsid=CONT_000000000500384) — jeju-seogwipo-travel-2-bank-2, jeju-seogwipo-travel-3-bank-1
12. [제주관광공사 비짓제주 자료 12](https://www.visitjeju.net/kr/detail/view?contentsid=CONT_000000000500471) — jeju-seogwipo-travel-3-bank-2
13. [제주관광공사 비짓제주 자료 13](https://www.visitjeju.net/kr/detail/view?contentsid=CNTS_000000000020476) — jeju-seogwipo-travel-4-bank-1
14. [국가유산청 국가유산포털 자료 14](https://heritage.go.kr/heri/cul/culSelectDetail.do?ccbaAsno=0003170000000&ccbaCpno=1333303170000&ccbaCtcd=33&ccbaKdcd=13&pageNo=1_1_1_0) — chungbuk-chungju-history-1-bank-1, chungbuk-chungju-history-3-bank-2
15. [국사편찬위원회 우리역사넷 자료 15](https://contents.history.go.kr/mobile/kc/view.do?code=kc_age_10&levelId=kc_r100500) — chungbuk-chungju-history-1-bank-2, chungbuk-chungju-history-3-bank-1, chungbuk-chungju-history-4-bank-2
16. [국가유산청 국가유산포털 자료 16](https://www.heritage.go.kr/heri/cul/culSelectDetail.do?ccbaAsno=0000060000000&ccbaCpno=1113300060000&ccbaCtcd=33&ccbaKdcd=11&ccbaLcto=00&culPageNo=1&header=region&pageNo=1_1_3_1&s_ctcd=00&s_kdcd=00&sngl=Y) — chungbuk-chungju-history-2-bank-1
17. [대한민국 정책브리핑 국가유산청 발표 자료 17](https://www.korea.kr/news/policyNewsView.do?newsId=148660377) — chungbuk-chungju-history-2-bank-2
18. [한국관광공사 대한민국 구석구석 자료 18](https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=f61f40ea-6d56-44ac-ba93-10420ad4bfec) — chungbuk-chungju-history-4-bank-1
19. [한국학중앙연구원 한국민족문화대백과사전 자료 19](https://encykorea.aks.ac.kr/Article/E0009395) — chungbuk-chungju-people-1-bank-1, chungbuk-chungju-people-3-bank-1
20. [한국학중앙연구원 한국민족문화대백과사전 자료 20](https://encykorea.aks.ac.kr/Article/E0047365) — chungbuk-chungju-people-1-bank-2
21. [한국학중앙연구원 한국민족문화대백과사전 자료 21](https://encykorea.aks.ac.kr/Article/E0039864) — chungbuk-chungju-people-2-bank-1, chungbuk-chungju-people-4-bank-2
22. [한국학중앙연구원 한국민족문화대백과사전 자료 22](https://encykorea.aks.ac.kr/Article/E0003051) — chungbuk-chungju-people-2-bank-2
23. [한국학중앙연구원 한국민족문화대백과사전 자료 23](https://encykorea.aks.ac.kr/Article/E0017563) — chungbuk-chungju-people-3-bank-2
24. [한국학중앙연구원 한국민족문화대백과사전 자료 24](https://encykorea.aks.ac.kr/Article/E0022744) — chungbuk-chungju-people-4-bank-1
25. [한국관광공사 대한민국 구석구석 자료 25](https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=37dc4d16-b15f-4c42-b584-125338211eb9) — chungbuk-chungju-food-1-bank-1, chungbuk-chungju-travel-2-bank-1, chungbuk-chungju-travel-2-bank-2
26. [한국관광공사 대한민국 구석구석 자료 26](https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=d5f2086f-d006-4fb6-b49b-a2ac3ed0f5a4) — chungbuk-chungju-food-1-bank-2, chungbuk-chungju-food-2-bank-1, chungbuk-chungju-food-2-bank-2, chungbuk-chungju-food-3-bank-1, chungbuk-chungju-food-3-bank-2, chungbuk-chungju-food-4-bank-1, chungbuk-chungju-food-4-bank-2
27. [한국관광공사 대한민국 구석구석 자료 27](https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=c718f719-1492-45fb-9c34-f2507b15c5c6) — chungbuk-chungju-travel-1-bank-1
28. [한국관광공사 대한민국 구석구석 자료 28](https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=3932cff7-3d3e-4db0-a813-52ca9154baea) — chungbuk-chungju-travel-1-bank-2
29. [한국관광공사 대한민국 구석구석 자료 29](https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=e1c12b1a-9297-4522-88eb-5cdc7b45796a) — chungbuk-chungju-travel-3-bank-1
30. [한국관광공사 대한민국 구석구석 자료 30](https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=eb6d9b4c-7277-42c7-b11b-04b25971efe0) — chungbuk-chungju-travel-3-bank-2
31. [한국관광공사 대한민국 구석구석 자료 31](https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=72a2ed51-2b39-4761-8522-e67559a3ed9a) — chungbuk-chungju-travel-4-bank-1, chungbuk-chungju-travel-4-bank-2
32. [종로구 공식 관광 안내 자료 32](https://jongno.go.kr/chTown.do?menuId=400476&menuNo=400476) — seoul-jongno-history-1-bank-1
33. [국사편찬위원회 우리역사넷 자료 33](https://contents.history.go.kr/mobile/kc/view.do?levelId=kc_r400400) — seoul-jongno-history-1-bank-2
34. [국가유산청 궁능유적본부 자료 34](https://royal.khs.go.kr/ROYAL/contents/R103010000.do) — seoul-jongno-history-2-bank-1, seoul-jongno-history-4-bank-2, seoul-jongno-travel-3-bank-1
35. [국가유산청 궁능유적본부 자료 35](https://royal.khs.go.kr/ROYAL/contents/R102010000.do) — seoul-jongno-history-2-bank-2
36. [국가유산청 궁능유적본부 자료 36](https://royal.khs.go.kr/ROYAL/contents/R403000000.do?id=20080501122000000045&schM=view) — seoul-jongno-history-3-bank-1
37. [국가유산청 궁능유적본부 자료 37](https://royal.khs.go.kr/ROYAL/contents/R105030000.do) — seoul-jongno-history-3-bank-2
38. [국가유산청 궁능유적본부 자료 38](https://royal.khs.go.kr/ROYAL/contents/R101010000.do?menuId=03_01_01) — seoul-jongno-history-4-bank-1
39. [한국학중앙연구원 한국민족문화대백과사전 자료 39](https://encykorea.aks.ac.kr/Article/E0074265) — seoul-jongno-people-1-bank-1, seoul-jongno-people-2-bank-2
40. [국립중앙박물관 자료 40](https://www.museum.go.kr/MUSEUM/contents/M0501000000.do?relicRecommendId=962060&schM=view) — seoul-jongno-people-1-bank-2, seoul-jongno-travel-3-bank-2
41. [국사편찬위원회 우리역사넷 자료 41](https://contents.history.go.kr/mobile/kc/view.do?levelId=kc_r400200) — seoul-jongno-people-2-bank-1
42. [서울시 문화포털 자료 42](https://culture.seoul.go.kr/culture/culture/cultureImage/view.do?menuNo=200111&pageIndex=686&searchCate=&youtubeId=9775) — seoul-jongno-people-3-bank-1
43. [한국학중앙연구원 한국민족문화대백과사전 자료 43](https://encykorea.aks.ac.kr/Article/E0004097) — seoul-jongno-people-3-bank-2
44. [국립대구박물관 자료 44](https://daegu.museum.go.kr/thumbnail/BBSMSTR_000000000303/BBS_20230410120109546Es11.pdf) — seoul-jongno-people-4-bank-1
45. [서울시 공식 관광 가이드 자료 45](https://english.seoul.go.kr/wp-content/uploads/2023/03/Seoul_Tourist_Guide_EN.pdf) — seoul-jongno-people-4-bank-2
46. [서울관광재단 비짓서울 자료 46](https://korean.visitseoul.net/editorspicks/%EB%8F%84%EC%8B%AC%EC%86%8D%EC%97%90-%EC%88%A8%EC%96%B4%EC%9E%88%EB%8A%94-%EC%9A%B0%EB%A6%AC%EC%9D%98-%EC%A0%84%ED%86%B5-%EC%84%9C%EC%9A%B8-%EC%A0%84%ED%86%B5%EC%8B%9C%EC%9E%A5-%ED%88%AC%EC%96%B4/KON032649) — seoul-jongno-food-1-bank-1, seoul-jongno-food-1-bank-2, seoul-jongno-food-2-bank-2
47. [서울관광재단 비짓서울 자료 47](https://korean.visitseoul.net/palace/%ED%86%B5%EC%9D%B8%EC%8B%9C%EC%9E%A5-%EA%B8%B0%EB%A6%84%EB%96%A1%EB%B3%B6%EC%9D%B4/KOP019415) — seoul-jongno-food-2-bank-1
48. [서울관광재단 비짓서울 자료 48](https://korean.visitseoul.net/palace/%EB%96%A1%EB%B0%95%EB%AC%BC%EA%B4%80/KOP002037) — seoul-jongno-food-3-bank-1
49. [서울관광재단 비짓서울 자료 49](https://korean.visitseoul.net/hallyu/%EB%82%B4-%EC%86%90%EC%9C%BC%EB%A1%9C-%EB%A7%8C%EB%93%9C%EB%8A%94-%ED%95%9C%EA%B5%AD-%EC%A0%84%ED%86%B5-%EC%9D%8C%EC%8B%9D/KON000628) — seoul-jongno-food-3-bank-2
50. [한식진흥원 자료 50](https://www.hansik.or.kr/magazines/list/magazineDetail/39/3098?menuSn=429) — seoul-jongno-food-4-bank-1
51. [한식진흥원 자료 51](https://www.hansik.or.kr/magazines/list/magazineDetail/101/2372?menuSn=429) — seoul-jongno-food-4-bank-2
52. [서울관광재단 비짓서울 자료 52](https://korean.visitseoul.net/entertainment/%EB%8C%80%ED%95%99%EB%A1%9C_/2107) — seoul-jongno-travel-1-bank-1
53. [국가유산청 궁능유적본부 자료 53](https://royal.khs.go.kr/ROYAL/contents/R311050000.do) — seoul-jongno-travel-1-bank-2
54. [서울시 서울한옥포털 자료 54](https://hanok.seoul.go.kr/front/kor/town/town01.do) — seoul-jongno-travel-2-bank-1
55. [국가유산청 궁능유적본부 자료 55](https://royal.khs.go.kr/ROYAL/contents/R402000000.do?id=20241125093054576568&schM=view) — seoul-jongno-travel-2-bank-2
56. [국가유산청 궁능유적본부 자료 56](https://royal.khs.go.kr/ROYAL/contents/R311060000.do) — seoul-jongno-travel-4-bank-1, seoul-jongno-travel-4-bank-2

## 편집·운영의 한계

- 난이도 1~4는 소재의 익숙함, 세부 지식과 선택지 구별 정도를 기준으로 편집자가 배정한 초기값이다. 정답률과 응답시간을 수집해 실제 난이도를 보정해야 한다. 공식 출처가 난이도까지 보증하지는 않는다.
- 각 문항은 서로 다른 보기 4개와 정답 1개를 갖는다. `alternatives`는 추가로 사용할 수 있는 오답만 저장한다. 방향처럼 네 값이 전체인 문항에는 추가 오답을 억지로 만들지 않았다.
- 질문의 사실과 정답은 고정하며, 서버는 미리 작성한 오답 후보와 보기 순서를 변경한다. 새 정답을 임의로 생성하거나 출처의 수치·역사를 바꾸지 않는다.
- `factId`는 사실을 묶는 비공개 출제 메타데이터다. 동일 사실의 표현 변형을 추가할 때 같은 ID를 사용해야 하며, 정답·해설·출처·추가 오답과 함께 문제 응답에서 숨겨야 한다.
- 전국 데일리 30문제는 현재 3개 지역에 한정된 문제 은행에서 추출된다. 전국 모든 시·군·구의 소재를 고르게 커버하는 상태는 아니다.
- 난이도별 36개에서 30개를 내므로 날짜가 달라도 대부분의 사실을 다시 만날 수 있다. 보기 변형만으로 무한한 새 문항이 생기지는 않는다. 장기간 반복 감소를 위해 검수한 문제 은행을 계속 확장해야 한다.
- 지역 음식 문항에는 그 지역에서 접하는 향토 음식뿐 아니라 종로의 시장·떡박물관·궁중 음식 문화와 연결되는 전통 음식 지식도 포함한다. 해당 지역에서만 먹거나 발명됐다고 주장하지 않는다.
- 제주의 전통 식재료 문항은 공식 가이드북의 전통 음식 설명을 기준으로 한다. 현대 판매점마다 재료가 다른 문제는 질문에서 전통 방식 또는 해당 가이드 설명임을 명시했다.
- 전쟁·강제동원 유적은 역사적 사실 확인 문제로 다뤘으며 폭력이나 피해 자체를 희화화하지 않았다.

## 구조 검증

추가 문항 96개, 48개 지역×분야×난이도 칸에 각 2개, 난이도별 24개, 새 사실 ID 96개를 확인했다. 모든 기본 보기 4개는 서로 다르며 정답 인덱스는 유효하다. 추가 오답은 기본 보기·정답과 중복되지 않는다. 최종 통합 뒤 기존 문항의 사실 중복을 묶고 30개 추출 가능 여부를 출제 엔진 테스트에서 확인한다.
