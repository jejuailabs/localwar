# 전주 파일럿 문항 출처 원장

확인일: 2026-10-11. 지도에 등록된 전주시 전체 코드 `jeonbuk-jeonju`를 사용한다. 완산구의 한옥마을뿐 아니라 덕진구의 덕진공원·팔복예술공장·전주수목원도 이 시의 범위에 포함된다.

`lib/question-bank-jeonju.ts`의 48문항은 역사·인물·음식·여행 각 12개, 각 카테고리의 단계 1~4마다 3개이다. `data/region-facts/jeonju.json`의 48개 factId가 문항과 일대일로 연결된다. 사진이나 기사 본문을 전재하지 않고 사실을 요약해 재서술했다.

## 편집 기준

- 1단계: 대표 대상·재료·기본 기능을 구분한다.
- 2단계: 지역 판본, 기관 관할, 인물·작품 연결, 음식 구성과 장소의 변화를 구분한다.
- 3단계: 재위기·보존 주체·조리 용어·건축 양식 등 더 구체적인 지역 지식을 구분한다.
- 4단계: 명명과 중건의 구분, 제조 공정의 순서, 문화 형성의 설명, 문헌과 성역의 연결 등 세부 지식과 맥락을 요구한다.

단계는 편집상 분류이며 실제 학생 또는 일반 참가자의 정답률·응답시간으로 보정한 난이도가 아니다. 파일럿 사용 후 문항별 정답률과 시간으로 재검토한다. 단계 간 경험적 차이를 점검한 뒤 난이도를 보정한다.

오목대의 대풍가·정몽주 이야기는 전주시가 소개하는 전승임을 질문과 해설에 명시했다. 음식은 포괄적인 대표 음식 질문 대신 조리법·재료·공식 안내의 구체적인 특징을 물어 단일 정답을 확보했다. 피순대에 당면이 전혀 없다는 일반화는 하지 않았다. 운영시간·요금·영업 여부 등 쉽게 바뀌는 정보는 문항에서 제외했다.

## 출처별 문항

아래는 모두 전주시가 운영하는 관광·한옥마을·시정소식지 또는 시 공식 역사/보도자료다. `reviewed`는 공식 설명과 문항·해설의 일치를 검토했다는 뜻이며 외부 전문가나 실제 이용자 난이도 검증을 의미하지 않는다.

### 전주시 전주역사

[공식 출처](https://www.jeonju.go.kr/index.9is?contentUid=ff8080818990c349018b041a9fe53a7c)

- `jeonbuk-jeonju-history-2-1` → `jeonju-wanpan-printing`
- `jeonbuk-jeonju-history-2-2` → `jeonju-jeolla-name-origin`
- `jeonbuk-jeonju-people-1-2` → `jeonju-gyeonhwon-founder`
- `jeonbuk-jeonju-people-1-3` → `jeonju-taejo-dynasty`

### 전주시 한옥마을 경기전 안내

[공식 출처](https://hanok.jeonju.go.kr/contents/place)

- `jeonbuk-jeonju-history-1-1` → `jeonju-gyeonggi-portrait-purpose`
- `jeonbuk-jeonju-history-3-1` → `jeonju-gyeonggi-foundation-reign`
- `jeonbuk-jeonju-history-4-1` → `jeonju-gyeonggi-renaming`
- `jeonbuk-jeonju-history-4-2` → `jeonju-gyeonggi-rebuilt-after-jeongyu`

### 전주시 한옥마을 골목길 및 향교 안내

[공식 출처](https://tour.jeonju.go.kr/index.jeonju?menuCd=DOM_000000112002009000)

- `jeonbuk-jeonju-history-1-2` → `jeonju-hyanggyo-education`
- `jeonbuk-jeonju-travel-2-3` → `jeonju-hyanggyo-ginkgo`

### 전주시 풍남문 해설

[공식 출처](https://www.jeonju.go.kr/qrcode/112.jsp?landingurl=112)

- `jeonbuk-jeonju-history-1-3` → `jeonju-pungnam-south-gate`
- `jeonbuk-jeonju-history-3-3` → `jeonju-pungnam-reconstruction-reign`

### 전주시 전라감영 안내

[공식 출처](https://tour.jeonju.go.kr/board/view.jeonju?boardId=BBS_0000003&dataSid=10114&menuCd=DOM_000000101006001000&paging=ok&startPage=1)

- `jeonbuk-jeonju-history-2-3` → `jeonju-gamyeong-jeju-jurisdiction`
- `jeonbuk-jeonju-history-4-3` → `jeonju-gamyeong-seonhwadang-loss`

### 전주시 실록 보존 탐방 보도자료

[공식 출처](https://www.jeonju.go.kr/planweb/board/view.9is?boardUid=ff8080818b5bc5cf018ba8ca7216641f&contentUid=ff8080818990c349018b041a87fe3960&dataUid=476bee899116482c8c628e89a053657b&page=3231)

- `jeonbuk-jeonju-history-3-2` → `jeonju-sago-surviving-records`

### 전주시 최명희문학관 안내

[공식 출처](https://tour.jeonju.go.kr/board/view.jeonju?boardId=BBS_0000003&contentsSid=1&dataSid=9797&paging=ok&startPage=1)

- `jeonbuk-jeonju-people-1-1` → `jeonju-choi-novelist`
- `jeonbuk-jeonju-people-2-1` → `jeonju-choi-honbul`
- `jeonbuk-jeonju-people-4-3` → `jeonju-choi-language-fingerprint`

### 전주시 오목대·이목대 안내

[공식 출처](https://tour.jeonju.go.kr/board/view.jeonju?boardId=BBS_0000003&contentsSid=1&dataSid=9742&paging=ok&startPage=1)

- `jeonbuk-jeonju-people-2-2` → `jeonju-imok-ian-sa`
- `jeonbuk-jeonju-people-2-3` → `jeonju-jeongmongju-mangyeongdae`
- `jeonbuk-jeonju-people-3-1` → `jeonju-gojong-monument-handwriting`
- `jeonbuk-jeonju-people-4-1` → `jeonju-ian-sa-yongbieocheonga`
- `jeonbuk-jeonju-people-4-2` → `jeonju-taejo-daepungga`

### 전주시 문화재지킴이날 보도자료

[공식 출처](https://www.jeonju.go.kr/planweb/board/view.9is?boardUid=ff8080818b5bc5cf018ba8ca7216641f&contentUid=ff8080818990c349018b041a87fe3960&dataUid=9be517a879660820017a320514e57073&page=1231)

- `jeonbuk-jeonju-people-3-3` → `jeonju-ahn-son-preserved-records`

### 전주시 도로명 유래 기린대로

[공식 출처](https://jeonju.go.kr/images/www/rname1_view.pdf)

- `jeonbuk-jeonju-people-3-2` → `jeonju-choidam-hanbyeok`
- `jeonbuk-jeonju-travel-4-1` → `jeonju-hanbyeok-scenic-name`

### 전주시 전주비빔밥 안내

[공식 출처](https://tour.jeonju.go.kr/index.jeonju?menuCd=DOM_000000104003006000)

- `jeonbuk-jeonju-food-1-1` → `jeonju-bibimbap-signature`
- `jeonbuk-jeonju-food-4-3` → `jeonju-bibimbap-rice-broth`

### 전주시 남부시장 안내

[공식 출처](https://tour.jeonju.go.kr/index.jeonju?menuCd=DOM_000000104002001001)

- `jeonbuk-jeonju-food-2-1` → `jeonju-pisundae-blood`
- `jeonbuk-jeonju-food-2-2` → `jeonju-kongnamul-suran`
- `jeonbuk-jeonju-food-3-1` → `jeonju-kongnamul-toryeom`
- `jeonbuk-jeonju-food-4-2` → `jeonju-kongnamul-kim-sharing`

### 전주시 전주가맥축제 안내

[공식 출처](https://tour.jeonju.go.kr/index.jeonju?menuCd=DOM_000000102001017000)

- `jeonbuk-jeonju-food-1-3` → `jeonju-gamaek-abbreviation`

### 전주시 전통주 이야기

[공식 출처](https://tour.jeonju.go.kr/board/view.jeonju?boardId=BBS_0000055&dataSid=14461&menuCd=DOM_000000112011000000&paging=ok&searchType=DATA_TITLE&startPage=1)

- `jeonbuk-jeonju-food-2-3` → `jeonju-moju-base`
- `jeonbuk-jeonju-food-3-2` → `jeonju-leegang-name-ingredients`
- `jeonbuk-jeonju-food-4-1` → `jeonju-leegang-production-order`

### 전주시 시정소식지 전주다움 물짜장

[공식 출처](https://daum.jeonju.go.kr/main/menu?do=view&gc=WEBZINE7&webzine_code=EFCOz7MNoDx6a3b687f&wgroup_code=ZEEZiJR0IOd6a3b5eb8)

- `jeonbuk-jeonju-food-3-3` → `jeonju-muljajang-no-chunjang`

### 전주시 전주한옥마을 안내

[공식 출처](https://tour.jeonju.go.kr/board/view.jeonju?boardId=BBS_0000003&dataSid=16109&menuCd=DOM_000000101006003000&paging=ok&startPage=1)

- `jeonbuk-jeonju-travel-1-1` → `jeonju-hanok-traditional-houses`

### 전주시 덕진공원 연꽃 안내

[공식 출처](https://tour.jeonju.go.kr/board/view.jeonju?boardId=BBS_0000022&dataSid=12282&menuCd=DOM_000000101012000000)

- `jeonbuk-jeonju-travel-1-2` → `jeonju-deokjin-lotus`

### 전주시 청연루·남천교 안내

[공식 출처](https://tour.jeonju.go.kr/board/view.jeonju?boardId=BBS_0000003&dataSid=16086&menuCd=DOM_000000101006003000&paging=ok&startPage=1)

- `jeonbuk-jeonju-travel-1-3` → `jeonju-namcheongyo-river`

### 전주시 자만벽화마을 안내

[공식 출처](https://tour.jeonju.go.kr/board/view.jeonju?boardId=BBS_0000003&dataSid=16022&menuCd=DOM_000000101006003000&paging=ok&startPage=1)

- `jeonbuk-jeonju-travel-2-1` → `jeonju-jaman-wall-art`

### 전주시 팔복예술공장 안내

[공식 출처](https://tour.jeonju.go.kr/index.jeonju?menuCd=DOM_000000112002002000)

- `jeonbuk-jeonju-travel-2-2` → `jeonju-palbok-cassette-factory`

### 전주시 전동성당 안내

[공식 출처](https://tour.jeonju.go.kr/board/view.jeonju?boardId=BBS_0000003&dataSid=9752&menuCd=DOM_000000101006001000&paging=ok&searchType=DATA_TITLE&startPage=1)

- `jeonbuk-jeonju-travel-3-1` → `jeonju-church-romanesque`

### 전주시 풍패지관 야간연회 보도자료

[공식 출처](https://www.jeonju.go.kr/planweb/board/view.9is?boardUid=ff8080818b5bc5cf018ba8ca7216641f&contentUid=ff8080818990c349018b041a87fe3960&dataUid=9be517a8914526ec0191cf78761d7608&page=225)

- `jeonbuk-jeonju-travel-3-2` → `jeonju-pungpaejigwan-guests`

### 전주시 서학동 예술마을 안내

[공식 출처](https://tour.jeonju.go.kr/board/view.jeonju?boardId=BBS_0000003&dataSid=16673&menuCd=DOM_000000101006003000&paging=ok&startPage=1)

- `jeonbuk-jeonju-travel-3-3` → `jeonju-seohak-artist-regeneration`

### 전주시 한국도로공사 전주수목원 안내

[공식 출처](https://tour.jeonju.go.kr/board/view.jeonju?boardId=BBS_0000003&dataSid=9775&menuCd=DOM_000000101006003000&paging=ok&startPage=1)

- `jeonbuk-jeonju-travel-4-2` → `jeonju-arboretum-restoration-research`

### 전주시 전주다움 조경단 소개

[공식 출처](https://daum.jeonju.go.kr/main/menu?do=view&gc=WEBZINE1&webzine_code=5DOH0dqvXY369e81ff0&wgroup_code=eFyCHBuOx5c69e81a82)

- `jeonbuk-jeonju-travel-4-3` → `jeonju-jogyeong-ancestor`

### 전주시 전주 먹방로드 콩나물국밥 안내

[공식 출처](https://tour.jeonju.go.kr/board/view.jeonju?boardId=BBS_0000023&dataSid=16226&menuCd=DOM_000000112001000000&paging=ok&startPage=1)

- `jeonbuk-jeonju-food-1-2` → `jeonju-kongnamul-main-ingredient`
