import { execSync } from 'child_process';

class GitUtils {
  getStagedFiles() {
    try {
      const output = execSync('git diff --cached --name-only', { encoding: 'utf-8' });
      return output
        .trim()
        .split('\n')
        .filter((f) => f);
    } catch {
      return [];
    }
  }

  stageFile(filePath) {
    try {
      execSync(`git add "${filePath}"`);
      return true;
    } catch {
      return false;
    }
  }

  getCommitMessage() {
    try {
      return execSync('git log -1 --pretty=%B', { encoding: 'utf-8' });
    } catch {
      return '';
    }
  }
}
