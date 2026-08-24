import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, r as Slot, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as PenLine, i as Settings2, o as Bell, r as Trash2, t as X } from "../_libs/lucide-react.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/@radix-ui/react-switch+[...].mjs";
import { i as Trigger, n as List, r as Root2, t as Content } from "../_libs/radix-ui__react-tabs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BCBa4Jl9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function uid() {
	return crypto.randomUUID();
}
var SEED_NOTES = [
	{
		id: "seed-1",
		body: "Ask Pip for a note — click the companion.",
		x: 12,
		y: 18,
		rot: -2.4,
		tint: "cream",
		z: 2,
		createdAt: 1
	},
	{
		id: "seed-2",
		body: "Switch themes in the hub.\nTry Ink, Paper, Glass, Moss.",
		x: 38,
		y: 42,
		rot: 1.8,
		tint: "mist",
		z: 1,
		createdAt: 2
	},
	{
		id: "seed-3",
		body: "Quick capture: Ctrl + Shift + N\n(or the tray button)",
		x: 62,
		y: 16,
		rot: -1.1,
		tint: "sage",
		z: 3,
		createdAt: 3
	}
];
function emptyPip() {
	return {
		enabled: true,
		mood: "wander",
		x: 72,
		y: 58,
		facing: -1,
		carrying: false,
		moving: false,
		speech: null
	};
}
var useLumen = create()(persist((set, get) => ({
	hydrated: false,
	theme: "ink",
	layout: "stickies",
	hubOpen: false,
	captureOpen: false,
	onboarding: true,
	notes: SEED_NOTES,
	reminders: [],
	toasts: [],
	pip: emptyPip(),
	maxZ: 4,
	markHydrated: () => set({ hydrated: true }),
	setTheme: (theme) => set({ theme }),
	setLayout: (layout) => set({ layout }),
	setHubOpen: (hubOpen) => set({
		hubOpen,
		captureOpen: hubOpen ? false : get().captureOpen
	}),
	setCaptureOpen: (captureOpen) => set({
		captureOpen,
		hubOpen: captureOpen ? false : get().hubOpen
	}),
	dismissOnboarding: () => set({ onboarding: false }),
	addNote: (partial) => {
		const id = partial?.id ?? uid();
		const z = get().maxZ + 1;
		const note = {
			id,
			body: partial?.body ?? "",
			x: partial?.x ?? 28 + Math.random() * 24,
			y: partial?.y ?? 22 + Math.random() * 18,
			rot: partial?.rot ?? (Math.random() - .5) * 4,
			tint: partial?.tint ?? "cream",
			z: partial?.z ?? z,
			createdAt: Date.now()
		};
		set({
			notes: [...get().notes, note],
			maxZ: z
		});
		return id;
	},
	updateNote: (id, patch) => set({ notes: get().notes.map((n) => n.id === id ? {
		...n,
		...patch
	} : n) }),
	removeNote: (id) => set({ notes: get().notes.filter((n) => n.id !== id) }),
	bringNote: (id) => {
		const z = get().maxZ + 1;
		set({
			notes: get().notes.map((n) => n.id === id ? {
				...n,
				z
			} : n),
			maxZ: z
		});
	},
	addReminder: (title, delayMs) => set({ reminders: [...get().reminders, {
		id: uid(),
		title,
		fireAt: Date.now() + delayMs,
		done: false
	}] }),
	completeReminder: (id) => set({ reminders: get().reminders.map((r) => r.id === id ? {
		...r,
		done: true
	} : r) }),
	fireReminder: (id) => {
		const r = get().reminders.find((x) => x.id === id);
		if (!r || r.done) return;
		set({ reminders: get().reminders.map((x) => x.id === id ? {
			...x,
			done: true
		} : x) });
		get().pushToast("Reminder", r.title);
		if (get().pip.enabled) get().setPip({
			mood: "nudge",
			speech: "Time."
		});
	},
	pushToast: (title, body) => {
		const toast = {
			id: uid(),
			title,
			body,
			createdAt: Date.now()
		};
		set({ toasts: [...get().toasts.slice(-3), toast] });
	},
	dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
	setPip: (patch) => set({ pip: {
		...get().pip,
		...patch
	} }),
	setPipEnabled: (enabled) => set({ pip: {
		...get().pip,
		enabled,
		mood: enabled ? "wander" : "idle",
		speech: enabled ? "Hello." : null,
		carrying: false,
		moving: false
	} }),
	requestNoteFromPip: () => {
		const { pip } = get();
		if (!pip.enabled) {
			get().setCaptureOpen(true);
			return;
		}
		if (pip.mood === "fetch" || pip.mood === "deliver") return;
		get().setPip({
			mood: "fetch",
			speech: "On it.",
			carrying: false
		});
	},
	resetDemo: () => set({
		theme: "ink",
		layout: "stickies",
		hubOpen: false,
		captureOpen: false,
		onboarding: true,
		notes: SEED_NOTES,
		reminders: [{
			id: uid(),
			title: "Stand up and stretch",
			fireAt: Date.now() + 48e4,
			done: false
		}],
		toasts: [],
		pip: emptyPip(),
		maxZ: 4
	})
}), {
	name: "lumen-demo-v1",
	skipHydration: true,
	partialize: (s) => ({
		theme: s.theme,
		layout: s.layout,
		onboarding: s.onboarding,
		notes: s.notes,
		reminders: s.reminders,
		pip: {
			...s.pip,
			mood: "wander",
			carrying: false,
			speech: null,
			moving: false
		},
		maxZ: s.maxZ
	})
}));
var NOTE_TINTS = [
	{
		id: "cream",
		label: "Cream"
	},
	{
		id: "mist",
		label: "Mist"
	},
	{
		id: "sage",
		label: "Sage"
	},
	{
		id: "blush",
		label: "Blush"
	}
];
function PipFigure({ walking, carrying, facing, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("relative h-16 w-16 sm:h-20 sm:w-20", className),
		style: { transform: `scaleX(${facing})` },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 80 80",
			className: "h-full w-full overflow-visible",
			"aria-hidden": true,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
					cx: "40",
					cy: "72",
					rx: "16",
					ry: "4",
					fill: "currentColor",
					className: "text-fg/15"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					className: walking ? "pip-walk-body" : "pip-bob",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
							className: "pip-tail",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
								cx: "18",
								cy: "46",
								rx: "8",
								ry: "6",
								fill: "var(--pip-shade)"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
							cx: "28",
							cy: "22",
							rx: "7",
							ry: "9",
							fill: "var(--pip-body)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
							cx: "52",
							cy: "22",
							rx: "7",
							ry: "9",
							fill: "var(--pip-body)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
							cx: "28",
							cy: "22",
							rx: "4",
							ry: "5.5",
							fill: "var(--pip-shade)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "40",
							cy: "42",
							r: "20",
							fill: "var(--pip-body)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
							cx: "40",
							cy: "48",
							rx: "13",
							ry: "11",
							fill: "var(--pip-shade)",
							opacity: "0.55"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
							className: "pip-blink",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
									cx: "33",
									cy: "40",
									r: "2.2",
									fill: "var(--pip-eye)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
									cx: "47",
									cy: "40",
									r: "2.2",
									fill: "var(--pip-eye)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
									cx: "33.7",
									cy: "39.3",
									r: "0.7",
									fill: "var(--pip-body)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
									cx: "47.7",
									cy: "39.3",
									r: "0.7",
									fill: "var(--pip-body)"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
							cx: "40",
							cy: "46.5",
							rx: "2.2",
							ry: "1.4",
							fill: "var(--pip-eye)",
							opacity: "0.55"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
					className: walking ? "pip-leg-l" : void 0,
					style: { transformOrigin: "32px 62px" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: "29",
						y: "60",
						width: "5",
						height: "10",
						rx: "2.5",
						fill: "var(--pip-shade)"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
					className: walking ? "pip-leg-r" : void 0,
					style: { transformOrigin: "48px 62px" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: "46",
						y: "60",
						width: "5",
						height: "10",
						rx: "2.5",
						fill: "var(--pip-shade)"
					})
				}),
				carrying ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					transform: "translate(50 34) rotate(8)",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
							x: "0",
							y: "0",
							width: "18",
							height: "16",
							rx: "2",
							fill: "var(--note-cream)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
							x: "0",
							y: "0",
							width: "18",
							height: "16",
							rx: "2",
							fill: "none",
							stroke: "var(--pip-eye)",
							strokeOpacity: "0.12"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: "M3 5h12M3 8h9M3 11h11",
							stroke: "var(--pip-eye)",
							strokeOpacity: "0.35",
							strokeWidth: "1"
						})
					]
				}) : null
			]
		})
	});
}
var WELL = {
	x: 86,
	y: 62
};
var SPEED = 36;
function dist(ax, ay, bx, by) {
	return Math.hypot(ax - bx, ay - by);
}
function clamp(n, min, max) {
	return Math.max(min, Math.min(max, n));
}
function Companion() {
	const enabled = useLumen((s) => s.pip.enabled);
	const mood = useLumen((s) => s.pip.mood);
	const carrying = useLumen((s) => s.pip.carrying);
	const facing = useLumen((s) => s.pip.facing);
	const moving = useLumen((s) => s.pip.moving);
	const speech = useLumen((s) => s.pip.speech);
	const startX = useLumen((s) => s.pip.x);
	const startY = useLumen((s) => s.pip.y);
	const layout = useLumen((s) => s.layout);
	const requestNoteFromPip = useLumen((s) => s.requestNoteFromPip);
	const elRef = (0, import_react.useRef)(null);
	const pos = (0, import_react.useRef)({
		x: startX,
		y: startY
	});
	const target = (0, import_react.useRef)({
		x: startX,
		y: startY,
		kind: "idle"
	});
	const waitUntil = (0, import_react.useRef)(0);
	const lastMood = (0, import_react.useRef)(mood);
	(0, import_react.useEffect)(() => {
		pos.current = {
			x: startX,
			y: startY
		};
	}, [enabled]);
	(0, import_react.useEffect)(() => {
		if (!enabled) return;
		let raf = 0;
		let last = performance.now();
		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const applyDom = (x, y) => {
			const el = elRef.current;
			if (el) {
				el.style.left = `${x}%`;
				el.style.top = `${y}%`;
			}
		};
		const tick = (now) => {
			const dt = Math.min(.05, (now - last) / 1e3);
			last = now;
			const state = useLumen.getState();
			const p = state.pip;
			if (!p.enabled) {
				raf = requestAnimationFrame(tick);
				return;
			}
			if (p.mood !== lastMood.current) {
				lastMood.current = p.mood;
				if (p.mood === "fetch") target.current = {
					...WELL,
					kind: "well"
				};
				if (p.mood === "nudge") target.current = {
					x: 78,
					y: 14,
					kind: "nudge"
				};
			}
			if (reduced) {
				if (p.mood === "fetch" || p.mood === "deliver") {
					state.addNote({
						x: clamp(pos.current.x - 8, 6, 70),
						y: clamp(pos.current.y - 10, 8, 55),
						tint: "cream",
						rot: (Math.random() - .5) * 3,
						body: "From Pip — write here."
					});
					state.setPip({
						mood: "idle",
						carrying: false,
						moving: false,
						speech: "Here.",
						x: pos.current.x,
						y: pos.current.y
					});
				}
				raf = requestAnimationFrame(tick);
				return;
			}
			if (p.mood === "wander" && now > waitUntil.current && target.current.kind === "idle") {
				target.current = {
					x: 8 + Math.random() * 70,
					y: 18 + Math.random() * 48,
					kind: "idle"
				};
				if (p.speech) state.setPip({ speech: null });
			}
			const t = target.current;
			const d = dist(pos.current.x, pos.current.y, t.x, t.y);
			if (d > 1.15 && p.mood !== "sleep") {
				const step = SPEED * dt;
				const k = Math.min(1, step / d);
				pos.current.x += (t.x - pos.current.x) * k;
				pos.current.y += (t.y - pos.current.y) * k;
				const nextFacing = t.x >= pos.current.x ? 1 : -1;
				applyDom(pos.current.x, pos.current.y);
				if (!p.moving || p.facing !== nextFacing) state.setPip({
					moving: true,
					facing: nextFacing
				});
			} else {
				applyDom(pos.current.x, pos.current.y);
				if (p.mood === "fetch" && t.kind === "well") {
					const drop = {
						x: layout === "sidebar" ? 58 : 18 + Math.random() * 40,
						y: 16 + Math.random() * 28
					};
					target.current = {
						...drop,
						kind: "drop"
					};
					state.setPip({
						mood: "deliver",
						carrying: true,
						moving: true,
						speech: "Got one.",
						x: pos.current.x,
						y: pos.current.y
					});
				} else if (p.mood === "deliver" && t.kind === "drop") {
					state.addNote({
						x: clamp(pos.current.x - 6, 4, 72),
						y: clamp(pos.current.y - 8, 6, 52),
						tint: "cream",
						rot: (Math.random() - .5) * 4,
						body: "From Pip — write here."
					});
					waitUntil.current = now + 2400;
					target.current = {
						x: pos.current.x,
						y: pos.current.y,
						kind: "idle"
					};
					state.setPip({
						mood: "wander",
						carrying: false,
						moving: false,
						speech: "Here you go.",
						x: pos.current.x,
						y: pos.current.y
					});
				} else if (p.mood === "nudge" && t.kind === "nudge") {
					waitUntil.current = now + 1800;
					target.current = {
						x: pos.current.x,
						y: pos.current.y,
						kind: "idle"
					};
					state.setPip({
						mood: "wander",
						moving: false,
						speech: null,
						x: pos.current.x,
						y: pos.current.y
					});
				} else if (p.moving) {
					waitUntil.current = now + 1400 + Math.random() * 2600;
					target.current = {
						x: pos.current.x,
						y: pos.current.y,
						kind: "idle"
					};
					state.setPip({
						moving: false,
						x: pos.current.x,
						y: pos.current.y
					});
				}
			}
			raf = requestAnimationFrame(tick);
		};
		applyDom(pos.current.x, pos.current.y);
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [enabled, layout]);
	if (!enabled) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		ref: elRef,
		type: "button",
		className: "absolute z-50 -translate-x-1/2 -translate-y-1/2 bg-transparent p-0",
		style: {
			left: `${startX}%`,
			top: `${startY}%`
		},
		onClick: requestNoteFromPip,
		"aria-label": "Pip, click to fetch a note",
		children: [speech ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-elevated px-2 py-1 text-[11px] font-medium text-fg shadow-[var(--shadow-border)]",
			children: speech
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PipFigure, {
			walking: moving,
			carrying,
			facing
		})]
	});
}
function Badge({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full bg-elevated px-2 py-0.5 text-[11px] font-medium text-muted", className),
		...props
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium select-none outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0 active:not-disabled:scale-[0.96] transition-[scale,background-color,color,opacity] duration-150 ease-out", {
	variants: {
		variant: {
			default: "bg-accent text-accent-fg hover:opacity-90",
			secondary: "bg-elevated text-fg hover:bg-elevated/80",
			ghost: "bg-transparent text-fg hover:bg-elevated",
			outline: "bg-transparent text-fg shadow-[var(--shadow-border)] hover:bg-elevated",
			danger: "bg-transparent text-fg hover:bg-elevated"
		},
		size: {
			default: "h-10 px-4 rounded-md text-sm",
			sm: "h-8 px-3 rounded-sm text-xs",
			lg: "h-11 px-5 rounded-lg text-sm",
			icon: "size-10 rounded-md",
			"icon-sm": "size-8 rounded-sm"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("flex h-10 w-full rounded-md bg-elevated px-3 text-sm text-fg", "shadow-[var(--shadow-border)] placeholder:text-subtle", "outline-none focus-visible:ring-2 focus-visible:ring-accent/60", "disabled:opacity-40", className),
		...props
	});
}
function Separator({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("h-px w-full bg-border", className),
		role: "separator",
		...props
	});
}
function Switch({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
		className: cn("peer inline-flex h-6 w-10 shrink-0 items-center rounded-full", "bg-elevated shadow-[var(--shadow-border)]", "data-[state=checked]:bg-accent", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60", "disabled:cursor-not-allowed disabled:opacity-40", "transition-[background-color] duration-150 ease-out", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: cn("block size-5 rounded-full bg-fg", "data-[state=checked]:bg-accent-fg", "translate-x-0.5 data-[state=checked]:translate-x-[18px]", "transition-transform duration-150 ease-out") })
	});
}
var Tabs = Root2;
function TabsList({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
		className: cn("flex gap-1 rounded-lg bg-elevated p-1", className),
		...props
	});
}
function TabsTrigger({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
		className: cn("flex-1 rounded-md px-3 py-2 text-xs font-medium text-muted", "data-[state=active]:bg-surface data-[state=active]:text-fg data-[state=active]:shadow-[var(--shadow-border)]", "transition-[background-color,color] duration-150 ease-out", "outline-none focus-visible:ring-2 focus-visible:ring-accent/60", className),
		...props
	});
}
function TabsContent({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
		className: cn("outline-none", className),
		...props
	});
}
var THEMES = [
	{
		id: "ink",
		name: "Ink",
		line: "Dusk desk, cream paper"
	},
	{
		id: "paper",
		name: "Paper",
		line: "Daylight linen"
	},
	{
		id: "glass",
		name: "Glass",
		line: "Cool night steel"
	},
	{
		id: "moss",
		name: "Moss",
		line: "Forest shade"
	}
];
var LAYOUTS = [
	{
		id: "stickies",
		name: "Stickies",
		line: "Notes float on the desk"
	},
	{
		id: "sidebar",
		name: "Sidebar",
		line: "A quiet column on the right"
	},
	{
		id: "tray",
		name: "Tray only",
		line: "Hidden until you ask"
	}
];
function Hub() {
	const open = useLumen((s) => s.hubOpen);
	const setHubOpen = useLumen((s) => s.setHubOpen);
	const theme = useLumen((s) => s.theme);
	const setTheme = useLumen((s) => s.setTheme);
	const layout = useLumen((s) => s.layout);
	const setLayout = useLumen((s) => s.setLayout);
	const pip = useLumen((s) => s.pip);
	const setPipEnabled = useLumen((s) => s.setPipEnabled);
	const requestNoteFromPip = useLumen((s) => s.requestNoteFromPip);
	const notes = useLumen((s) => s.notes);
	const reminders = useLumen((s) => s.reminders);
	const addReminder = useLumen((s) => s.addReminder);
	const fireReminder = useLumen((s) => s.fireReminder);
	const completeReminder = useLumen((s) => s.completeReminder);
	const resetDemo = useLumen((s) => s.resetDemo);
	const [title, setTitle] = (0, import_react.useState)("");
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn("absolute z-[70] flex flex-col overflow-hidden bg-surface text-fg shadow-[var(--shadow-float)]", "inset-x-3 bottom-16 top-auto max-h-[min(560px,calc(100%-5.5rem))] rounded-xl sm:inset-auto sm:top-16 sm:left-6 sm:h-[520px] sm:w-[380px]"),
		role: "dialog",
		"aria-label": "Lumen hub",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center justify-between px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-lg font-medium tracking-tight",
					children: "Lumen"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: "Desk companion · local only"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setHubOpen(false),
					className: "flex size-9 items-center justify-center rounded-md hover:bg-elevated",
					"aria-label": "Close hub",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "look",
				className: "flex min-h-0 flex-1 flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-3 pt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "look",
							children: "Look"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "pip",
							children: "Pip"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "remind",
							children: "Remind"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "about",
							children: "About"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-h-0 flex-1 overflow-y-auto px-4 py-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
							value: "look",
							className: "space-y-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mb-2 text-xs font-medium tracking-wide text-muted uppercase",
									children: "Theme"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-2 gap-2",
									children: THEMES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setTheme(t.id),
										className: cn("rounded-lg bg-elevated px-3 py-3 text-left shadow-[var(--shadow-border)]", theme === t.id && "ring-2 ring-accent"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-medium",
											children: t.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted",
											children: t.line
										})]
									}, t.id))
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mb-2 text-xs font-medium tracking-wide text-muted uppercase",
									children: "Layout"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-2",
									children: LAYOUTS.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setLayout(l.id),
										className: cn("flex w-full items-center justify-between rounded-lg bg-elevated px-3 py-3 text-left shadow-[var(--shadow-border)]", layout === l.id && "ring-2 ring-accent"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-sm font-medium",
											children: l.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-xs text-muted",
											children: l.line
										})] }), layout === l.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "On" }) : null]
									}, l.id))
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-subtle",
									children: [notes.length, " notes on this desk"]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
							value: "pip",
							className: "space-y-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-3 rounded-lg bg-elevated px-3 py-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium",
										children: "Show Pip"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: "Walks the desk. Click to fetch a note."
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
										checked: pip.enabled,
										onCheckedChange: setPipEnabled
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm leading-relaxed text-muted",
									children: "Pip is a desktop pet. In a real install this is a tiny always-on-top window the core moves around your monitors — toggle off and the process is gone."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									onClick: requestNoteFromPip,
									disabled: !pip.enabled,
									className: "w-full",
									children: "Ask Pip for a note"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
							value: "remind",
							className: "space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "flex gap-2",
								onSubmit: (e) => {
									e.preventDefault();
									const t = title.trim();
									if (!t) return;
									addReminder(t, 8e3);
									setTitle("");
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: title,
									onChange: (e) => setTitle(e.target.value),
									placeholder: "Remind me in 8 seconds…",
									"aria-label": "Reminder title"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									size: "sm",
									className: "h-10 shrink-0",
									children: "Add"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "space-y-2",
								children: reminders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
									className: "text-sm text-muted",
									children: "No reminders yet."
								}) : reminders.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center justify-between gap-2 rounded-lg bg-elevated px-3 py-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: cn("truncate text-sm", r.done && "text-subtle line-through"),
											children: r.title
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] text-subtle tabular-nums",
											children: r.done ? "Done" : new Date(r.fireAt).toLocaleTimeString()
										})]
									}), !r.done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										onClick: () => fireReminder(r.id),
										children: "Fire"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										onClick: () => completeReminder(r.id),
										children: "Hide"
									})]
								}, r.id))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
							value: "about",
							className: "space-y-3 text-sm leading-relaxed text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "This preview simulates a tray companion: stickies, themes, reminders, and Pip fetching paper across the desk." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "A shipped Windows build would use Tauri 2 — Rust core idle in the tray, WebView only when a window is open. Target idle RAM is under 40 MB with Pip off." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									onClick: resetDemo,
									className: "w-full",
									children: "Reset demo"
								})
							]
						})
					]
				})]
			})
		]
	});
}
function Onboarding() {
	const open = useLumen((s) => s.onboarding);
	const dismiss = useLumen((s) => s.dismissOnboarding);
	const setPipEnabled = useLumen((s) => s.setPipEnabled);
	const requestNoteFromPip = useLumen((s) => s.requestNoteFromPip);
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-[85] flex items-center justify-center bg-bg/50 px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-xl bg-surface p-6 shadow-[var(--shadow-float)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-2xl font-medium tracking-tight text-fg",
					children: "Lumen"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted",
					children: "A quiet desk. Notes you can pin. A small companion who will walk over with paper when you ask."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
					className: "mt-5 space-y-3 text-sm text-fg",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-elevated text-xs font-medium tabular-nums",
								children: "1"
							}), "Drag a sticky. Change its tint."]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-elevated text-xs font-medium tabular-nums",
								children: "2"
							}), "Open the hub from the tray — four looks, three layouts."]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-elevated text-xs font-medium tabular-nums",
								children: "3"
							}), "Click Pip. He fetches a note and brings it to you."]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-col gap-2 sm:flex-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "flex-1",
						onClick: () => {
							setPipEnabled(true);
							dismiss();
							window.setTimeout(() => requestNoteFromPip(), 400);
						},
						children: "Let Pip bring a note"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "flex-1",
						onClick: dismiss,
						children: "I will look around"
					})]
				})
			]
		})
	});
}
function QuickCapture() {
	const open = useLumen((s) => s.captureOpen);
	const setCaptureOpen = useLumen((s) => s.setCaptureOpen);
	const addNote = useLumen((s) => s.addNote);
	const [body, setBody] = (0, import_react.useState)("");
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (open) {
			setBody("");
			const t = window.setTimeout(() => ref.current?.focus(), 40);
			return () => window.clearTimeout(t);
		}
	}, [open]);
	if (!open) return null;
	const save = () => {
		const text = body.trim();
		if (text) addNote({
			body: text,
			x: 30 + Math.random() * 20,
			y: 24,
			tint: "cream"
		});
		setCaptureOpen(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute inset-0 z-[75] flex items-start justify-center px-4 pt-[18vh] sm:pt-[22vh]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "absolute inset-0 bg-bg/40",
			"aria-label": "Dismiss capture",
			onClick: () => setCaptureOpen(false)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "relative w-full max-w-md rounded-xl bg-surface p-4 shadow-[var(--shadow-float)]",
			onSubmit: (e) => {
				e.preventDefault();
				save();
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 font-display text-base font-medium",
					children: "Quick note"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					ref,
					value: body,
					onChange: (e) => setBody(e.target.value),
					onKeyDown: (e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							save();
						}
					},
					rows: 4,
					placeholder: "Type and press Enter",
					className: "w-full resize-none rounded-md bg-elevated px-3 py-2 text-sm text-fg outline-none placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-accent/60"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-subtle",
						children: "Shift + Enter for a new line"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							size: "sm",
							onClick: () => setCaptureOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							size: "sm",
							children: "Save"
						})]
					})]
				})
			]
		})]
	});
}
function StickyNote({ note, stacked }) {
	const updateNote = useLumen((s) => s.updateNote);
	const removeNote = useLumen((s) => s.removeNote);
	const bringNote = useLumen((s) => s.bringNote);
	const drag = (0, import_react.useRef)(null);
	const onPointerDown = (e) => {
		if (stacked) return;
		if (e.target.closest("textarea,button")) return;
		bringNote(note.id);
		const parent = e.currentTarget.parentElement.getBoundingClientRect();
		drag.current = {
			dx: (e.clientX - parent.left) / parent.width * 100 - note.x,
			dy: (e.clientY - parent.top) / parent.height * 100 - note.y
		};
		e.currentTarget.setPointerCapture(e.pointerId);
	};
	const onPointerMove = (e) => {
		if (!drag.current) return;
		const parent = e.currentTarget.parentElement.getBoundingClientRect();
		const maxX = parent.width < 640 ? 48 : 78;
		const maxY = parent.height < 700 ? 58 : 70;
		const x = Math.max(2, Math.min(maxX, (e.clientX - parent.left) / parent.width * 100 - drag.current.dx));
		const y = Math.max(4, Math.min(maxY, (e.clientY - parent.top) / parent.height * 100 - drag.current.dy));
		updateNote(note.id, {
			x,
			y
		});
	};
	const onPointerUp = () => {
		drag.current = null;
	};
	const style = stacked ? void 0 : {
		left: `${note.x}%`,
		top: `${note.y}%`,
		transform: `rotate(${note.rot}deg)`,
		zIndex: note.z + 10
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: cn("rounded-lg p-3 shadow-[var(--shadow-float)]", stacked ? "relative w-full" : "absolute w-40 sm:w-52", `note-${note.tint}`),
		style,
		onPointerDown,
		onPointerMove,
		onPointerUp,
		onPointerCancel: onPointerUp,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "mb-2 flex items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-1",
				children: NOTE_TINTS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": t.label,
					onClick: () => updateNote(note.id, { tint: t.id }),
					className: "relative flex size-7 items-center justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-3 rounded-full shadow-[var(--shadow-border)]", `note-${t.id}`, note.tint === t.id ? "ring-1 ring-fg/30" : "opacity-70") })
				}, t.id))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "Delete note",
				onClick: () => removeNote(note.id),
				className: "flex size-7 items-center justify-center rounded-sm opacity-50 hover:opacity-100",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
			value: note.body,
			onChange: (e) => updateNote(note.id, { body: e.target.value }),
			onFocus: () => bringNote(note.id),
			placeholder: "Write…",
			rows: 5,
			suppressHydrationWarning: true,
			className: "w-full resize-none bg-transparent text-sm leading-snug text-inherit outline-none placeholder:opacity-40"
		})]
	});
}
function ToastStack() {
	const toasts = useLumen((s) => s.toasts);
	const dismissToast = useLumen((s) => s.dismissToast);
	(0, import_react.useEffect)(() => {
		if (toasts.length === 0) return;
		const last = toasts[toasts.length - 1];
		const id = window.setTimeout(() => dismissToast(last.id), 5200);
		return () => window.clearTimeout(id);
	}, [toasts, dismissToast]);
	if (toasts.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none absolute top-4 right-3 z-[65] flex w-[min(320px,calc(100%-1.5rem))] flex-col gap-2",
		children: toasts.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
			className: "pointer-events-auto rounded-lg bg-elevated px-3 py-3 shadow-[var(--shadow-float)]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-wide text-muted uppercase",
					children: t.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-sm text-fg",
					children: t.body
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "flex size-8 items-center justify-center rounded-sm text-muted hover:text-fg",
					onClick: () => dismissToast(t.id),
					"aria-label": "Dismiss",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
				})]
			})
		}, t.id))
	});
}
function Clock() {
	const [now, setNow] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		setNow(/* @__PURE__ */ new Date());
		const id = window.setInterval(() => setNow(/* @__PURE__ */ new Date()), 1e3);
		return () => window.clearInterval(id);
	}, []);
	if (!now) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "tabular-nums text-xs font-medium text-tray-fg/80",
		children: "--:--"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {
		className: "tabular-nums text-xs font-medium text-tray-fg/80",
		dateTime: now.toISOString(),
		children: now.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit"
		})
	});
}
function Tray() {
	const setHubOpen = useLumen((s) => s.setHubOpen);
	const hubOpen = useLumen((s) => s.hubOpen);
	const setCaptureOpen = useLumen((s) => s.setCaptureOpen);
	const pipEnabled = useLumen((s) => s.pip.enabled);
	const setPipEnabled = useLumen((s) => s.setPipEnabled);
	const requestNoteFromPip = useLumen((s) => s.requestNoteFromPip);
	const pending = useLumen((s) => s.reminders.filter((r) => !r.done).length);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "absolute inset-x-0 bottom-0 z-[80] flex h-12 items-center justify-between gap-2 border-t border-white/5 bg-tray px-3 text-tray-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-1.5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setHubOpen(!hubOpen),
					className: "flex h-9 items-center gap-2 rounded-md px-2.5 hover:bg-white/5",
					"aria-pressed": hubOpen,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-6 place-items-center rounded-sm bg-accent/20",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "block size-2.5 rounded-full bg-accent" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden font-display text-sm font-medium sm:inline",
						children: "Lumen"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setCaptureOpen(true),
					className: "flex size-9 items-center justify-center rounded-md hover:bg-white/5",
					"aria-label": "Quick note",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "size-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setHubOpen(true),
					className: "relative flex size-9 items-center justify-center rounded-md hover:bg-white/5",
					"aria-label": "Reminders",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4" }), pending > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-1.5 right-1.5 size-1.5 rounded-full bg-accent" }) : null]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-1.5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => pipEnabled ? requestNoteFromPip() : setPipEnabled(true),
					className: "hidden h-9 items-center gap-1 rounded-md px-1.5 hover:bg-white/5 sm:flex",
					"aria-label": pipEnabled ? "Ask Pip for a note" : "Show Pip",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block h-8 w-8 scale-75",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PipFigure, {
							walking: false,
							carrying: false,
							facing: -1
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setHubOpen(true),
					className: "flex size-9 items-center justify-center rounded-md hover:bg-white/5",
					"aria-label": "Settings",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "size-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {})
			]
		})]
	});
}
function PaperWell() {
	const request = useLumen((s) => s.requestNoteFromPip);
	const enabled = useLumen((s) => s.pip.enabled);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: request,
		className: "absolute right-[6%] bottom-24 z-[5] hidden w-16 sm:block",
		"aria-label": "Paper stack — ask Pip to fetch",
		disabled: !enabled,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "relative block h-20",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-x-1 top-3 h-14 rotate-[-8deg] rounded-sm bg-[var(--note-mist)] shadow-[var(--shadow-border)]" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-x-0.5 top-2 h-14 rotate-[4deg] rounded-sm bg-[var(--note-sage)] shadow-[var(--shadow-border)]" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-x-0 top-0 h-14 rounded-sm bg-[var(--note-cream)] shadow-[var(--shadow-float)]" })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mt-1 block text-center text-[10px] font-medium tracking-wide text-fg/50 uppercase",
			children: "Paper"
		})]
	});
}
function DesktopScene() {
	const theme = useLumen((s) => s.theme);
	const layout = useLumen((s) => s.layout);
	const notes = useLumen((s) => s.notes);
	const markHydrated = useLumen((s) => s.markHydrated);
	const setCaptureOpen = useLumen((s) => s.setCaptureOpen);
	const setHubOpen = useLumen((s) => s.setHubOpen);
	const fireReminder = useLumen((s) => s.fireReminder);
	(0, import_react.useEffect)(() => {
		Promise.resolve(useLumen.persist.rehydrate()).then(() => markHydrated());
	}, [markHydrated]);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "n") {
				e.preventDefault();
				setCaptureOpen(true);
			}
			if (e.key === "Escape") {
				setCaptureOpen(false);
				setHubOpen(false);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [setCaptureOpen, setHubOpen]);
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => {
			const now = Date.now();
			for (const r of useLumen.getState().reminders) if (!r.done && r.fireAt <= now) fireReminder(r.id);
		}, 1e3);
		return () => window.clearInterval(id);
	}, [fireReminder]);
	const visibleNotes = layout === "tray" ? [] : notes;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-theme": theme,
		className: "h-dvh min-h-dvh bg-bg text-fg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "wallpaper relative h-full overflow-hidden",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-x-[12%] top-[8%] hidden h-[38%] rounded-sm bg-[var(--wall-glow)]/10 sm:block" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaperWell, {}),
				layout === "sidebar" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute top-4 right-3 bottom-16 z-20 flex w-56 max-w-[calc(100%-1.5rem)] flex-col gap-3 overflow-y-auto",
					children: visibleNotes.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StickyNote, {
						note: n,
						stacked: true
					}, n.id))
				}) : visibleNotes.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StickyNote, { note: n }, n.id)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Companion, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToastStack, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hub, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickCapture, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Onboarding, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tray, {})
			]
		})
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DesktopScene, {});
}
//#endregion
export { Home as component };
