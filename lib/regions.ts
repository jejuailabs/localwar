import counties from '@/data/counties.json';
export type Region = {
  code: string;
  name: string;
  province: string;
  lat: number;
  lng: number;
  playable?: boolean;
  description: string;
  tag: string;
};
export type Province = {
  iso: string;
  name: string;
  short: string;
  color: string;
  regions: Region[];
};
const r = (
  code: string,
  name: string,
  province: string,
  lat: number,
  lng: number,
  description: string,
  tag: string,
  playable = false,
): Region => ({ code, name, province, lat, lng, description, tag, playable });
const SEED_PROVINCES: Province[] = [
  {
    iso: 'KR-11',
    name: '서울특별시',
    short: '서울',
    color: '#6ddaca',
    regions: [
      r(
        'seoul-jongno',
        '종로구',
        '서울',
        37.573,
        126.979,
        '궁궐과 골목에 숨은 이야기를 찾아서.',
        '궁궐 탐험',
        true,
      ),
      r(
        'seoul-mapogu',
        '마포구',
        '서울',
        37.566,
        126.902,
        '음악과 예술이 모이는 한강의 서쪽.',
        '문화 산책',
      ),
      r(
        'seoul-yongsan',
        '용산구',
        '서울',
        37.532,
        126.99,
        '도시의 역사와 세계의 문화가 만나는 곳.',
        '도시 탐험',
      ),
    ],
  },
  {
    iso: 'KR-26',
    name: '부산광역시',
    short: '부산',
    color: '#64afdf',
    regions: [
      r(
        'busan-haeundae',
        '해운대구',
        '부산',
        35.163,
        129.163,
        '바다 앞에서 펼쳐지는 새로운 도전.',
        '바다 여행',
      ),
      r(
        'busan-yeongdo',
        '영도구',
        '부산',
        35.091,
        129.067,
        '항구와 섬이 들려주는 이야기.',
        '항구 탐험',
      ),
    ],
  },
  {
    iso: 'KR-27',
    name: '대구광역시',
    short: '대구',
    color: '#c09be3',
    regions: [
      r(
        'daegu-jung',
        '중구',
        '대구',
        35.869,
        128.606,
        '근대 골목에서 찾는 도시의 기억.',
        '골목 여행',
      ),
    ],
  },
  {
    iso: 'KR-28',
    name: '인천광역시',
    short: '인천',
    color: '#89a8cf',
    regions: [
      r(
        'incheon-jung',
        '중구',
        '인천',
        37.474,
        126.621,
        '개항장의 시간 속으로 떠나는 여행.',
        '개항장 탐험',
      ),
      r(
        'incheon-ganghwa',
        '강화군',
        '인천',
        37.747,
        126.488,
        '섬 곳곳에 남은 역사의 흔적.',
        '섬 탐험',
      ),
    ],
  },
  {
    iso: 'KR-29',
    name: '광주광역시',
    short: '광주',
    color: '#cd9ec5',
    regions: [
      r(
        'gwangju-dong',
        '동구',
        '광주',
        35.146,
        126.923,
        '예술과 사람의 이야기가 쌓이는 곳.',
        '예술 여행',
      ),
    ],
  },
  {
    iso: 'KR-30',
    name: '대전광역시',
    short: '대전',
    color: '#73c0bc',
    regions: [
      r(
        'daejeon-yuseong',
        '유성구',
        '대전',
        36.362,
        127.356,
        '과학과 호기심이 만나는 탐험.',
        '과학 탐험',
      ),
    ],
  },
  {
    iso: 'KR-31',
    name: '울산광역시',
    short: '울산',
    color: '#76c1ba',
    regions: [
      r('ulsan-nam', '남구', '울산', 35.544, 129.331, '고래와 산업도시의 이야기.', '고래 여행'),
    ],
  },
  {
    iso: 'KR-41',
    name: '경기도',
    short: '경기',
    color: '#739bac',
    regions: [
      r(
        'gyeonggi-suwon',
        '수원시',
        '경기',
        37.263,
        127.029,
        '성곽을 따라 이어지는 역사 탐험.',
        '성곽 탐험',
      ),
      r(
        'gyeonggi-paju',
        '파주시',
        '경기',
        37.759,
        126.78,
        '책과 평화를 찾아 북쪽으로.',
        '평화 여행',
      ),
    ],
  },
  {
    iso: 'KR-42',
    name: '강원특별자치도',
    short: '강원',
    color: '#639e91',
    regions: [
      r(
        'gangwon-gangneung',
        '강릉시',
        '강원',
        37.751,
        128.876,
        '바다와 커피 향이 함께하는 여행.',
        '해변 탐험',
      ),
      r(
        'gangwon-chuncheon',
        '춘천시',
        '강원',
        37.881,
        127.729,
        '호수와 낭만이 기다리는 도시.',
        '호수 여행',
      ),
    ],
  },
  {
    iso: 'KR-43',
    name: '충청북도',
    short: '충북',
    color: '#d6b175',
    regions: [
      r(
        'chungbuk-chungju',
        '충주시',
        '충북',
        36.991,
        127.926,
        '중원의 역사부터 충주호의 비밀까지.',
        '중원 원정',
        true,
      ),
      r(
        'chungbuk-jecheon',
        '제천시',
        '충북',
        37.132,
        128.191,
        '산과 호수 사이에서 찾는 새로운 길.',
        '호수 탐험',
      ),
      r(
        'chungbuk-cheongju',
        '청주시',
        '충북',
        36.642,
        127.489,
        '직지의 도시에서 만나는 기록의 역사.',
        '기록 여행',
      ),
      r(
        'chungbuk-danyang',
        '단양군',
        '충북',
        36.984,
        128.365,
        '강 위의 절경과 동굴 속 이야기.',
        '동굴 탐험',
      ),
    ],
  },
  {
    iso: 'KR-44',
    name: '충청남도',
    short: '충남',
    color: '#92a4c5',
    regions: [
      r(
        'chungnam-gongju',
        '공주시',
        '충남',
        36.446,
        127.119,
        '백제의 오래된 이야기가 숨 쉬는 곳.',
        '백제 탐험',
      ),
      r(
        'chungnam-buyeo',
        '부여군',
        '충남',
        36.275,
        126.909,
        '왕국의 흔적을 따라 떠나는 여행.',
        '왕국 탐험',
      ),
    ],
  },
  {
    iso: 'KR-45',
    name: '전북특별자치도',
    short: '전북',
    color: '#809c90',
    regions: [
      r(
        'jeonbuk-jeonju',
        '전주시',
        '전북',
        35.824,
        127.148,
        '한옥과 음식으로 기억하는 여행.',
        '한옥 탐험',
      ),
      r(
        'jeonbuk-gunsan',
        '군산시',
        '전북',
        35.968,
        126.737,
        '시간을 품은 항구의 골목.',
        '항구 여행',
      ),
    ],
  },
  {
    iso: 'KR-46',
    name: '전라남도',
    short: '전남',
    color: '#72998d',
    regions: [
      r(
        'jeonnam-yeosu',
        '여수시',
        '전남',
        34.76,
        127.662,
        '남해의 섬과 밤바다가 부르는 곳.',
        '섬 여행',
      ),
      r(
        'jeonnam-suncheon',
        '순천시',
        '전남',
        34.951,
        127.487,
        '갈대와 정원을 따라 걷는 여행.',
        '생태 탐험',
      ),
    ],
  },
  {
    iso: 'KR-47',
    name: '경상북도',
    short: '경북',
    color: '#9496bd',
    regions: [
      r(
        'gyeongbuk-gyeongju',
        '경주시',
        '경북',
        35.856,
        129.225,
        '천년의 시간을 걷는 신라 탐험.',
        '신라 원정',
      ),
      r(
        'gyeongbuk-andong',
        '안동시',
        '경북',
        36.568,
        128.73,
        '마을과 탈춤에 담긴 이야기를 찾아서.',
        '전통 탐험',
      ),
    ],
  },
  {
    iso: 'KR-48',
    name: '경상남도',
    short: '경남',
    color: '#8192b3',
    regions: [
      r(
        'gyeongnam-jinju',
        '진주시',
        '경남',
        35.18,
        128.108,
        '남강과 성곽이 기억하는 이야기.',
        '남강 탐험',
      ),
      r(
        'gyeongnam-tongyeong',
        '통영시',
        '경남',
        34.855,
        128.434,
        '바다와 예술이 어우러지는 여행.',
        '바다 원정',
      ),
    ],
  },
  {
    iso: 'KR-49',
    name: '제주특별자치도',
    short: '제주',
    color: '#edbd77',
    regions: [
      r(
        'jeju-seogwipo',
        '서귀포시',
        '제주',
        33.3,
        126.62,
        '성산일출봉부터 해녀 문화까지, 제주 동부의 이야기를 찾아서.',
        '성산 일대 원정',
        true,
      ),
      r(
        'jeju-aewol',
        '애월읍',
        '제주',
        33.462,
        126.329,
        '푸른 바다와 바람이 이어지는 길.',
        '해안 탐험',
      ),
      r(
        'jeju-hallim',
        '한림읍',
        '제주',
        33.41,
        126.267,
        '섬 너머 또 다른 섬을 만나는 여행.',
        '섬 탐험',
      ),
      r(
        'jeju-andeok',
        '안덕면',
        '제주',
        33.257,
        126.349,
        '산방산과 해안에 남겨진 화산의 흔적.',
        '지질 탐험',
      ),
    ],
  },
  {
    iso: 'KR-50',
    name: '세종특별자치시',
    short: '세종',
    color: '#a6b7af',
    regions: [
      r(
        'sejong-jochiwon',
        '조치원읍',
        '세종',
        36.601,
        127.298,
        '도시의 오래된 중심에서 찾는 이야기.',
        '도시 산책',
      ),
    ],
  },
];
export const PROVINCES: Province[] = SEED_PROVINCES.map((p) => ({
  ...p,
  regions: counties
    .filter((c) => c.provinceIso === p.iso)
    .map((c) => {
      const known = p.regions.find((r) => r.name === c.name);
      return known
        ? { ...known, lat: c.lat, lng: c.lng }
        : r(
            `${p.iso}-${c.id}`,
            c.name,
            p.short,
            c.lat,
            c.lng,
            `${c.name}에 숨은 이야기를 찾아 떠나는 새로운 원정.`,
            `${p.short} 지역 탐험`,
          );
    }),
}));
export const REGIONS = PROVINCES.flatMap((p) => p.regions);
export const PLAYABLE_REGIONS = REGIONS.filter((r) => r.playable).sort(
  (a, b) =>
    ['jeju-seogwipo', 'chungbuk-chungju', 'seoul-jongno'].indexOf(a.code) -
    ['jeju-seogwipo', 'chungbuk-chungju', 'seoul-jongno'].indexOf(b.code),
);
export const regionByCode = (code: string) => REGIONS.find((r) => r.code === code);
