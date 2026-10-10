import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const auth = require('C:/Users/na/AppData/Roaming/npm/node_modules/firebase-tools/lib/auth.js');
const account = auth.getGlobalDefaultAccount();
if (account?.user?.email !== 'jejuailabs@gmail.com') throw Error('jejuailabs 계정이 필요합니다.');
const credentials = await auth.getAccessToken(account.tokens.refresh_token, [
  'https://www.googleapis.com/auth/cloud-platform',
]);
const url = 'https://identitytoolkit.googleapis.com/admin/v2/projects/test-e27db/config';
const current = await (
  await fetch(url, { headers: { Authorization: `Bearer ${credentials.access_token}` } })
).json();
if (!Array.isArray(current.authorizedDomains))
  throw Error('기존 로그인 도메인을 확인하지 못했습니다.');
const domains = [
  'localwar.vercel.app',
  'localwar-jejuai.vercel.app',
  'localwar-git-main-jejuai.vercel.app',
  'localwar-1f2zcjpwv-jejuai.vercel.app',
  '127.0.0.1',
];
const response = await fetch(url + '?updateMask=authorizedDomains', {
  method: 'PATCH',
  headers: {
    Authorization: `Bearer ${credentials.access_token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    authorizedDomains: [...new Set([...current.authorizedDomains, ...domains])],
  }),
});
if (!response.ok) throw Error('게임 로그인 도메인 등록이 실패했습니다.');
console.log(JSON.stringify({ gameLoginDomains: 'configured' }));
