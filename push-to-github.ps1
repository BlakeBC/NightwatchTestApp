# GitHub Push Script for NightwatchTestApp
# Usage: .\push-to-github.ps1 -GitHubUser <your-github-username> -RepoName <repository-name>

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubUser,

    [Parameter(Mandatory=$true)]
    [string]$RepoName
)

Write-Host "Adding GitHub remote..." -ForegroundColor Green
git remote add origin "https://github.com/$GitHubUser/$RepoName.git"

Write-Host "`nCurrent remotes:" -ForegroundColor Yellow
git remote -v

Write-Host "`nPushing to GitHub..." -ForegroundColor Green
git branch -M main
git push -u origin main

Write-Host "`n✅ Successfully pushed to GitHub!" -ForegroundColor Green
Write-Host "Repository URL: https://github.com/$GitHubUser/$RepoName" -ForegroundColor Cyan

Write-Host "`nAzure DevOps Pipeline Setup:" -ForegroundColor Yellow
Write-Host "1. Import this repository in Azure DevOps"
Write-Host "2. Create a new pipeline and select 'azure-pipelines.yml'"
Write-Host "3. For advanced features, use 'azure-pipelines-advanced.yml'"

Write-Host "`nDon't forget to:" -ForegroundColor Yellow
Write-Host "- Enable GitHub Actions if you want CI/CD there too"
Write-Host "- Set up branch protection rules"
Write-Host "- Configure Azure DevOps service connection to GitHub"