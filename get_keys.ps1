$content = Get-Content -Raw "d:\_WorkSpaces\ArndtOs\schema_clean.json"
$json = $content | ConvertFrom-Json
$json.properties.integrations | ConvertTo-Json -Depth 5 | Out-File -FilePath d:\_WorkSpaces\ArndtOs\integrations_info.json -Encoding utf8
