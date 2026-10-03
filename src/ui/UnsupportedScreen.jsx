import { siteProfile } from '../content/profile'

export function UnsupportedScreen() {
  return (
    <section className="screen-panel">
      <p className="en-label">{siteProfile.doorPlateEn}</p>
      <h1>{siteProfile.doorPlateZh}</h1>
      <p>当前浏览器无法显示 3D 场景。你仍可通过以下方式了解创作者：</p>
      <p>
        <a href={`mailto:${siteProfile.contact.email}`}>{siteProfile.contact.email}</a>
        <br />
        <a href={`tel:${siteProfile.contact.phone}`}>{siteProfile.contact.phone}</a>
      </p>
    </section>
  )
}
