// Gera as versões WebP responsivas e o placeholder borrado de cada imagem do site.
// Fonte: scripts/source-images/*.jpg  →  public/media/img/<nome>-<largura>.webp
// Manifesto: content/images.generated.json (srcSet, dimensões e placeholder).
import { readdir, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(import.meta.dirname, '..')
const srcDir = path.join(root, 'scripts/source-images')
const outDir = path.join(root, 'public/media/img')
const widths = [480, 960, 1440, 2048]

await mkdir(outDir, { recursive: true })
const manifest = {}

for (const file of (await readdir(srcDir)).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort()) {
  const name = file.replace(/\.[^.]+$/, '')
  const image = sharp(path.join(srcDir, file)).rotate()
  const { width, height } = await image.metadata()
  const variants = []
  const sizes = [...new Set(widths.filter((w) => w < width).concat(Math.min(width, widths.at(-1))))]
  for (const w of sizes) {
    const out = `${name}-${w}.webp`
    await image.clone().resize({ width: w }).webp({ quality: w > 1500 ? 74 : 78, effort: 5 }).toFile(path.join(outDir, out))
    variants.push({ w, src: `/media/img/${out}` })
  }
  const tiny = await image.clone().resize({ width: 24 }).blur(1.2).webp({ quality: 40 }).toBuffer()
  manifest[name] = {
    src: variants.at(-1).src,
    srcSet: variants.map((v) => `${v.src} ${v.w}w`).join(', '),
    width,
    height,
    placeholder: `data:image/webp;base64,${tiny.toString('base64')}`,
  }
  console.log(name, width, 'x', height, variants.map((v) => v.w).join(','))
}

await writeFile(path.join(root, 'content/images.generated.json'), JSON.stringify(manifest, null, 2) + '\n')
