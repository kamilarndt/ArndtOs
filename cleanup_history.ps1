# cleanup_history.ps1
# Use this script to remove config.toml from your git history.
# IMPORTANT: Ensure you have a backup of your repository before running this.
# You might need to install 'git-filter-repo' first: pip install git-filter-repo

Write-Host "Checking for git-filter-repo..." -ForegroundColor Cyan
if (Get-Command git-filter-repo -ErrorAction SilentlyContinue) {
    Write-Host "git-filter-repo found. Starting cleanup..." -ForegroundColor Green
    git filter-repo --invert-paths --path config.toml
}
else {
    Write-Host "git-filter-repo NOT found. Falling back to git filter-branch (slower)..." -ForegroundColor Yellow
    git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch config.toml' --prune-empty --tag-name-filter cat -- --all
}

Write-Host "Cleanup complete. Remember to push with force: git push origin --force --all" -ForegroundColor Green
