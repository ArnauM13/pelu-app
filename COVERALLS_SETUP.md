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

#### **Coveralls Token (SECURE SETUP)**
- **Repository Secret**: `COVERALLS_REPO_TOKEN` configured in GitHub repository secrets
- **Token Value**: (configured as secret, never exposed in code)
- **Security**: Token is stored in GitHub repository secrets, not in code
- **GitHub Actions** uses the secret automatically via `${{ secrets.COVERALLS_REPO_TOKEN }}`
- **Secure**: Token is never exposed in code or logs

#### `karma.conf.js`
- Uses Chrome Headless for CI environments (no GUI required)
- Generates LCOV reports for Coveralls integration

#### `.github/workflows/test-coverage.yml`
- GitHub Actions workflow for automated testing
- Runs tests with coverage on push and pull requests
- Uploads coverage data to Coveralls using secure token

### 3. GitHub Repository Secrets Setup

1. **Go to your GitHub repository**
2. **Navigate to Settings > Secrets and variables > Actions**
3. **Click "New repository secret"**
4. **Name**: `COVERALLS_REPO_TOKEN`
5. **Value**: Your Coveralls repository token (from Coveralls dashboard)
6. **Click "Add secret"**

### 4. Local Testing

Test coverage locally before pushing:

```bash
# Run tests with coverage
npm run test:coverage

# Or use the local testing script
npm run test:coverage:local
```

### 5. Verification

```bash
# Verify Coveralls setup
npm run verify:coveralls
```

## 🚀 Workflow

### Automatic Process

1. **Push code** to master branch or create PR
2. **GitHub Actions** automatically runs tests
3. **Coverage data** is generated and uploaded to Coveralls
4. **Coveralls dashboard** updates with new coverage data
5. **PR comments** are added with coverage impact analysis

### Manual Upload (if needed)

```bash
# Install coveralls locally
npm install -g coveralls

# Upload coverage manually
cat ./coverage/lcov.info | coveralls
```

## 🔒 Security Notes

- **Token is stored securely** in GitHub repository secrets
- **Never commit tokens** to version control
- **Token is automatically used** by GitHub Actions
- **No manual token management** required

## 📊 Coverage Reports

- **Coveralls Dashboard**: https://coveralls.io/github/ArnauM13/pelu-app?branch=master
- **Coverage Badge**: Automatically updated in README.md
- **PR Comments**: Coverage impact shown on pull requests

## 🛠️ Troubleshooting

### Common Issues

1. **Token not found**: Ensure `COVERALLS_REPO_TOKEN` secret is configured in GitHub
2. **Coverage not uploading**: Check GitHub Actions logs for errors
3. **Badge not updating**: Wait a few minutes for Coveralls to process

### Debug Commands

```bash
# Check if coverage report exists
ls -la ./coverage/lcov.info

# Verify LCOV format
head -10 ./coverage/lcov.info

# Test local coverage generation
npm run test:coverage
```

## 📈 Coverage Goals

- **Target**: >80% overall coverage
- **Critical paths**: >90% coverage
- **New features**: >85% coverage required
- **Legacy code**: >70% coverage maintained

## 🔄 Maintenance

- **Regular monitoring** of coverage trends
- **Coverage alerts** for significant drops
- **Automatic reporting** on all PRs
- **Coverage badges** in README and documentation
