const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');
const { execSync } = require('child_process');
const AIAnalyzer = require('./ai-analyzer');
const TestGenerator = require('./test-generator');
const GitUtils = require('./git-utils');
const Config = require('./config');

class AIPrecommitHook {
  constructor() {
    this.config = new Config();
    this.analyzer = new AIAnalyzer(this.config);
    this.testGenerator = new TestGenerator(this.config);
    this.gitUtils = new GitUtils();
    this.results = {
      analyzed: 0,
      issuesFound: 0,
      issuesFixed: 0,
      testsCases: 0,
      errors: []
    };
  }

  async run() {
    console.log(chalk.blue.bold('\n🚀 AI Pre-commit Hook v1.0.0\n'));
    
    try {
      const stagedFiles = this.gitUtils.getStagedFiles();
      
      if (stagedFiles.length === 0) {
        console.log(chalk.yellow('⚠️  No staged files found'));
        return true;
      }

      const filteredFiles = this.filterSupportedFiles(stagedFiles);
      
      if (filteredFiles.length === 0) {
        console.log(chalk.yellow('⚠️  No supported file types in staged changes'));
        return true;
      }

      console.log(chalk.cyan(`🔍 Analyzing ${filteredFiles.length} staged files...\n`));

      await this.analyzeFiles(filteredFiles);
      await this.generateTests(filteredFiles);
      
      if (this.config.get('rules.autoFix')) {
        await this.applyFixes(filteredFiles);
      }

      if (this.config.get('rules.interactive')) {
        await this.reviewChanges();
      }

      this.printSummary();
      return this.shouldProceedWithCommit();

    } catch (error) {
      console.error(chalk.red(`\n❌ Error: ${error.message}`));
      this.results.errors.push(error.message);
      return !this.config.get('rules.strictMode');
    }
  }

  filterSupportedFiles(files) {
    const supportedLangs = this.config.get('rules.languages') || ['javascript', 'typescript'];
    const ignorePatterns = this.config.get('ignorePatterns') || [];
    
    return files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      const supported = this.isExtensionSupported(ext, supportedLangs);
      const ignored = ignorePatterns.some(pattern => file.includes(pattern));
      return supported && !ignored;
    });
  }

  isExtensionSupported(ext, langs) {
    const extMap = {
      '.js': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.jsx': 'javascript'
    };
    return langs.includes(extMap[ext]);
  }

  async analyzeFiles(files) {
    const spinner = ora('Analyzing code quality...').start();
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const analysis = await this.analyzer.analyze(content, file);
        
        this.displayFileAnalysis(file, analysis);
        this.results.analyzed++;
        this.results.issuesFound += analysis.issues.length;
        
      } catch (error) {
        spinner.fail(`Error analyzing ${file}`);
        this.results.errors.push(`${file}: ${error.message}`);
      }
    }
    
    spinner.succeed('Code analysis complete');
  }

  displayFileAnalysis(file, analysis) {
    console.log(chalk.bold(`\n${file}`));
    console.log(`  ${chalk.green('✓')} Code Quality: ${analysis.quality}/100`);
    
    if (analysis.issues.length > 0) {
      console.log(`  ${chalk.yellow('⚠️')}  Found ${analysis.issues.length} issues`);
      analysis.issues.forEach(issue => {
        const icon = issue.severity === 'critical' ? chalk.red('🔴') : 
                     issue.severity === 'warning' ? chalk.yellow('🟡') : 
                     chalk.blue('🔵');
        console.log(`    ${icon} [${issue.severity}] ${issue.message}`);
      });
    }
    
    if (analysis.improvements.length > 0) {
      console.log(`  ${chalk.cyan('✨')} Suggested ${analysis.improvements.length} improvements`);
    }
  }

  async generateTests(files) {
    if (!this.config.get('rules.requireTests')) return;
    
    const spinner = ora('Generating test cases...').start();
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const tests = await this.testGenerator.generate(content, file);
        
        if (tests.length > 0) {
          console.log(chalk.green(`\n✅ Generated ${tests.length} test cases for ${file}`));
          this.results.testsCases += tests.length;
        }
        
      } catch (error) {
        this.results.errors.push(`Test generation for ${file}: ${error.message}`);
      }
    }
    
    spinner.succeed('Test generation complete');
  }

  async applyFixes(files) {
    const spinner = ora('Applying auto-fixes...').start();
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const fixed = await this.analyzer.autoFix(content, file);
        
        if (fixed.improved) {
          fs.writeFileSync(file, fixed.content);
          this.gitUtils.stageFile(file);
          this.results.issuesFixed += fixed.fixes.length;
          console.log(chalk.green(`✔ Fixed ${fixed.fixes.length} issues in ${file}`));
        }
        
      } catch (error) {
        this.results.errors.push(`Auto-fix for ${file}: ${error.message}`);
      }
    }
    
    spinner.succeed('Auto-fixes applied');
  }

  async reviewChanges() {
    if (this.results.issuesFixed === 0) return;
    
    const { proceed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: `${this.results.issuesFixed} issues were fixed. Proceed with commit?`,
        default: true
      }
    ]);
    
    return proceed;
  }

  printSummary() {
    console.log(chalk.bold.cyan('\n📊 Summary:'));
    console.log(`  ${chalk.green('✔')} ${this.results.analyzed} files analyzed`);
    console.log(`  ${chalk.yellow('⚠️')}  ${this.results.issuesFound} issues found`);
    console.log(`  ${chalk.green('✔')} ${this.results.issuesFixed} issues fixed`);
    console.log(`  ${chalk.green('✔')} ${this.results.testsCases} test cases generated`);
    
    if (this.results.errors.length > 0) {
      console.log(chalk.red('\n❌ Errors:'));
      this.results.errors.forEach(err => console.log(`  - ${err}`));
    }
    
    console.log();
  }

  shouldProceedWithCommit() {
    const critical = this.results.errors.filter(e => e.includes('critical')).length;
    return critical === 0;
  }
}

module.exports = AIPrecommitHook;
