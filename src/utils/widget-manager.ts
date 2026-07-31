import { sidebarLayoutConfig } from "../config";
import type {
	SidebarLayoutConfig,
	WidgetComponentType,
} from "../types/config";

/** 默认附加在所有侧栏组件上的 CSS 类名 */
const DEFAULT_COMPONENT_CLASS = "onload-animation";

/** 固定使用 sticky 定位的组件类型（其余组件默认使用 top 定位） */
const STICKY_COMPONENTS: WidgetComponentType[] = [
	"toc",
	"categories",
	"music-sidebar",
];

/**
 * Widget 管理器
 *
 * 负责根据配置解析左右侧栏各位置（top / sticky）需要渲染的组件，
 * 并计算动画延迟等样式属性（Mizuki 风格三栏布局）。
 */
export class WidgetManager {
	private config: SidebarLayoutConfig;

	constructor(config: SidebarLayoutConfig = sidebarLayoutConfig) {
		this.config = config;
	}

	/** 获取配置 */
	getConfig(): SidebarLayoutConfig {
		return this.config;
	}

	/**
	 * 根据位置获取组件类型列表（保持配置中的顺序）
	 * @param side 侧栏位置：left / right
	 * @param position 组件位置：top / sticky
	 */
	getComponents(
		side: "left" | "right",
		position: "top" | "sticky",
	): WidgetComponentType[] {
		const componentTypes = this.config.components[side] || [];
		const isSticky = (type: WidgetComponentType) =>
			STICKY_COMPONENTS.includes(type);
		return componentTypes.filter((type) =>
			position === "sticky" ? isSticky(type) : !isSticky(type),
		);
	}

	/** 获取组件的动画延迟时间（根据位置索引自动计算） */
	getAnimationDelay(index: number): number {
		return 100 + index * 50;
	}

	/** 获取组件的 CSS 类名 */
	getComponentClass(): string {
		return DEFAULT_COMPONENT_CLASS;
	}

	/** 获取组件的内联样式（动画延迟等） */
	getComponentStyle(index: number): string {
		const animationDelay = this.getAnimationDelay(index);
		if (animationDelay > 0) {
			return `animation-delay: ${animationDelay}ms`;
		}
		return "";
	}
}

/** 默认组件管理器实例 */
export const widgetManager = new WidgetManager();
