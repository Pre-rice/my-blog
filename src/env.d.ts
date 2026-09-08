/// <reference types="astro/client" />
/// <reference types="vite/client" />
/// <reference path="../.astro/types.d.ts" />

// 字体包入口是纯 CSS（package 无 types），TS 解析到 css 文件后没有可用的类型声明。
// vite/client 的 *.css 声明能覆盖以 .css 结尾的导入（如 ./wght-italic.css），
// 但「包名」导入会先沿 package exports 解析，匹配不到 *.css 通配，需在此为空模块兜底。
declare module "@fontsource-variable/jetbrains-mono";
