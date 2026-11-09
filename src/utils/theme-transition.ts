/**
 * 主题切换的圆形扩散过渡动画 (View Transitions API)
 * 从点击位置向外扩散铺开新主题,不支持或用户偏好减弱动效时直接切换。
 */
interface DocumentWithViewTransition {
	startViewTransition?: (updateCallback: () => void | Promise<void>) => {
		ready: Promise<void>;
	};
}

export interface ThemeTransitionOrigin {
	x: number;
	y: number;
}

export function animateThemeChange(
	update: () => void,
	origin?: ThemeTransitionOrigin,
): void {
	const doc = document as DocumentWithViewTransition;
	const reduceMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	).matches;

	if (typeof doc.startViewTransition !== "function" || reduceMotion) {
		update();
		return;
	}

	const x = origin?.x ?? window.innerWidth / 2;
	const y = origin?.y ?? window.innerHeight / 2;
	const endRadius =
		Math.hypot(
			Math.max(x, window.innerWidth - x),
			Math.max(y, window.innerHeight - y),
		) + 40;

	const transition = doc.startViewTransition(update);

	transition.ready.then(() => {
		document.documentElement.animate(
			{
				clipPath: [
					`circle(0px at ${x}px ${y}px)`,
					`circle(${endRadius}px at ${x}px ${y}px)`,
				],
			},
			{
				duration: 450,
				easing: "cubic-bezier(0.22, 1, 0.36, 1)",
				pseudoElement: "::view-transition-new(root)",
			},
		);
	});
}
