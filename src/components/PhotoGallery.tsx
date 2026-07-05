import { Col, Image, Row, Typography } from "antd";
import type { Journey } from "../data/schema.ts";

const { Title, Text } = Typography;

interface PhotoGalleryProps {
  journey: Journey;
}

export default function PhotoGallery({ journey }: PhotoGalleryProps) {
  const photos = journey.waypoints.flatMap((wp) =>
    (wp.photos ?? []).map((src) => ({ src, caption: wp.name })),
  );

  if (photos.length === 0) return null;

  return (
    <>
      <Title level={5}>照片</Title>
      <Image.PreviewGroup>
        <Row gutter={[8, 8]}>
          {photos.map((photo) => (
            <Col span={8} key={photo.src}>
              <Image src={photo.src} alt={photo.caption} style={{ borderRadius: 8 }} />
              <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 4 }}>
                {photo.caption}
              </Text>
            </Col>
          ))}
        </Row>
      </Image.PreviewGroup>
    </>
  );
}
