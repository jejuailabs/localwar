# 생성 이미지와 출처

제작 도구: 내장 image_gen. 아래 이미지는 직접 생성한 게임 콘셉트 일러스트이며 실제 지형을 묘사하는 지도 자료가 아닙니다. 원본 PNG와 웹용 WebP를 public/art에 함께 보관합니다.

## 한국 탐험 / 제주 추천 카드

파일: public/art/korea-expedition.png, public/art/korea-expedition.webp

프롬프트:

Use case: stylized-concept. Asset type: wide landscape artwork for a Korean regional quiz exploration and territory battle web game, used as an expedition card header. Primary request: beautiful premium isometric miniature Korean adventure landscape; on the left a lush volcanic Jeju island with a tiny basalt dol hareubang and tangerine grove, middle green inland mountains and a turquoise lake with a tiny pavilion, right a Korean hanok village and distant city tower. Soft clay-like 3D diorama, sophisticated indie strategy game art, playful and inviting, detailed crafted terrain, warm apricot sunset lighting with teal shadows, soft mist, dark deep navy sky backdrop. Landscape composition wide 3:2, focal terrain in lower two thirds, upper third quiet navy sky for UI overlays. No people, no soldiers, no weapons, no typography, no letters, no logos, no watermark. Crisp and charming, exploration and wonder rather than military realism.

## 충주 원정

파일: public/art/chungju-expedition.png, public/art/chungju-expedition.webp

프롬프트:

Use case: stylized-concept. Asset type: regional expedition card artwork for a Korean map quiz game. Primary request: a premium miniature 3D diorama inspired by Chungju, Korea: a calm turquoise lake winding between lush green mountain ridges, a small seven-story stone pagoda in the foreground, a traditional riverside pavilion and a wooden rowing boat, apple orchard with red apples beside a winding walking path. Clearly charming fictional game artwork, not a survey map. Fine clay-like handcrafted 3D style, elegant adventure game art, soft warm sunset with peach highlights, deep navy shadows, subtle mist, beautiful foliage. Landscape 3:2 composition, focal miniature terrain lower two thirds and quiet navy dusk sky upper third. No text, no symbols, no watermarks, no people, no weapons. Accessible inviting sense of discovery and a hidden story around every bend.

## 종로 원정

파일: public/art/jongno-expedition.png, public/art/jongno-expedition.webp

프롬프트:

Use case: stylized-concept. Asset type: regional expedition card artwork for a Korean map quiz game. Primary request: a beautiful premium miniature 3D diorama inspired by Jongno, Seoul: Korean royal palace buildings with traditional green-and-red painted wooden eaves, a grand stone palace gate, charming Bukchon style hanok roofs along a narrow winding lane, pine trees and soft distant mountain silhouettes. Clearly fictional illustrated game terrain, not a real photograph or survey map. Fine handcrafted clay-like 3D adventure game aesthetic matching warm sunset Korean island exploration art. Warm apricot light, sophisticated teal and deep navy shadows, detailed roof tiles, atmospheric mist. Landscape 3:2, focal architecture in lower two thirds with quiet navy dusk sky in upper third for UI overlays. No typography, no letters, no logo, no watermark, no people, no weapons. Charming, inviting, exploration and wonder.

## 지도

행정구역 경계는 생성 이미지가 아닌 실제 GeoJSON입니다.

- 시·도: geoBoundaries KOR ADM1, 원자료 Natural Earth, Public Domain, 2021년 경계.
- 시·군·구: geoBoundaries KOR ADM2, geoBoundaries / citypopulation.de, CC BY 3.0, 2020년 경계.
- geoBoundaries API와 메타데이터: https://www.geoboundaries.org/api.html
- 원자료 메타데이터: data/geo-source.json, data/county-source.json.
- d3의 구면 좌표 방향에 맞춰 링 방향을 정규화했으며, 도별 소속과 한글명을 별도로 매핑했습니다.
- 이 스냅샷의 시·군·구 경계는 228개입니다. 최근 행정구역 개편과 누락 경계를 포함한 최신 공식 자료 교체는 전국 서비스 확장 단계에서 진행해야 합니다.

