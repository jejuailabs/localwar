import sharp from 'sharp';
for (const name of ['korea', 'chungju', 'jongno']) {
  await sharp(`public/art/${name}-expedition.png`)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 88 })
    .toFile(`public/art/${name}-expedition.webp`);
}
