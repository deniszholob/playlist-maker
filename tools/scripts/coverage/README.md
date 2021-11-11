# Test Coverage Merger Script

Combines all coverage reports into one

## Usage

### Prerequisites
* Make sure [jest config](../../../jest.preset.js) has `json` in its `coverageReporters` array
  ```js
  module.exports = { coverageReporters: ['json'] };
  ```
* Run  tests with `--codeCoverage` flag to generate `coverage-final.json` files in the [coverage](../../../coverage) directory.
* The [package.json](../../../package.json) should have the latest script commands

### Running the script
* `cd` into the repo root folder
* Run 
  ```properties
    npm run gen-combined-coverage
  ```
  OR
  ```properties
    node ./tools/scripts/coverage/merge-coverage.js
  ```
* This should generate a complete [coverage report](../../../coverage/report/index.html)

# References
* https://github.com/angular/angular-cli/issues/11268
* https://github.com/facebook/jest/blob/main/scripts/mapCoverage.js
* https://medium.com/@kushmisra7/one-report-for-all-test-cases-easily-merging-multiple-tests-reports-b0f5e5211a2a
* https://dev.to/rupeshtiwari/merge-and-publish-code-coverage-for-nx-workspace-in-azure-ci-pipeline-1pk5
* https://yonatankra.com/how-to-create-a-workspace-coverage-report-in-nrwl-nx-monorepo/
