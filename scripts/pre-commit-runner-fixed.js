// ... [previous code remains the same until line 190] ...
    // Run tests for all test files that were just generated or modified
    if (testFiles.length > 0) {
      console.log('\n🚀 Running tests for modified files...');
      let allTestsPassed = true;
      
      for (const { testPath, sourceFile } of testFiles) {
        console.log(`\n🔍 Running tests for ${path.basename(sourceFile)}`);
        const testPassed = await runTests(testPath);
        if (!testPassed) {
          allTestsPassed = false;
        }
      }
      
      if (!allTestsPassed) {
        console.error('\n❌ Some tests failed. Please fix the issues before committing.');
        console.log('   To commit anyway, use: git commit --no-verify\n');
        return 1; // Block the commit if tests fail
      }
      
      console.log('\n✅ All tests completed successfully!');
    } else {
      console.log('\nℹ️  No test files to run');
    }
    
    return 0;
    
  } catch (error) {
    console.error('❌ Error during execution:', error.message);
    return 1;
  }
}

// Run the function and exit with the appropriate status code
run().then(code => {
  process.exit(code);
}).catch(err => {
  console.error('❌ Unhandled error:', err);
  process.exit(1);
});
