$skills = "clawhub", "rust", "docker", "security", "ci-cd", "kernel-tools", "make", "cmake", "ninja", "code-review", "clang-format", "black", "prettier", "test-runner", "coverage", "github-actions", "trivy", "docker-scan", "docs-rst", "mdbook", "changelog", "kernel-patch"

foreach ($skill in $skills) {
    Write-Host "`n========================================"
    Write-Host "Processing $skill..."
    Write-Host "========================================"
    
    # Download using clawhub CLI
    $downloadOutput = docker exec -e CLAWHUB_TOKEN="clh_fvKxMQBiVvM34l30lRcgNRAPeR1_mTtnHUDpaCBK1N0" zeroclaw-runtime npx -y clawhub@latest install $skill 2>&1
    Write-Host $downloadOutput
    
    # Check if download was successful to a local path (assume /zeroclaw-data/skills/{slug})
    # Then install it locally via zeroclaw
    $installOutput = docker exec zeroclaw-runtime zeroclaw skills install /zeroclaw-data/skills/$skill 2>&1
    Write-Host $installOutput
}
Write-Host "Done installing skills."
