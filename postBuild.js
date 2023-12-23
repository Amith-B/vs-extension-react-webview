const fs = require('fs');
const path = require('path');

const mainFile = 'main';

const jsBuildPath = path.resolve(__dirname, 'media', 'static', 'js');
// Get the hashed jds filename
const jdsHashedFilename = fs
	.readdirSync(jsBuildPath)
	.find((filename) => filename.startsWith(mainFile) && filename.endsWith('js'));

// Rename the file
fs.renameSync(
	path.join(jsBuildPath, jdsHashedFilename),
	path.join(jsBuildPath, `${mainFile}.js`)
);

const cssBuildPath = path.resolve(__dirname, 'media', 'static', 'css');
// Get the hashed jds filename
const cssHashedFilename = fs
	.readdirSync(cssBuildPath)
	.find((filename) => filename.startsWith(mainFile) && filename.endsWith('css'));

// Rename the file
fs.renameSync(
	path.join(cssBuildPath, cssHashedFilename),
	path.join(cssBuildPath, `${mainFile}.css`)
);

console.log('Build files renamed successfully.');
