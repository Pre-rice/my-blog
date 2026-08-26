import { LinkPreset, type NavBarLink } from "@/types/config";

export const LinkPresets: { [key in LinkPreset]: NavBarLink } = {
	[LinkPreset.Home]: {
		name: "首页",
		url: "/",
	},
	[LinkPreset.Archive]: {
		name: "归档",
		url: "/archive/",
	},
	[LinkPreset.About]: {
		name: "关于",
		url: "/about/",
	},
	[LinkPreset.Links]: {
		name: "传送门",
		url: "/links/",
	},
};
