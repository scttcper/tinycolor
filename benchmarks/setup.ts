import { execFileSync } from 'node:child_process';

import type { TestProject } from 'vitest/node';

export default function setup(project: TestProject): void {
  // Vitest also inherits this setup in its generated benchmark project.
  if (!project.isRootProject()) {
    return;
  }

  const build = (): void => {
    execFileSync(process.execPath, ['--run', 'build'], {
      cwd: project.config.root,
      stdio: 'inherit',
    });
  };

  build();
  project.onTestsRerun(build);
}
