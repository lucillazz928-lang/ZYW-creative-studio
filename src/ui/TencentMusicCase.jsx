import { BrandCase } from './BrandCase'
import { tencentMusicCase } from '../content/tencentMusic'

export function TencentMusicCase(props) {
  return <BrandCase data={tencentMusicCase} themeClass="tm-case--tencent" {...props} />
}
