import { BrandCase } from './BrandCase'
import { adoptACowCase } from '../content/adoptACow'

export function AdoptACowCase(props) {
  return <BrandCase data={adoptACowCase} themeClass="tm-case--adopt" {...props} />
}
