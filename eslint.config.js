export default [
	{
		languageOptions: {
			ecmaVersion: 2017, // Set to 2017 as per user's requirement
			sourceType: "module",
			globals: {
				Atomics: "readonly",
				SharedArrayBuffer: "readonly",
				$: "readonly",
				mw: "readonly",
				OO: "readonly",
				require: "readonly",
				console: "readonly",
				window: "readonly",
				document: "readonly",
				alert: "readonly",
				confirm: "readonly",
				prompt: "readonly"
			}
		},
		rules: {
			"indent": ["error", "tab"],
			"linebreak-style": ["error", "windows"],
			"quotes": ["error", "double"],
			"semi": ["error", "always"],
			"no-unused-vars": "warn", // Set to warn to allow 'e' in catch blocks
			"no-console": "off"
		}
	}
];
