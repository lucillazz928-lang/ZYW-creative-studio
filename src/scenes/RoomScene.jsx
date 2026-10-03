import { Computer } from '../components/Scene/Computer'
import { Desk } from '../components/Scene/Desk'
import { BlankWall, Floor } from '../components/Scene/BlankWall'
import { InteractiveObject } from '../components/Scene/InteractiveObject'
import { PropMesh } from '../components/Scene/Props'
import { DeskLamp } from '../components/Scene/DeskLamp'
import { DeskAtmosphere } from '../components/Scene/DeskAtmosphere'
import { FloatingShelf } from '../components/Scene/FloatingShelf'
import { WallPosters } from '../components/Scene/WallPosters'
import { FloorMonstera } from '../components/Scene/FloorMonstera'
import { FloorScallopRug } from '../components/Scene/FloorScallopRug'
import { interactiveObjects } from '../content/interactiveObjects'

export function RoomScene() {
  const placeholders = interactiveObjects.filter((item) => item.id !== 'computer')

  return (
    <group>
      <Floor />
      <BlankWall />
      <FloorScallopRug position={[0.05, 0.01, 0.22]} scale={1.05} />
      <Desk />
      <Computer />
      <FloatingShelf />
      <WallPosters />
      <DeskAtmosphere />
      <FloorMonstera position={[1.65, 0, 0.15]} scale={0.55} />
      <DeskLamp />
      {placeholders.map((item) => (
        <InteractiveObject
          key={item.id}
          objectId={item.id}
          overlay={item.overlay}
          position={item.position}
          ambient={item.ambient}
          scaleOnHover={item.scaleOnHover !== false}
        >
          <PropMesh id={item.id} />
        </InteractiveObject>
      ))}
    </group>
  )
}
