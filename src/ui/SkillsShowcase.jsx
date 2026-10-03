import BounceCards from './BounceCards'
import {
  skillBounceCaptions,
  skillBounceImages,
  skillBounceTransforms,
} from '../content/skills'

export function SkillsShowcase() {
  return (
    <div className="skills-showcase" aria-label="个人技能">
      <BounceCards
        className="skills-showcase__cards"
        images={skillBounceImages}
        captions={skillBounceCaptions}
        containerWidth={1040}
        containerHeight={400}
        animationDelay={0.12}
        animationStagger={0.1}
        easeType="power3.out"
        transformStyles={skillBounceTransforms}
        enableHover
      />
    </div>
  )
}
