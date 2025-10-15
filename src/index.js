class PreCommitHook {
  shouldProceedWithCommit() {
    const errors = this.results.errors.filter(
      (e) => e.includes('critical') || e.includes('warning') || e.includes('issue')
    );
    return errors.length === 0;
  }
}

export default PreCommitHook;
