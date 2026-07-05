/** 详情抽屉宽度（像素） */
export const DRAWER_WIDTH = 380;

/**
 * 地图 setFitView 边距 [上, 右, 下, 左]（像素）。
 * 右侧与 {@link DRAWER_WIDTH} 对齐，避免标记被抽屉遮挡。
 */
export const MAP_DRAWER_PADDING: [number, number, number, number] = [80, DRAWER_WIDTH, 80, 80];
