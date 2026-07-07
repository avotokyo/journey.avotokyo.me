/**
 * 景点数据结构，对应 `spots.json` 中的一条记录。
 *
 * 只有 `id`、`name`、`location`、`date` 为必填；其余字段用于详情抽屉的
 * 逐段展示与 Header 的旅程概览统计。缺失字段在 UI 中会静默省略。
 */
export interface Spot {
  /** 唯一标识，用于路由（`/spot/:id`）与菜单 key */
  id: string;
  /** 景点名称，显示在侧栏菜单与详情抽屉标题 */
  name: string;
  /** 所属城市，用于分组统计、抽屉副标题与侧栏日期分组的城市摘要 */
  city?: string;
  /** 详细地址，显示在详情抽屉 Descriptions */
  address?: string;
  /** 经纬度坐标 [经度, 纬度]，供高德地图定位 */
  location: [number, number];
  /** 到访日期，格式 YYYY-MM-DD */
  date: string;
  /** 到访时间，格式 HH:mm，可选 */
  time?: string;
  /** 旅行随笔，纯文本，可选 */
  essay?: string;
  /** 照片 URL 列表，可选；抽屉内以 4:3 网格展示并支持大图预览 */
  photos?: string[];
  /** 当日天气描述，如 "晴 22℃"，展示在抽屉元信息卡片 */
  weather?: string;
  /** 同行者描述，如 "独自"、"与家人"、"与朋友" */
  companions?: string;
  /** 到访花费（人民币元），用于抽屉展示与总花费统计 */
  cost?: number;
  /** 主观评分，0-5 分（`Rate` 支持 0.5 递增） */
  rating?: number;
  /** 标签集合，如 `["历史", "美食"]`；颜色见 `components/tagColors.ts` */
  tags?: string[];
}

/** 旅行整体概览统计，用于 Header 右侧的 4 项数值条 */
export interface JourneyStats {
  /** 到访景点总数 */
  totalSpots: number;
  /** 涉及的不同日期数（近似"旅行天数"） */
  totalDays: number;
  /** 涉及的不同城市数（缺失 city 字段的景点不计） */
  totalCities: number;
  /** 所有景点 cost 合计（人民币元），未录入视为 0 */
  totalCost: number;
}

/** 侧栏按日分组的一条行程，日内景点已按时间升序 */
export interface DayGroup {
  date: string;
  /** 当日涉及城市，以 ` · ` 拼接 */
  cities: string;
  spots: Spot[];
}
