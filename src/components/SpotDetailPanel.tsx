/**
 * 详情抽屉主体：评分 → 标签 → 元信息 → 随笔 → 照片。
 *
 * 使用 Ant Design 官方组件（Rate/Tag/Descriptions/Card/Divider），
 * 视觉分层依靠 Divider 与 Title level 5，不额外引入色块或阴影。
 */
import { CalendarOutlined, TeamOutlined, WalletOutlined } from "@ant-design/icons";
import {
  Card,
  Col,
  Descriptions,
  Divider,
  Empty,
  Flex,
  Image,
  Rate,
  Row,
  Space,
  Tag,
  Typography,
  theme,
} from "antd";

import { formatSpotDateTime, type Spot } from "../data";
import { tagColor } from "./tagColors";

const { Text, Paragraph } = Typography;

export function SpotDetailPanel({ spot }: { spot: Spot }) {
  const { token } = theme.useToken();

  const metaItems: { icon: React.ReactNode; label: string; value: React.ReactNode }[] = [];
  if (spot.weather) {
    metaItems.push({
      icon: <CalendarOutlined />,
      label: "天气",
      value: spot.weather,
    });
  }
  if (spot.companions) {
    metaItems.push({
      icon: <TeamOutlined />,
      label: "同行",
      value: spot.companions,
    });
  }
  if (typeof spot.cost === "number") {
    metaItems.push({
      icon: <WalletOutlined />,
      label: "花费",
      value: <Text style={{ fontWeight: 500 }}>¥{spot.cost.toLocaleString()}</Text>,
    });
  }

  return (
    <Space direction="vertical" size={token.margin} style={{ width: "100%" }}>
      {typeof spot.rating === "number" && (
        <Flex align="center" gap={token.marginXS}>
          <Rate disabled allowHalf value={spot.rating} style={{ fontSize: 16 }} />
          <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            {spot.rating.toFixed(1)} / 5.0
          </Text>
        </Flex>
      )}

      {spot.tags && spot.tags.length > 0 && (
        <Flex gap={token.marginXXS} wrap>
          {spot.tags.map((tag) => (
            <Tag key={tag} color={tagColor(tag)} style={{ marginInlineEnd: 0 }}>
              {tag}
            </Tag>
          ))}
        </Flex>
      )}

      <Descriptions
        column={1}
        size="small"
        colon={false}
        labelStyle={{ color: token.colorTextTertiary, width: 56 }}
      >
        <Descriptions.Item label="时间">{formatSpotDateTime(spot)}</Descriptions.Item>
        {spot.address && <Descriptions.Item label="地址">{spot.address}</Descriptions.Item>}
      </Descriptions>

      {metaItems.length > 0 && (
        <Card size="small" variant="borderless" style={{ background: token.colorFillQuaternary }}>
          <Row gutter={[token.marginSM, token.marginXS]}>
            {metaItems.map((it) => (
              <Col span={metaItems.length === 3 ? 8 : 12} key={it.label}>
                <Flex vertical gap={2}>
                  <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                    {it.icon} {it.label}
                  </Text>
                  <Text style={{ fontSize: token.fontSize }}>{it.value}</Text>
                </Flex>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {spot.essay && (
        <>
          <Divider titlePlacement="left" style={{ margin: `${token.marginXS}px 0` }}>
            <Text type="secondary" style={{ fontSize: token.fontSizeSM, fontWeight: 400 }}>
              随笔
            </Text>
          </Divider>
          <Paragraph
            style={{
              margin: 0,
              color: token.colorText,
              lineHeight: token.lineHeightLG,
            }}
          >
            {spot.essay}
          </Paragraph>
        </>
      )}

      {spot.photos && spot.photos.length > 0 ? (
        <>
          <Divider titlePlacement="left" style={{ margin: `${token.marginXS}px 0` }}>
            <Text type="secondary" style={{ fontSize: token.fontSizeSM, fontWeight: 400 }}>
              照片
            </Text>
          </Divider>
          <Image.PreviewGroup>
            <Row gutter={[token.marginXS, token.marginXS]}>
              {spot.photos.map((src) => (
                <Col span={12} key={src}>
                  <Image
                    src={src}
                    alt={spot.name}
                    style={{
                      borderRadius: token.borderRadiusLG,
                      aspectRatio: "4 / 3",
                      objectFit: "cover",
                    }}
                  />
                </Col>
              ))}
            </Row>
          </Image.PreviewGroup>
        </>
      ) : (
        !spot.essay && (
          <Empty
            description={
              <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                暂无照片与随笔
              </Text>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )
      )}
    </Space>
  );
}
