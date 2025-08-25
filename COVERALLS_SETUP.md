# 🧪 Coveralls Setup Guide

This guide explains how to set up and use Coveralls for test coverage tracking in the PeluApp project.

## 📋 Prerequisites

- GitHub repository with GitHub Actions enabled
- Node.js project with Karma and Jasmine testing setup
- Coveralls account (free for public repositories)

## 🔧 Setup Steps

### 1. Coveralls Account Setup

1. **Sign up** at [coveralls.io](https://coveralls.io)
2. **Connect your GitHub account**
3. **Add your repository** `ArnauM13/pelu-app`
4. **Enable repository** in Coveralls dashboard

### 2. Repository Configuration

The following files have been configured:

#### **Coveralls Token**
- **No cal token manual** per repositoris públics
- **GitHub Actions** usa `secrets.GITHUB_TOKEN` automàticament
- **Més simple** i segur per repos públics

#### `karma.conf.js`
- Configures Karma to generate coverage reports
- Uses Chrome Headless for CI environments (no GUI required)
- Generates LCOV reports for Coveralls integration

#### `.coveralls.yml`
- **No cal** per repositoris públics
- GitHub Actions gestiona l'autenticació automàticament
- Més simple i segur

#### `.github/workflows/test-coverage.yml`
- GitHub Actions workflow for automated testing
- Runs tests with coverage on push and pull requests
- Uploads coverage data to Coveralls

### 3. Local Testing

Test coverage locally before pushing:

```bash
# Run tests with coverage
npm run test:coverage

# Or use the local testing script
npm run test:coverage:local
```

## 📊 Understanding Coverage Reports

### Coverage Metrics

- **Statements**: Percentage of code statements executed
- **Branches**: Percentage of conditional branches executed
- **Functions**: Percentage of functions called
- **Lines**: Percentage of code lines executed

### Minimum Thresholds

The project is configured with 80% minimum coverage for:
- Statements
- Branches  
- Functions
- Lines

## 🚀 Workflow

### Automatic Process

1. **Push code** to master branch or create PR
2. **GitHub Actions** automatically runs tests
3. **Coverage data** is generated and uploaded to Coveralls
4. **Coveralls dashboard** updates with new coverage data
5. **PR comments** are added with coverage impact analysis

### Manual Process

1. **Run tests locally**: `npm run test:coverage`
2. **Check coverage report**: Open `coverage/pelu-app/index.html`
3. **Verify thresholds**: Ensure coverage meets 80% minimum
4. **Commit and push**: Coverage will be uploaded automatically

## 📈 Viewing Reports

### Coveralls Dashboard

- **Main dashboard**: [https://coveralls.io/github/ArnauM13/pelu-app](https://coveralls.io/github/ArnauM13/pelu-app?branch=master)
- **Historical trends**: Track coverage over time
- **File-by-file analysis**: Detailed coverage for each file
- **Line-by-line coverage**: See exactly which lines are covered

### Local Reports

- **HTML report**: `coverage/pelu-app/index.html`
- **Text summary**: Console output during test run
- **LCOV file**: `coverage/pelu-app/lcov.info` (for CI/CD)

## 🔍 Troubleshooting

### Common Issues

#### Coverage not uploading
- Check GitHub Actions workflow execution
- Verify Coveralls repository token
- Ensure LCOV file is generated correctly

#### Low coverage
- Add more test cases
- Focus on uncovered functions and branches
- Use coverage report to identify gaps

#### Build failures
- Check Karma configuration
- Verify all dependencies are installed
- Review test syntax and imports
- **Chrome Headless**: Ensure `ChromeHeadless` is used in `karma.conf.js` for CI environments

### Debug Mode

The GitHub Actions workflow includes debug mode:
```yaml
debug: true
```

This provides detailed logging for troubleshooting.

## 📚 Best Practices

### Writing Tests

1. **Test all public methods** in services and components
2. **Cover edge cases** and error conditions
3. **Test async operations** properly
4. **Mock external dependencies** consistently

### Maintaining Coverage

1. **Review coverage reports** regularly
2. **Set realistic thresholds** (80% is good)
3. **Focus on critical code paths**
4. **Don't sacrifice quality for coverage**

### Team Workflow

1. **Check coverage before PRs**
2. **Address coverage decreases** in PRs
3. **Use coverage comments** to guide improvements
4. **Celebrate coverage improvements**

## 🎯 Next Steps

1. **Push your changes** to trigger the first coverage run
2. **Check Coveralls dashboard** for initial results
3. **Review coverage gaps** and add tests as needed
4. **Monitor coverage trends** over time

## 📞 Support

- **Coveralls Documentation**: [https://docs.coveralls.io/](https://docs.coveralls.io/)
- **GitHub Actions**: [https://docs.github.com/en/actions](https://docs.github.com/en/actions)
- **Karma Coverage**: [https://github.com/karma-runner/karma-coverage](https://github.com/karma-runner/karma-coverage)

---

**Happy testing! 🧪✨**
