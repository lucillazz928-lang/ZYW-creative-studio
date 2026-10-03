import { BrandCase } from './BrandCase'
import { ximalayaCase } from '../content/ximalaya'

export function XimalayaCase(props) {
  return <BrandCase data={ximalayaCase} themeClass="tm-case--ximalaya" {...props} />
}
