param(
    [Parameter(Mandatory=$true)]
    [string]$TargetId,

    [Parameter(Mandatory=$true)]
    [string]$Content
)

$gatewayUrl = "http://localhost:42617/api/v1/message/send"
$token = "525113" # The pairing code or a permanent token if generated. Note: The pairing code is 525113

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type"  = "application/json"
}

$body = @{
    channel   = "telegram"
    target_id = $TargetId
    content   = $Content
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $gatewayUrl -Method Post -Headers $headers -Body $body
    Write-Output "Message sent successfully"
    Write-Output $response
} catch {
    Write-Error "Failed to send message: $_"
}
