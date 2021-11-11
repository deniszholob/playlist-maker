// Imports
const iLibCoverage = require('istanbul-lib-coverage');
const iLibReport = require('istanbul-lib-report');
const iReports = require('istanbul-reports');
const glob = require('glob');
const path = require('path');

// Constants
const map = iLibCoverage.createCoverageMap();

// https://github.com/istanbuljs/istanbuljs/tree/master/packages/istanbul-reports/lib
// 'clover', 'cobertura', 'html-spa', 'html', 'json-summary', 'json', 'lcov', 'lcovonly', 'none', 'teamcity', 'text-lcov', 'text-summary', 'text'
const REPORT_TYPES = ['html', 'json'];


function main() {
  console.log(`Merging Coverage Reports...`);
  mergeCoverage()
    .then(() => console.log(`Done!`))
    .catch((e) => console.error(e))
}

/** Generates a merged coverage report from all coverage json files in the coverage dir */
async function mergeCoverage() {
  const coverageDir = path.resolve('coverage');
  const mergedDir = path.resolve(coverageDir, 'report');

  // Gets all the coverage files and merge them
  const files = glob.sync(`${coverageDir}/**/coverage-final.json`);
  files.forEach(f => map.merge(require(f)));

  // Creates a context for report generation
  const context = iLibReport.createContext({
    dir: mergedDir,
    coverageMap: map
  });

  REPORT_TYPES.forEach((t) => {
    const report = iReports.create(t, {
      metricsToShow: ['statements', 'branches', 'functions', 'lines'],
    });
    report.execute(context);
  });
}

main();
