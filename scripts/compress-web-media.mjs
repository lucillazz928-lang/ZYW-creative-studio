/**
 * 把 public 里过大的视频 / 图片压到网页能顺滑打开的体积。
 * 原文件先拷到 _media-originals/，成功且变小才覆盖。
 *
 * node scripts/compress-web-media.mjs <ffmpeg.exe> [--force] [--videos-only]
 *
 * --force         忽略「已压过」判断，对超阈值重新压
 * --videos-only   只压视频
 */
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

const ffmpeg = process.argv[2]
const force = process.argv.includes('--force')
const videosOnly = process.argv.includes('--videos-only')
if (!ffmpeg || !fs.existsSync(ffmpeg)) {
  console.error('missing ffmpeg binary')
  process.exit(1)
}

const publicRoot = path.resolve('public')
const backupRoot = path.resolve('_media-originals')
const VIDEO_MIN = 3 * 1024 * 1024
const IMAGE_MIN = 700 * 1024
// 网页端：最长边 720，偏小体积；口播竖屏也能明显变小
const videoFilter =
  'scale=w=min(720\\,iw):h=min(720\\,ih):force_original_aspect_ratio=decrease:force_divisible_by=2'
const imageFilter =
  'scale=w=min(1600\\,iw):h=min(1600\\,ih):force_original_aspect_ratio=decrease:force_divisible_by=2'

function isDirectory(dir, entry) {
  if (entry.isDirectory()) return true
  if (!entry.isSymbolicLink()) return false
  try {
    return fs.statSync(path.join(dir, entry.name)).isDirectory()
  } catch {
    return false
  }
}

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (isDirectory(dir, entry)) walk(full, acc)
    else if (entry.isFile()) acc.push(full)
  }
  return acc
}

function run(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpeg, args, { windowsHide: true })
    let err = ''
    child.stderr.on('data', (chunk) => {
      err += chunk.toString()
    })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(err.slice(-600)))
    })
  })
}

function backupPath(file) {
  return path.join(backupRoot, path.relative(publicRoot, file))
}

/** 已有备份且 public 明显小于备份 → 视为已压过 */
function alreadySmaller(file) {
  if (force) return false
  const dest = backupPath(file)
  if (!fs.existsSync(dest)) return false
  return fs.statSync(file).size < fs.statSync(dest).size * 0.85
}

function keepBackup(file) {
  const dest = backupPath(file)
  if (fs.existsSync(dest)) return
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(file, dest)
}

function tempOut(file, suffix) {
  const name = `${path.basename(file)}.${Buffer.from(file).toString('hex').slice(-12)}${suffix}`
  return path.join(path.resolve('.tmp-ffmpeg'), name)
}

async function compressVideo(file) {
  const temp = tempOut(file, '.mp4')
  const videoArgs = [
    '-y',
    '-i',
    file,
    '-map',
    '0:v:0',
    '-vf',
    videoFilter,
    '-c:v',
    'libx264',
    '-preset',
    'veryfast',
    '-crf',
    '28',
    '-maxrate',
    '1800k',
    '-bufsize',
    '3600k',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
  ]
  try {
    await run([...videoArgs, '-map', '0:a:0?', '-c:a', 'aac', '-b:a', '96k', '-ac', '2', temp])
  } catch {
    await run([...videoArgs, '-an', temp])
  }
  return temp
}

async function compressImage(file) {
  const ext = path.extname(file).toLowerCase()
  const temp = tempOut(file, ext)
  const args = ['-y', '-i', file, '-vf', imageFilter]
  if (ext === '.png') args.push('-pred', 'mixed', '-compression_level', '100', temp)
  else args.push('-q:v', '4', temp)
  await run(args)
  return temp
}

function isOutsidePublic(file) {
  const real = fs.realpathSync(file)
  const rel = path.relative(publicRoot, real)
  return rel.startsWith('..') || path.isAbsolute(rel)
}

async function processFile(file, minBytes, encode) {
  const before = fs.statSync(file).size
  if (isOutsidePublic(file) || before < minBytes || alreadySmaller(file)) {
    return { file, skipped: true, before, after: before }
  }
  // 优先用未压缩备份作输入（避免对已压文件再压糊掉）；无备份则用当前文件
  const backup = backupPath(file)
  const source = fs.existsSync(backup) && fs.statSync(backup).size >= before ? backup : file
  if (source === file) keepBackup(file)

  const temp = await encode(source)
  const after = fs.existsSync(temp) ? fs.statSync(temp).size : 0
  // 至少小 5% 才替换；force 时只要更小就换
  const threshold = force ? before : before * 0.95
  if (after > 0 && after < threshold) {
    fs.copyFileSync(temp, file)
  }
  fs.rmSync(temp, { force: true })
  const now = fs.statSync(file).size
  return { file, skipped: false, before, after: now }
}

fs.mkdirSync(path.resolve('.tmp-ffmpeg'), { recursive: true })

const files = walk(publicRoot)
const videos = files.filter((file) => file.toLowerCase().endsWith('.mp4') && !file.includes('.web.tmp'))
const images = videosOnly
  ? []
  : files.filter((file) => /\.(jpe?g|png)$/i.test(file) && !file.includes('.web.tmp'))

const results = []
for (const file of images) {
  try {
    const result = await processFile(file, IMAGE_MIN, compressImage)
    if (!result.skipped) {
      console.log(
        `img ${(result.before / 1048576).toFixed(2)} -> ${(result.after / 1048576).toFixed(2)} ${path.relative(publicRoot, file)}`,
      )
    }
    results.push(result)
  } catch (error) {
    console.error('img fail', file, error.message)
  }
}

let i = 0
for (const file of videos) {
  i += 1
  try {
    const result = await processFile(file, VIDEO_MIN, compressVideo)
    if (!result.skipped) {
      console.log(
        `vid [${i}/${videos.length}] ${(result.before / 1048576).toFixed(2)} -> ${(result.after / 1048576).toFixed(2)} ${path.relative(publicRoot, file)}`,
      )
    } else {
      console.log(`skip [${i}/${videos.length}] ${path.relative(publicRoot, file)}`)
    }
    results.push(result)
  } catch (error) {
    console.error('vid fail', file, error.message)
  }
}

const changed = results.filter((item) => !item.skipped && item.after < item.before)
const saved = changed.reduce((sum, item) => sum + (item.before - item.after), 0)
const totalAfter = videos.reduce((sum, file) => sum + fs.statSync(file).size, 0)
console.log(
  `done changed=${changed.length} savedMB=${(saved / 1048576).toFixed(1)} videosTotalMB=${(totalAfter / 1048576).toFixed(1)} force=${force}`,
)
