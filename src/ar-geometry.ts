import { Quaternion, Vector3 } from 'three';

type Point3 = { x: number; y: number; z: number };
type Rotation = Point3 & { w: number };

/** World-space position of the diagnostic preview, in metres. */
export function previewPosition(position: Point3, orientation: Rotation): Point3 {
  const offset = new Vector3(0, -0.12, -0.7).applyQuaternion(
    new Quaternion(orientation.x, orientation.y, orientation.z, orientation.w),
  );
  return {
    x: position.x + offset.x,
    y: position.y + offset.y,
    z: position.z + offset.z,
  };
}
