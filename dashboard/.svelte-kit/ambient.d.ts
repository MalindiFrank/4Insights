
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```sh
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const SSH_AGENT_LAUNCHER: string;
	export const TERM: string;
	export const SYSTEMD_EXEC_PID: string;
	export const XDG_SESSION_CLASS: string;
	export const NVM_CD_FLAGS: string;
	export const USER: string;
	export const LESSOPEN: string;
	export const VTE_VERSION: string;
	export const XDG_CONFIG_DIRS: string;
	export const QT_IM_MODULE: string;
	export const XDG_DATA_DIRS: string;
	export const SSH_AUTH_SOCK: string;
	export const LS_COLORS: string;
	export const USERNAME: string;
	export const LESSCLOSE: string;
	export const XDG_SESSION_TYPE: string;
	export const INIT_CWD: string;
	export const npm_config_user_agent: string;
	export const GNOME_DESKTOP_SESSION_ID: string;
	export const DBUS_SESSION_BUS_ADDRESS: string;
	export const DESKTOP_SESSION: string;
	export const OLDPWD: string;
	export const LANG: string;
	export const _: string;
	export const GTK_MODULES: string;
	export const IM_CONFIG_PHASE: string;
	export const NODE_ENV: string;
	export const SESSION_MANAGER: string;
	export const LOGNAME: string;
	export const NVM_INC: string;
	export const XMODIFIERS: string;
	export const LANGUAGE: string;
	export const HOME: string;
	export const GNOME_SHELL_SESSION_MODE: string;
	export const NVM_BIN: string;
	export const NVM_DIR: string;
	export const GNOME_TERMINAL_SERVICE: string;
	export const COLORTERM: string;
	export const PATH: string;
	export const DISPLAY: string;
	export const WAYLAND_DISPLAY: string;
	export const QT_ACCESSIBILITY: string;
	export const PWD: string;
	export const XAUTHORITY: string;
	export const GNOME_SETUP_DISPLAY: string;
	export const XDG_CURRENT_DESKTOP: string;
	export const XDG_MENU_PREFIX: string;
	export const SHELL: string;
	export const SHLVL: string;
	export const XDG_RUNTIME_DIR: string;
	export const GNOME_TERMINAL_SCREEN: string;
	export const XDG_SESSION_DESKTOP: string;
	export const GDMSESSION: string;
}

/**
 * Similar to [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		SSH_AGENT_LAUNCHER: string;
		TERM: string;
		SYSTEMD_EXEC_PID: string;
		XDG_SESSION_CLASS: string;
		NVM_CD_FLAGS: string;
		USER: string;
		LESSOPEN: string;
		VTE_VERSION: string;
		XDG_CONFIG_DIRS: string;
		QT_IM_MODULE: string;
		XDG_DATA_DIRS: string;
		SSH_AUTH_SOCK: string;
		LS_COLORS: string;
		USERNAME: string;
		LESSCLOSE: string;
		XDG_SESSION_TYPE: string;
		INIT_CWD: string;
		npm_config_user_agent: string;
		GNOME_DESKTOP_SESSION_ID: string;
		DBUS_SESSION_BUS_ADDRESS: string;
		DESKTOP_SESSION: string;
		OLDPWD: string;
		LANG: string;
		_: string;
		GTK_MODULES: string;
		IM_CONFIG_PHASE: string;
		NODE_ENV: string;
		SESSION_MANAGER: string;
		LOGNAME: string;
		NVM_INC: string;
		XMODIFIERS: string;
		LANGUAGE: string;
		HOME: string;
		GNOME_SHELL_SESSION_MODE: string;
		NVM_BIN: string;
		NVM_DIR: string;
		GNOME_TERMINAL_SERVICE: string;
		COLORTERM: string;
		PATH: string;
		DISPLAY: string;
		WAYLAND_DISPLAY: string;
		QT_ACCESSIBILITY: string;
		PWD: string;
		XAUTHORITY: string;
		GNOME_SETUP_DISPLAY: string;
		XDG_CURRENT_DESKTOP: string;
		XDG_MENU_PREFIX: string;
		SHELL: string;
		SHLVL: string;
		XDG_RUNTIME_DIR: string;
		GNOME_TERMINAL_SCREEN: string;
		XDG_SESSION_DESKTOP: string;
		GDMSESSION: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
