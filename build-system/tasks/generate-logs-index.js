/**
 * Generate logs index task module
 * @module build-system/tasks/generate-logs-index
 * @see {@link module:gulpfile}
 * @summary Generates logs index file.
 * @description Generates an html-file which serves as a logs index.
 */

/**
 * Generates logs index file.
 * @param {Object} fs NodeJS file system module
 * @param {Function} done function
 */
module.exports = (fs, done) => {
	const logsIndexHTML = `
	<!DOCTYPE html>
	<html>
		<head>
			<style>
				body {
					height: 100%;
					margin: 0;
					padding: 0 1em;
					display: flex;
					flex-direction: row;
					flex-wrap: wrap;
					align-items: flex-start;
					align-content: flex-start;
					justify-content: stretch;
				}
				.flex-100 {
					flex: 100%;
					display: flex;
					align-items: center;
					justify-content: center;
				}
				.flex-item {
					flex: 1 1 auto;
					display: flex;
					flex-direction: row;
					flex-wrap: wrap;
					align-items: center;
					justify-content: center;
					border: 1px rgba(0, 0, 0, 0.3) dotted;
				}
				a {
					text-transform: uppercase;
				}
			</style>
		</head>
		<body onload='fitIframeHeight()'>
			<h1 class='flex-100'>Password Manager Reports and Documentation Index</h1>

			<h2 class='flex-100'>Reports</h2>

				<span class='flex-item'>
					<h3 class='flex-100'>Server Unit</h3>
					<a class='flex-item' href='unit/server/index.html' target=_blank>Spec</a>
				</span>

				<span class='flex-item'>
					<h3 class='flex-100'>Client Unit</h3>
					<a class='flex-item' href='unit/client/index.html' target=_blank>Spec</a>
					<a class='flex-item' href='coverage/html-report/index.html' target=_blank>Coverage</a>
					<small class="flex-100"><a href="client-unit-browser-console.log" target=_blank>client-unit-browser-console.log</a></small>
				</span>

				<span class='flex-item'>
					<h3 class='flex-100'>Client E2E</h3>
					<a class='flex-item' href='e2e/report/index.html' target=_blank>Spec</a>
				</span>

				<h2 class='flex-100'>Documentation</h2>

				<span class='flex-item'>
					<h3 class='flex-100'>Build System</h3>
					<a class='flex-item' href='jsdoc/build/index.html' target=_blank>JSDoc</a>
				</span>

				<span class='flex-item'>
					<h3 class='flex-100'>Server</h3>
					<a class='flex-item' href='jsdoc/server/index.html' target=_blank>JSDoc</a>
				</span>

				<span class='flex-item'>
					<h3 class='flex-100'>Client</h3>
					<a class='flex-item' href='typedoc/index.html' target=_blank>TypeDoc</a>
				</span>
		</body>
	</html>
	`;

	fs.writeFile('./logs/index.html', logsIndexHTML, (err) => {
		if (err) throw err;
		console.log('# > LOGS index.html > was created');
		done();
	});
};
