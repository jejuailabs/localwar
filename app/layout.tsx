import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: '로컬 퀴즈대전 — 아는 만큼, 우리 땅이 된다',
  description: '대한민국을 탐험하고, 지역 퀴즈에 도전하고, 지식으로 영토를 넓혀보세요.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
