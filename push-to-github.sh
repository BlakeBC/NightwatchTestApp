#!/bin/bash

# GitHub Push Script for NightwatchTestApp
# Usage: ./push-to-github.sh <your-github-username> <repository-name>

if [ $# -ne 2 ]; then
    echo "Usage: $0 <github-username> <repository-name>"
    echo "Example: $0 yourusername NightwatchTestApp"
    exit 1
fi

GITHUB_USER=$1
REPO_NAME=$2

echo "Adding GitHub remote..."
git remote add origin "https://github.com/${GITHUB_USER}/${REPO_NAME}.git"

echo "Current remotes:"
git remote -v

echo ""
echo "Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Successfully pushed to GitHub!"
echo "Repository URL: https://github.com/${GITHUB_USER}/${REPO_NAME}"
echo ""
echo "Azure DevOps Pipeline Setup:"
echo "1. Import this repository in Azure DevOps"
echo "2. Create a new pipeline and select 'azure-pipelines.yml'"
echo "3. For advanced features, use 'azure-pipelines-advanced.yml'"
echo ""
echo "Don't forget to:"
echo "- Enable GitHub Actions if you want CI/CD there too"
echo "- Set up branch protection rules"
echo "- Configure Azure DevOps service connection to GitHub"