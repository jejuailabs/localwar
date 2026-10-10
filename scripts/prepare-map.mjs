import fs from 'node:fs';
import { geoCentroid, geoContains, geoDistance, geoArea } from 'd3-geo';
const provinces = JSON.parse(
  fs.readFileSync('public/geo/korea.geojson', 'utf8').replace(/^\uFEFF/, ''),
);
const counties = JSON.parse(
  fs.readFileSync('data/counties.raw.geojson', 'utf8').replace(/^\uFEFF/, ''),
);
function normalize(f) {
  const g = f.geometry;
  if (g.type === 'Polygon') {
    if (geoArea(g) > Math.PI * 2) g.coordinates = g.coordinates.map((r) => r.toReversed());
  } else if (g.type === 'MultiPolygon') {
    g.coordinates = g.coordinates.map((coords) =>
      geoArea({ type: 'Polygon', coordinates: coords }) > Math.PI * 2
        ? coords.map((r) => r.toReversed())
        : coords,
    );
  }
  return f;
}
provinces.features.forEach(normalize);
counties.features.forEach(normalize);
fs.writeFileSync('public/geo/korea.geojson', JSON.stringify(provinces));
const transliteration =
  'Andong:안동 Ansan:안산 Anseong:안성 Anyang:안양 Asan:아산 Boeun:보은 Bonghwa:봉화 Boryeong:보령 Boseong:보성 Buan:부안 Bucheon:부천 Buk:북 Bupyeong:부평 Busanjin:부산진 Buyeo:부여 Changnyeong:창녕 Changwon:창원 Cheonan:천안 Cheongdo:청도 Cheongju:청주 Cheongsong:청송 Cheongyang:청양 Cheorwon:철원 Chilgok:칠곡 Chuncheon:춘천 Chungju:충주 Daedeok:대덕 Dalseo:달서 Dalseong:달성 Damyang:담양 Dangjin:당진 Danyang:단양 Dobong:도봉 Dong:동 Dongdaemun:동대문 Dongducheon:동두천 Donghae:동해 Dongjak:동작 Dongnae:동래 Eumseong:음성 Eunpyeong:은평 Gangbuk:강북 Gangdong:강동 Ganghwa:강화 Gangjin:강진 Gangnam:강남 Gangneung:강릉 Gangseo:강서 Gapyeong:가평 Geochang:거창 Geoje:거제 Geumcheon:금천 Geumjeong:금정 Geumsan:금산 Gijang:기장 Gimcheon:김천 Gimhae:김해 Gimje:김제 Gimpo:김포 Gochang:고창 Goesan:괴산 Goheung:고흥 Gokseong:곡성 Gongju:공주 Goryeong:고령 Goseong:고성 Goyang:고양 Gumi:구미 Gunpo:군포 Gunsan:군산 Gunwi:군위 Guri:구리 Guro:구로 Gurye:구례 Gwacheon:과천 Gwanak:관악 Gwangjin:광진 Gwangju:광주 Gwangmyeong:광명 Gwangsan:광산 Gwangyang:광양 Gyeongju:경주 Gyeongsan:경산 Gyeryong:계룡 Gyeyang:계양 Hadong:하동 Haenam:해남 Haeundae:해운대 Haman:함안 Hampyeong:함평 Hamyang:함양 Hanam:하남 Hapcheon:합천 Hoengseong:횡성 Hongcheon:홍천 Hongseong:홍성 Hwacheon:화천 Hwaseong:화성 Hwasun:화순 Icheon:이천 Iksan:익산 Imsil:임실 Inje:인제 Jangheung:장흥 Jangseong:장성 Jangsu:장수 Jecheon:제천 Jeju:제주 Jeongeup:정읍 Jeongseon:정선 Jeonju:전주 Jeungpyeong:증평 Jinan:진안 Jincheon:진천 Jindo:진도 Jinju:진주 Jongno:종로 Jung:중 Jungnang:중랑 Mapo:마포 Michuhol:미추홀 Miryang:밀양 Mokpo:목포 Muan:무안 Muju:무주 Mungyeong:문경 Naju:나주 Nam:남 Namdong:남동 Namhae:남해 Namwon:남원 Namyangju:남양주 Nonsan:논산 Nowon:노원 Okcheon:옥천 Ongjin:옹진 Osan:오산 Paju:파주 Pocheon:포천 Pohang:포항 Pyeongchang:평창 Pyeongtaek:평택 Sacheon:사천 Saha:사하 Samcheok:삼척 Sancheong:산청 Sangju:상주 Sasang:사상 Sejong:세종 Seo:서 Seocheon:서천 Seocho:서초 Seodaemun:서대문 Seogwipo:서귀포 Seongbuk:성북 Seongdong:성동 Seongju:성주 Seongnam:성남 Seosan:서산 Siheung:시흥 Sinan:신안 Sokcho:속초 Songpa:송파 Sunchang:순창 Suncheon:순천 Suseong:수성 Suwon:수원 Suyeong:수영 Taean:태안 Taebaek:태백 Tongyeong:통영 Uijeongbu:의정부 Uiryeong:의령 Uiseong:의성 Uiwang:의왕 Uljin:울진 Ulju:울주 Ulleung:울릉 Wando:완도 Wanju:완주 Wonju:원주 Yangcheon:양천 Yanggu:양구 Yangju:양주 Yangpyeong:양평 Yangsan:양산 Yangyang:양양 Yecheon:예천 Yeoju:여주 Yeoncheon:연천 Yeongam:영암 Yeongcheon:영천 Yeongdeok:영덕 Yeongdeungpo:영등포 Yeongdo:영도 Yeongdong:영동 Yeongju:영주 Yeongwol:영월 Yeongyang:영양 Yeonje:연제 Yeonsu:연수 Yeosu:여수 Yesan:예산 Yongin:용인 Yongsan:용산 Yuseong:유성';
const names = Object.fromEntries(transliteration.split(' ').map((s) => s.split(':')));
const overrides = {
  'Jongno-gu': 'KR-11',
  'Mapo-gu': 'KR-11',
  'Yongsan-gu': 'KR-11',
  'Jeju-si': 'KR-49',
  'Seogwipo-si': 'KR-49',
  'Chungju-si': 'KR-43',
  'Cheongju-si': 'KR-43',
  'Jecheon-si': 'KR-43',
  'Danyang-gun': 'KR-43',
  'Sejong-si': 'KR-50',
  'Gunwi-gun': 'KR-47',
};
const provinceGroups = {
  'KR-11':
    'Dobong Dongdaemun Dongjak Eunpyeong Gangbuk Gangdong Gangnam Geumcheon Gwanak Gwangjin Guro Jongno Jungnang Mapo Nowon Seocho Seodaemun Seongbuk Seongdong Songpa Yangcheon Yeongdeungpo Yongsan',
  'KR-26': 'Busanjin Dongnae Geumjeong Haeundae Saha Sasang Suyeong Yeongdo Yeonje Gijang',
  'KR-27': 'Dalseo Dalseong Suseong',
  'KR-28': 'Bupyeong Gyeyang Ganghwa Michuhol Namdong Ongjin Yeonsu',
  'KR-29': 'Gwangsan',
  'KR-30': 'Daedeok Yuseong',
  'KR-31': 'Ulju',
  'KR-41':
    'Ansan Anseong Anyang Bucheon Dongducheon Gapyeong Gimpo Goyang Gunpo Guri Gwacheon Gwangju Gwangmyeong Hanam Hwaseong Icheon Namyangju Osan Paju Pocheon Pyeongtaek Seongnam Siheung Suwon Uijeongbu Uiwang Yangju Yangpyeong Yeoju Yeoncheon Yongin',
  'KR-42':
    'Chuncheon Donghae Gangneung Hoengseong Hongcheon Hwacheon Inje Jeongseon Pyeongchang Samcheok Sokcho Taebaek Wonju Yanggu Yangyang Yeongwol Cheorwon',
  'KR-43':
    'Boeun Cheongju Chungju Danyang Eumseong Goesan Jecheon Jeungpyeong Jincheon Okcheon Yeongdong',
  'KR-44':
    'Asan Boryeong Buyeo Cheonan Cheongyang Dangjin Geumsan Gongju Gyeryong Hongseong Nonsan Seocheon Seosan Taean Yesan',
  'KR-45':
    'Buan Gimje Gochang Gunsan Iksan Imsil Jangsu Jeongeup Jeonju Jinan Muju Namwon Sunchang Wanju',
  'KR-46':
    'Boseong Damyang Gangjin Goheung Gokseong Gurye Gwangyang Haenam Hampyeong Hwasun Jangheung Jangseong Jindo Mokpo Muan Naju Sinan Suncheon Wando Yeongam Yeosu',
  'KR-47':
    'Andong Bonghwa Cheongdo Cheongsong Chilgok Gimcheon Goryeong Gumi Gunwi Gyeongju Gyeongsan Mungyeong Pohang Sangju Seongju Uiseong Uljin Ulleung Yecheon Yeongcheon Yeongdeok Yeongju Yeongyang',
  'KR-48':
    'Changnyeong Changwon Geochang Geoje Gimhae Hadong Haman Hamyang Hapcheon Jinju Miryang Namhae Sacheon Sancheong Tongyeong Uiryeong Yangsan',
  'KR-49': 'Jeju Seogwipo',
  'KR-50': 'Sejong',
};
const provinceByBase = Object.fromEntries(
  Object.entries(provinceGroups).flatMap(([iso, names]) =>
    names.split(' ').map((name) => [name, iso]),
  ),
);
const metroCenters = [
  ['KR-11', 126.978, 37.566],
  ['KR-26', 129.076, 35.18],
  ['KR-27', 128.601, 35.871],
  ['KR-28', 126.705, 37.456],
  ['KR-29', 126.852, 35.159],
  ['KR-30', 127.384, 36.35],
  ['KR-31', 129.311, 35.539],
];
function parentFor(base, lng, lat) {
  if (base === 'Goseong') return lat > 37 ? 'KR-42' : 'KR-48';
  return (
    provinceByBase[base] ||
    metroCenters.toSorted(
      (a, b) => geoDistance([a[1], a[2]], [lng, lat]) - geoDistance([b[1], b[2]], [lng, lat]),
    )[0][0]
  );
}
for (const f of counties.features) {
  const [lng, lat] = geoCentroid(f);
  const english = f.properties.shapeName.split(' [')[0];
  const [base, suffix] = english.split('-');
  const name =
    (names[base] || base) +
    (suffix === 'si' ? '시' : suffix === 'gun' ? '군' : suffix === 'gu' ? '구' : '시');
  const parent = parentFor(base, lng, lat);
  f.properties = { id: f.properties.shapeID, name, provinceIso: parent, lng, lat };
}
fs.writeFileSync('public/geo/counties.geojson', JSON.stringify(counties));
fs.writeFileSync(
  'data/counties.json',
  JSON.stringify(
    counties.features.map((f) => f.properties),
    null,
    2,
  ),
);
for (const p of provinces.features) {
  const group = counties.features.filter((f) => f.properties.provinceIso === p.properties.shapeISO);
  console.log(
    p.properties.shapeISO,
    p.properties.shapeName,
    group.length,
    group.map((f) => f.properties.name).join(','),
  );
}
