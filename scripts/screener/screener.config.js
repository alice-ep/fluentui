require('../babel/register');

const cp = require('child_process');

function getCurrentHash() {
  try {
    const buffer = cp.execSync('git rev-list --parents -n 1 HEAD', {
      stdio: ['pipe', 'pipe', process.stderr],
    });

    if (buffer) {
      // The command returns a list of hashes, the last one is the one we want
      return buffer.toString().trim().split(' ').pop();
    }
  } catch (e) {
    console.error('Cannot get current git hash');
    process.exit(1);
  }

  return '';
}

const config = require('../config').default;

const { compilerOptions } = require(config.paths.docs('tsconfig.json'));

require('tsconfig-paths').register({
  baseUrl: config.path_base,
  paths: compilerOptions.paths,
});

const baseBranch = 'master';

/**
 *
 * @param {Object} options
 * @param {string} options.screenerApiKey
 * @param {string} options.sourceBranchName
 * @param {string} options.deployUrl
 * @returns {import('./screener.types').ScreenerRunnerConfig}
 */
function getConfig({ screenerApiKey, sourceBranchName, deployUrl }) {
  // https://github.com/screener-io/screener-runner
  return {
    baseUrl: `${deployUrl}/react-northstar-screener`,
    apiKey: screenerApiKey,
    projectRepo: 'microsoft/fluentui/fluentui',

    diffOptions: {
      structure: true,
      layout: true,
      style: true,
      content: true,
      minLayoutPosition: 1, // Optional threshold for Layout changes. Defaults to 4 pixels.
      minLayoutDimension: 1, // Optional threshold for Layout changes. Defaults to 10 pixels.
      minShiftGraphic: 1, // Optional threshold for pixel shifts in graphics.
      compareSVGDOM: false, // Pass if SVG DOM is the same. Defaults to false.
    },
    states: [],

    alwaysAcceptBaseBranch: true,
    baseBranch,
    failureExitCode: 0,

    ...(sourceBranchName !== 'master'
      ? {
          commit: getCurrentHash(),
        }
      : null),
  };
}
module.exports = getConfig;
