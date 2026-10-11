# 경주 시범 문항 48개: 출처와 편집 기준

검토일: 2026-10-11. 지도 지역 코드는 `gyeongbuk-gyeongju`입니다. `lib/question-bank-gyeongju.ts`의 문항 48개와 `data/region-facts/gyeongju.json`의 사실 기록 48개는 `factId`로 일대일 대응합니다. 각 기록의 `claim`은 정답을 뒷받침하는 사실을 재서술한 것입니다.

## 범위

| 분야 | 1단계 | 2단계 | 3단계 | 4단계 | 합계 |
| ---- | ----: | ----: | ----: | ----: | ---: |
| 역사 |     3 |     3 |     3 |     3 |   12 |
| 인물 |     3 |     3 |     3 |     3 |   12 |
| 음식 |     3 |     3 |     3 |     3 |   12 |
| 관광 |     3 |     3 |     3 |     3 |   12 |
| 합계 |    12 |    12 |    12 |    12 |   48 |

48개는 서로 다른 사실 ID를 가집니다. 동일 유적을 다뤄도 목적·구조·등재 시점 등 질문의 사실은 구분합니다. 네 보기와 추가 오답 두 개는 문항의 조건에서 정답이 하나가 되도록 검토했습니다. 음식은 브랜드의 공식 설명이나 모티브·원료·명명 근거를 묻고, 지역의 여러 음식이 동시에 정답이 되는 포괄적인 대표 음식 질문은 사용하지 않았습니다.

## 공식 출처별 문항 연결

아래는 직접 확인한 경주시 관광 안내, 국사편찬위원회, 국립중앙박물관, 국가유산청의 공개 자료입니다. 검색 결과 요약뿐 아니라 가능한 상세 본문을 확인했습니다. 국가유산청 명활성은 검색 엔진에 수록된 공식 해설 본문을 확인했으며, 재접속 시 403 응답이 있어 접근 제한을 기록합니다.

### 경주문화관광: 월성과 천마총 답사

[공식 자료](https://gyeongju.go.kr/tour/page.do?mnu_uid=4707)

- `gyeongbuk-gyeongju-history-1-bank-1` → `gyeongju-wolseong-silla-palace`: 경주 월성은 신라 시대 왕궁의 유적입니다.
- `gyeongbuk-gyeongju-history-2-bank-2` → `gyeongju-cheonmachong-painting-mudguard`: 천마도는 안장 옆에 늘어뜨려 흙이 튀는 것을 막는 말다래에 그려진 그림입니다.
- `gyeongbuk-gyeongju-history-2-bank-3` → `gyeongju-wolseong-half-moon-shape`: 월성은 하늘에서 보면 반달 형태를 보여 반월성이라고도 불립니다.

### 경주문화관광: 시내권 여행 안내

[공식 자료](https://www.gyeongju.go.kr/tour_bak/page.do?mnu_uid=2299)

- `gyeongbuk-gyeongju-history-1-bank-2` → `gyeongju-cheomseongdae-astronomy`: 첨성대는 신라의 천문 관측 시설로 알려진 경주의 대표 유적입니다.
- `gyeongbuk-gyeongju-travel-2-bank-2` → `gyeongju-woljeong-bridge-namcheon`: 경주 월정교는 문천이라고도 부르는 남천 위에 놓인 교량입니다.

### 경주문화관광: 불국사

[공식 자료](https://www.gyeongju.go.kr/tour/page.do?area_uid=260&cmd=2&code_uid=1044&mnu_uid=4781&pageNo=1)

- `gyeongbuk-gyeongju-history-1-bank-3` → `gyeongju-bulguksa-buddhist-temple`: 불국사는 통일신라의 불교 예술과 건축을 보여 주는 사찰입니다.
- `gyeongbuk-gyeongju-history-3-bank-1` → `gyeongju-bulguksa-seokguram-world-year`: 불국사와 석굴암은 1995년에 함께 유네스코 세계유산에 등재됐습니다.

### 경주문화관광: 불국사 다보탑

[공식 자료](https://www.gyeongju.go.kr/tour/page.do?area_uid=264&cmd=2&code_uid=1044&listType=&mnu_uid=2349&sortKwd=&srchKwd=)

- `gyeongbuk-gyeongju-history-2-bank-1` → `gyeongju-bulguksa-two-pagodas`: 불국사 대웅전 앞에는 다보탑과 석가탑으로 불리는 삼층석탑이 마주 서 있습니다.

### 경주문화관광: 세계문화유산 답사 코스

[공식 자료](https://www.gyeongju.go.kr/tour_bak/page.do?mnu_uid=2533)

- `gyeongbuk-gyeongju-history-3-bank-2` → `gyeongju-historic-areas-five`: 경주역사유적지구는 남산·월성·대릉원·황룡사·산성의 다섯 지구로 나뉩니다.

### 경주문화관광: 동궁과 월지

[공식 자료](https://www.gyeongju.go.kr/tour/page.do?area_uid=50&cmd=2&code_uid=1012&mnu_uid=4716)

- `gyeongbuk-gyeongju-history-3-bank-3` → `gyeongju-wolji-munmu-674`: 경주시는 삼국사기 기록을 바탕으로 문무왕 14년인 674년에 월지가 조성됐다고 설명합니다.

### 경주문화관광: 황룡사지

[공식 자료](https://www.gyeongju.go.kr/tour/page.do?area_uid=68&cmd=2&code_uid=1012&listType=&mnu_uid=2292&pageNo=4&sortKwd=&srchKwd=)

- `gyeongbuk-gyeongju-history-4-bank-1` → `gyeongju-hwangnyong-mongol-destruction`: 경주의 황룡사는 고려 시대 몽골군 침입으로 소실됐습니다.
- `gyeongbuk-gyeongju-people-4-bank-3` → `gyeongju-jajang-hwangnyong-pagoda-proposal`: 경주시의 황룡사지 설명은 자장의 권유로 구층목탑을 짓기 시작했다고 소개합니다.

### 국립중앙박물관: 불국사 석가탑 출토 문서 연구 안내

[공식 자료](https://www.museum.go.kr/MUSEUM/contents/M0701040000.do?arcId=2839&catCustomType=post&catId=93&cp=208&schM=view&sv=)

- `gyeongbuk-gyeongju-history-4-bank-2` → `gyeongju-dharani-seokgatap-discovery`: 무구정광대다라니경은 1966년 불국사 삼층석탑 해체·수리 때 발견됐습니다.

### 경주문화관광: 석굴암

[공식 자료](https://www.gyeongju.go.kr/tour/page.do?area_uid=258&cmd=2&code_uid=1044&listType=&mnu_uid=4781&pageNo=1&sortKwd=&srchKwd=)

- `gyeongbuk-gyeongju-history-4-bank-3` → `gyeongju-seokguram-artificial-granite`: 석굴암은 토함산 중턱에 화강암을 사용하여 인위적으로 조성한 석굴입니다.

### 경주문화관광: 오릉과 신라 초기 왕

[공식 자료](https://www.gyeongju.go.kr/tour_bak/page.do?mnu_uid=2300)

- `gyeongbuk-gyeongju-people-1-bank-1` → `gyeongju-bak-hyeokgeose-first-king`: 경주 오릉 설명에는 신라 초대 왕 박혁거세와 알영왕비가 전합니다.

### 국사편찬위원회 우리역사넷: 선덕여왕

[공식 자료](https://contents.history.go.kr/mobile/kc/view.do?levelId=kc_n101170)

- `gyeongbuk-gyeongju-people-1-bank-2` → `gyeongju-seondeok-first-queen`: 선덕여왕은 신라 제27대 왕이자 한국사 최초의 여왕입니다.

### 국사편찬위원회 우리역사넷: 김유신

[공식 자료](https://contents.history.go.kr/front/kc/printViewPopup.do?levelId=kc_n100710)

- `gyeongbuk-gyeongju-people-1-bank-3` → `gyeongju-kim-yusin-military-leader`: 김유신은 신라의 대표 장군으로 삼국통일 전쟁에서 활약했습니다.

### 국사편찬위원회 우리역사넷: 최치원

[공식 자료](https://contents.history.go.kr/mobile/kc/view.do?levelId=kc_n101780)

- `gyeongbuk-gyeongju-people-2-bank-1` → `gyeongju-choe-chiwon-tang-writer`: 신라 문인 최치원은 당나라에서 공부하고 뛰어난 문장으로 이름을 떨쳤습니다.

### 국사편찬위원회 우리역사넷: 원효

[공식 자료](https://contents.history.go.kr/front/kc/printViewPopup.do?levelId=kc_n101460)

- `gyeongbuk-gyeongju-people-2-bank-2` → `gyeongju-wonhyo-hwajaeng`: 원효는 불교 사상과 종파 사이의 대립을 일심으로 통합하는 화쟁을 주장했습니다.

### 국사편찬위원회 우리역사넷: 문무왕

[공식 자료](https://contents.history.go.kr/mobile/kc/view.do?levelId=kc_n101010)

- `gyeongbuk-gyeongju-people-2-bank-3` → `gyeongju-munmu-east-sea-tomb`: 문무왕은 동해 바다 입구의 큰 바위에 장사하라는 유언을 남겼고 경주 문무대왕릉으로 전합니다.

### 경주문화관광: 동학과 용담정

[공식 자료](https://www.gyeongju.go.kr/tour_bak/page.do?mnu_uid=3172)

- `gyeongbuk-gyeongju-people-3-bank-1` → `gyeongju-choe-jeu-donghak`: 최제우는 동학을 창시했으며 경주 현곡면 용담정은 그와 관련된 성지입니다.

### 경주문화관광: 옥산서원

[공식 자료](https://www.gyeongju.go.kr/tour_bak/page.do?mnu_uid=2550)

- `gyeongbuk-gyeongju-people-3-bank-2` → `gyeongju-yi-eonjeok-oksan-scholar`: 옥산서원은 조선 성리학자 회재 이언적을 기리기 위해 세운 서원입니다.
- `gyeongbuk-gyeongju-travel-3-bank-2` → `gyeongju-oksan-world-seowon-year`: 경주 옥산서원은 2019년 한국의 서원의 일부로 유네스코 세계유산에 등재됐습니다.

### 국사편찬위원회 우리역사넷: 삼국사기 설총 관련 번역

[공식 자료](https://contents.history.go.kr/mobile/ta/view.do?levelId=ta_p41r_0080_0030_0060_0010)

- `gyeongbuk-gyeongju-people-3-bank-3` → `gyeongju-seol-chong-chinese-sound-meaning`: 설총은 한자의 음훈을 활용하여 신라 말을 표현하고 유교 경전의 뜻을 해석했다고 전합니다.

### 국사편찬위원회 우리역사넷: 김춘추

[공식 자료](https://contents.history.go.kr/mobile/kc/view.do?levelId=kc_n101810)

- `gyeongbuk-gyeongju-people-4-bank-1` → `gyeongju-kim-chunchu-first-jingol-king`: 태종무열왕 김춘추는 최초의 진골 왕으로 나당 군사동맹과 백제 정벌을 추진했습니다.

### 국사편찬위원회 우리역사넷: 만파식적

[공식 자료](https://contents.history.go.kr/mobile/kc/view.do?levelId=kc_r100360)

- `gyeongbuk-gyeongju-people-4-bank-2` → `gyeongju-sinmun-manpasikjeok-story`: 만파식적은 신문왕 때 신비한 피리를 얻어 나라의 평온을 바랐다는 설화입니다.

### 경주문화관광: 경주의 빵

[공식 자료](https://www.gyeongju.go.kr/tour_bak/page.do?mnu_uid=2342)

- `gyeongbuk-gyeongju-food-1-bank-1` → `gyeongju-hwangnam-bread-redbean`: 황남빵은 팥을 가득 넣은 경주의 대표 간식입니다.
- `gyeongbuk-gyeongju-food-1-bank-2` → `gyeongju-chalbori-bread-grain`: 경주시는 찰보리빵을 경주산 찰보리와 통귀리를 주원료로 하는 간식으로 소개합니다.
- `gyeongbuk-gyeongju-food-2-bank-2` → `gyeongju-daereung-cake-tomb-shape`: 대릉빵은 경주의 둥근 고분 모양을 가져와 만든 치즈 수플레 케이크로 소개됩니다.
- `gyeongbuk-gyeongju-food-3-bank-2` → `gyeongju-juryeonggu-bread-fourteen-faces`: 주령구빵은 동궁과 월지에서 출토된 14면체 놀이 주사위 주령구를 본떴습니다.
- `gyeongbuk-gyeongju-food-4-bank-3` → `gyeongju-smile-bread-roof-tile`: 천년미소빵은 신라인의 미소로 불리는 얼굴무늬 수막새를 본뜬 빵으로 소개됩니다.

### 경주문화관광: 특산품

[공식 자료](https://www.gyeongju.go.kr/tour/page.do?mnu_uid=4615)

- `gyeongbuk-gyeongju-food-1-bank-3` → `gyeongju-gyodong-beopju-traditional-alcohol`: 경주교동법주는 경주 최씨 가문에서 전승된 가양주입니다.
- `gyeongbuk-gyeongju-food-2-bank-3` → `gyeongju-haeparang-seafood-brand`: 해파랑은 경주 어민들의 수산물 공동 브랜드입니다.
- `gyeongbuk-gyeongju-food-3-bank-3` → `gyeongju-esageum-royal-title-brand`: 이사금은 신라 임금의 칭호에서 이름을 가져온 경주 농산물 공동 브랜드입니다.
- `gyeongbuk-gyeongju-food-4-bank-1` → `gyeongju-gyodong-beopju-saongwon-origin`: 경주시 설명에 따르면 최국선은 사옹원 참봉을 지낸 뒤 낙향하여 교동법주를 빚었습니다.

### 경주문화관광: 향토음식 별채반

[공식 자료](https://www.gyeongju.go.kr/tour_bak/page.do?mnu_uid=2286)

- `gyeongbuk-gyeongju-food-2-bank-1` → `gyeongju-byeolchaeban-local-brand`: 별채반은 경주 지역 식재료를 활용하는 향토 음식 브랜드입니다.
- `gyeongbuk-gyeongju-food-3-bank-1` → `gyeongju-gondalbi-bibimbap-seasoning`: 별채반 곤달비 비빔밥은 고추장 대신 된장과 멸치가루로 만든 양념장을 사용한다고 소개됩니다.
- `gyeongbuk-gyeongju-food-4-bank-2` → `gyeongju-six-villages-yukgaejang-name`: 6부촌육개장은 신라 건국의 바탕이 된 서라벌 여섯 부족의 마을에서 이름을 가져왔습니다.

### 경주문화관광: 보문호

[공식 자료](https://www.gyeongju.go.kr/tour_bak/page.do?mnu_uid=2942)

- `gyeongbuk-gyeongju-travel-1-bank-1` → `gyeongju-bomun-artificial-lake`: 보문호는 경주 동쪽 명활산 옛 성터 아래에 만들어진 인공 호수입니다.

### 경주문화관광: 교촌마을

[공식 자료](https://www.gyeongju.go.kr/tour_bak/page.do?mnu_uid=3164)

- `gyeongbuk-gyeongju-travel-1-bank-2` → `gyeongju-gyochon-hanok-village`: 교촌마을에는 경주 최씨 가문의 고택과 한옥이 어우러져 있습니다.

### 경주시 공식 황리단길 안내 지도

[공식 자료](https://www.gyeongju.go.kr/design/tour2019/file/HroadMap.pdf)

- `gyeongbuk-gyeongju-travel-1-bank-3` → `gyeongju-hwangridan-hwangnam-neighborhood`: 황리단길은 황남동 포석로 일대의 황남 큰길이라 불리던 골목을 중심으로 형성됐습니다.

### 경주문화관광: 양남 주상절리

[공식 자료](https://www.gyeongju.go.kr/tour_bak/page.do?mnu_uid=2535)

- `gyeongbuk-gyeongju-travel-2-bank-1` → `gyeongju-yangnam-fan-columnar-joints`: 양남 주상절리군에는 둥글게 펼쳐진 부채꼴 주상절리를 비롯한 다양한 형태가 있습니다.

### 경주문화관광: 감포항

[공식 자료](https://www.gyeongju.go.kr/tour/page.do?area_uid=160&cmd=2&code_uid=1016&mnu_uid=2294&pageNo=2)

- `gyeongbuk-gyeongju-travel-2-bank-3` → `gyeongju-gampo-east-coast-port`: 경주의 감포항에서는 어선이 드나들고 활어 위판장에서 생선 경매가 이루어집니다.

### 경주문화관광: 양동마을

[공식 자료](https://www.gyeongju.go.kr/tour/page.do?area_uid=241&cmd=2&code_uid=1045&listType=&mnu_uid=4782&pageNo=2&sortKwd=&srchKwd=)

- `gyeongbuk-gyeongju-travel-3-bank-1` → `gyeongju-yangdong-two-clans`: 양동마을은 월성 손씨와 여강 이씨 두 가문이 이어 온 동족마을입니다.

### 경주문화관광: 동남산 걷기

[공식 자료](https://www.gyeongju.go.kr/tour_bak/page.do?mnu_uid=2540)

- `gyeongbuk-gyeongju-travel-3-bank-3` → `gyeongju-namsan-bulgok-tapgok-sites`: 경주 남산의 동남산 탐방 코스에는 불곡 마애여래좌상과 탑곡 마애불상군이 포함됩니다.

### 국가유산청 국가유산 해설: 경주 명활성

[공식 자료](https://my.heritage.go.kr/public/commentary/culSelectDetail.do?ccbaAsno=0000470000000&ccbaCpno=1333700470000&ccbaCtcd=37&ccbaKdcd=13)

- `gyeongbuk-gyeongju-travel-4-bank-1` → `gyeongju-myeonghwal-fortress-mountain`: 경주 명활성은 경주 동쪽 명활산 꼭대기에 자연석을 쌓아 만든 신라 산성입니다.

### 경주문화관광 국가유산 설명: 분황사 모전석탑

[공식 자료](https://www.gyeongju.go.kr/tour_bak/page.do?chaNo=330&cmd=2&mnu_uid=2515)

- `gyeongbuk-gyeongju-travel-4-bank-2` → `gyeongju-bunhwang-mojeon-stone-brick`: 분황사 모전석탑은 돌을 벽돌 모양으로 다듬어 쌓은 석탑입니다.

### 경주문화관광: 포석정과 가을 답사

[공식 자료](https://www.gyeongju.go.kr/tour_bak/page.do?mnu_uid=4079)

- `gyeongbuk-gyeongju-travel-4-bank-3` → `gyeongju-poseokjeong-flowing-cup-poetry`: 포석정은 흐르는 물에 술잔을 띄워 잔이 멈추기 전에 시를 읊는 유상곡수연 유적으로 소개됩니다.

## 검토 중 확인한 제한

- 난이도는 1단계 인지·기본 분류, 2단계 특징과 장소 연결, 3단계 연대·관계·지역 세부 지식, 4단계 사료·축조·기관·용어 구별을 기준으로 편집했습니다. 실제 정답률을 통한 보정은 시범 운영 이후 해야 하며, 지역 경험에 따라 체감 난이도는 달라집니다.
- 매일 새 사실을 무제한 생성하는 자료가 아닙니다. 검토된 48개 사실과 오답 후보를 순환·셔플하는 초기 은행입니다. 같은 질문의 보기 순서가 달라도 새로운 사실로 집계하지 않습니다. 신규 사실은 출처 확인과 정답 유일성 검토를 거쳐 추가해야 합니다.
- `tour_bak` 주소는 경주시가 공개하는 이전 관광 페이지입니다. 역사·지형·브랜드 설명 같은 비교적 안정적인 사실만 사용했습니다. 영업 시간·가격·행사 일정·현재 기능보유자와 같은 변경 가능한 안내는 출제하지 않았습니다.
- 만파식적은 설화라고 명시했습니다. 천마도의 동물 해석, 설총의 이두 창제 여부, 특정 목판 인쇄물의 세계 최초 여부처럼 논쟁이나 과장 가능성이 있는 주장은 사용하지 않았습니다.
- 교동법주의 최국선·사옹원 이력은 특산품 페이지 교동법주 단락에 이름과 관서가 함께 나오는 것을 재확인했습니다. 명활성의 산 위치도 공식 국가유산 해설의 확인 가능한 부분만 사용했습니다.
- 별채반의 곤달비 비빔밥 양념은 그 공식 설명에 한정합니다. 모든 지역 식당의 조리법이나 빵 제조사의 독점적인 원조 여부를 일반화하지 않았습니다. 식품의 건강 효능과 관광 홍보 문구의 최상급 표현은 제외했습니다.
- 국가유산청 해설 접근 제한을 제외한 출처도 개편으로 주소가 바뀔 수 있습니다. 사실 ID를 유지하며 공식 대체 자료로 출처를 갱신하는 것이 필요합니다.

## 기계 검증

48문항·48개 고유 문항 ID·48개 고유 사실 ID, 16개 분야/난이도 셀 각각 3문항, 정답 인덱스 0, 4개 중복 없는 기본 보기, 기본 보기 및 추가 오답의 중복 없음, 지역 코드 통일, 사실 JSON의 일대일 대응을 확인했습니다. 자동 검증은 필드 구조와 중복을 확인하며 사실의 진위는 출처 검토에 의존합니다.
