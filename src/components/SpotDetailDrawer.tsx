import { CopyOutlined } from "@ant-design/icons";
import { Col, Descriptions, Drawer, Empty, Image, Row, Tag, Typography, message } from "antd";
import type { Spot } from "../data/schema.ts";
import { CATEGORY_COLORS, CATEGORY_LABELS, formatSpotDateTime } from "../data/schema.ts";

const { Paragraph, Title } = Typography;

interface SpotDetailDrawerProps {
  spot: Spot | undefined;
  open: boolean;
  onClose: () => void;
}

export default function SpotDetailDrawer({ spot, open, onClose }: SpotDetailDrawerProps) {
  if (!spot) return null;

  const copyLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}#/spot/${spot.id}`;
    await navigator.clipboard.writeText(url);
    message.success("链接已复制");
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="right"
      width={380}
      mask={false}
      rootClassName="detail-drawer"
      title={spot.name}
      extra={<Tag color={CATEGORY_COLORS[spot.category]}>{CATEGORY_LABELS[spot.category]}</Tag>}
      footer={
        <Typography.Link onClick={() => void copyLink()}>
          <CopyOutlined /> 复制链接
        </Typography.Link>
      }
    >
      <Descriptions column={1} size="small" style={{ marginBottom: 16 }}>
        <Descriptions.Item label="时间">{formatSpotDateTime(spot)}</Descriptions.Item>
        {spot.address && <Descriptions.Item label="地址">{spot.address}</Descriptions.Item>}
      </Descriptions>

      {spot.essay && (
        <>
          <Title level={5}>随笔</Title>
          <Paragraph>{spot.essay}</Paragraph>
        </>
      )}

      {spot.photos && spot.photos.length > 0 ? (
        <>
          <Title level={5} style={{ marginTop: 16 }}>
            照片
          </Title>
          <Image.PreviewGroup>
            <Row gutter={[8, 8]}>
              {spot.photos.map((src) => (
                <Col span={12} key={src}>
                  <Image src={src} alt={spot.name} style={{ borderRadius: 8 }} />
                </Col>
              ))}
            </Row>
          </Image.PreviewGroup>
        </>
      ) : (
        !spot.essay && <Empty description="暂无照片与随笔" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </Drawer>
  );
}
