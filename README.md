# 2Gether
Repository for the 2Gether social platform committed to bringing people closer via team sports

## Continuous Integration

GitHub Actions runs the CI workflow for pull requests targeting `main`. It installs the locked npm dependencies, runs the TypeScript type check (`npm run typecheck`), and executes the test suite (`npm test`).

View the workflow result in the pull request's **Checks** tab. A failed validation marks the check as failed and reports its logs; fix the issue and push an update to rerun CI. This repository does not currently define separate build or lint scripts, so CI does not run those checks.
