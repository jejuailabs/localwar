import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const auth = require('C:/Users/na/AppData/Roaming/npm/node_modules/firebase-tools/lib/auth.js');
const account = auth.getGlobalDefaultAccount();
if (account?.user?.email !== 'jejuailabs@gmail.com')
  throw Error('jejuailabs Firebase 계정을 선택해 주세요.');
const credentials = await auth.getAccessToken(account.tokens.refresh_token, [
  'https://www.googleapis.com/auth/cloud-platform',
]);
const project = 'test-e27db';
async function get(url) {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${credentials.access_token}` },
  });
  const body = await response.json();
  return response.ok ? body : { error: { status: response.status, message: body.error?.message } };
}
const billing = await get(`https://cloudbilling.googleapis.com/v1/projects/${project}/billingInfo`);
const config = await get(
  `https://identitytoolkit.googleapis.com/admin/v2/projects/${project}/config`,
);
const google = await get(
  `https://identitytoolkit.googleapis.com/admin/v2/projects/${project}/defaultSupportedIdpConfigs/google.com`,
);
const release = await get(
  `https://firebaserules.googleapis.com/v1/projects/${project}/releases/cloud.firestore`,
);
if (release.rulesetName) {
  const rules = await get(`https://firebaserules.googleapis.com/v1/${release.rulesetName}`);
  if (rules.source?.files?.[0]?.content)
    fs.writeFileSync('data/firebase-existing.rules', rules.source.files[0].content);
}
console.log(
  JSON.stringify({
    project,
    billing: billing.error || { billingEnabled: billing.billingEnabled },
    auth: config.error || {
      authorizedDomains: config.authorizedDomains,
      emailEnabled: config.signIn?.email?.enabled,
    },
    googleSignIn: google.error || { enabled: google.enabled },
    firestoreRules: release.error || { ruleset: release.rulesetName },
  }),
);

if (process.argv.includes('--enable-guests')) {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/admin/v2/projects/${project}/config?updateMask=signIn.anonymous.enabled`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${credentials.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ signIn: { anonymous: { enabled: true } } }),
    },
  );
  if (!response.ok) throw Error('게스트 로그인 설정을 적용하지 못했습니다.');
  console.log(JSON.stringify({ guestSignInEnabled: true }));
}
