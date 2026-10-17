# Campus Life: OOPOLY

Build a polished, responsive browser-based game prototype named "Campus Life (OOPOLY)" inspired by the broad life-simulation/open-world interaction feel of Lagos Life, but with original UI, code, assets and identity. It is about student life at Ogbonnaya Onu Polytechnic, Aba Campus. Important truthfulness: do not claim the campus map/buildings are an accurate reconstruction yet; use stylized illustrative campus art and mark it as prototype/illustrative until verified reference photos are supplied. Avoid using an unverified official school logo; create an original OOPOLY-inspired emblem or wordmark and don't imply official endorsement.

Build an actually interactive playable-feeling web prototype, optimized for desktop and mobile browsers (including Android), using React + TypeScript + Tailwind/shadcn per default stack. Use CSS/SVG/canvas/Three.js only if genuinely helpful; prioritize stable and accessible implementation over ambitious performance-heavy 3D. For first milestone, implement a stylized isometric/third-person-feeling campus exploration scene with a controllable student avatar (keyboard WASD/arrow keys on desktop and on-screen joystick/buttons on touch); scenery/buildings should respond to position or clicks. If a true realtime 3D engine is unreliable in the platform, create a polished pseudo-3D/isometric explorable campus prototype and make interactions real, not a static mockup.

Design direction: a distinctive Lagos-life-inspired simulation HUD but original design. Palette deep maroon, warm gold, cream, charcoal; polished contemporary African campus look. Students must wear casual everyday clothes by default (t-shirts, jeans, shirts, hoodies, sneakers, bags). Optional formal uniform only as outfit choice: light-blue shirt and black trousers, never the default. Student can choose name, avatar style/skin tone, casual outfit, and department; department choices should be clearly labelled as example options requiring later verification against official current OOPOLY offerings. Include Computer Science, Electrical/Electronic Engineering, Mechanical Engineering, Civil Engineering, Business Administration, Accountancy, Mass Communication as prototype sample departments. Do not fabricate that this is the complete/official list.

Screens/features:
1. Cinematic title screen with "Campus Life" and "OOPOLY Edition", Play, Settings, Credits.
2. Student creation flow: name, avatar/look, clothing selection, level (ND I, ND II, HND I, HND II), department selection.
3. Main playable campus screen with a stylized illustrative Aba-campus-inspired environment, roads/path, trees, gates and campus buildings; HUD with virtual wallet in ₦, hunger/energy/mood, game day/time, minimap/location marker, interaction hints. Show current objective and in-game status. User can move around via keyboard and touch controls. At minimum make avatar position update, camera/viewport react, and proximity/click buildings show info/actions.
4. Interactable destination points: Main Gate, Administration Block, Lecture Hall, Library, Cafeteria, Workshops, Student Centre, Hostel. Clicking/interacting opens a contextual panel. Each should offer a small believable interaction (e.g. lecture hall: attend class and gain XP; library: study and gain XP/energy cost; cafeteria: buy a simple meal and reduce hunger, deduct wallet; jobs board: accept a starter task; hostel: rest and restore energy). Add a visible feedback/toast for results and disable actions when not enough virtual cash/energy.
5. Navigation drawer/phone UI like a life-sim: Map, Academics, Hustles/Jobs, Social, Inventory, Profile, Settings. These should open functional panels, not decorative links. Have working Wallet, Profile/level/XP progress, inventory/phone with several menu shortcuts, and job list with at least one accepting/completing job. Persist local game progress using localStorage; no auth/database required for this prototype.
6. Department-related academic panel: sample courses and attendance/study tasks based on selected department; label them sample/demo courses.
7. Responsive UI: desktop has sidebar HUD; mobile touch controls and menus must be usable.
8. Keep all visual labels readable, implement keyboard handling safely, add reset/new game and pause. Avoid payment APIs, real-money monetization, real sign-in, or collect unnecessary personal data.

Architecture should be maintainable, components organized. Include tasteful visual polish: typography, cards, icons, microinteractions, game-like status bars, accessible contrast, loading/transition states. Use custom illustrated scenery / CSS vector art or generated shapes rather than hotlinking unknown assets. Add a "prototype: campus layout illustrative" note in settings/credits. Don't copy Lagos Life's exact screens, logos, text, or assets; use it only as high-level genre inspiration.

Build the working prototype directly. When finished, summarize controls and honestly state what is implemented and limitations.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2816ee47-6d4d-4099-a49f-e38ced6ec07f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
