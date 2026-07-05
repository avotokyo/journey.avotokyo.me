import { Image, Typography } from "antd";
import type { Journey } from "../data/schema.ts";

const { Title } = Typography;

interface PhotoGalleryProps {
  journey: Journey;
}

export default function PhotoGallery({ journey }: PhotoGalleryProps) {
  const photos = journey.waypoints.flatMap((wp) =>
    (wp.photos ?? []).map((src) => ({ src, caption: wp.name })),
  );

  if (photos.length === 0) return null;

  return (
    <div>
      <Title level={5}>照片</Title>
      <Image.PreviewGroup>
        <div className="photo-grid">
          {photos.map((photo) => (
            <div key={photo.src} className="photo-item">
              <Image src={photo.src} alt={photo.caption} />
              <span className="photo-caption">{photo.caption}</span>
            </div>
          ))}
        </div>
      </Image.PreviewGroup>
    </div>
  );
}
