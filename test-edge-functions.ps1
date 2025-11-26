# Script PowerShell para testar Edge Functions manualmente

param(
    [Parameter(Mandatory=$false)]
    [string]$SupabaseUrl = "https://urfxniitfbbvsaskicfo.supabase.co",
    
    [Parameter(Mandatory=$false)]
    [string]$SupabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU0NDcsImV4cCI6MjA3Mzg4MTQ0N30.1duUQHT_MjGOmMKP-b-R6A9VByGzHgj296A2UR-IXvA"
)

Write-Host "🧪 Testando Edge Functions..." -ForegroundColor Cyan

# Teste 1: send-appointment-reminder
Write-Host "`n1️⃣ Testando send-appointment-reminder..." -ForegroundColor Yellow
try {
    $response1 = Invoke-WebRequest -Uri "$SupabaseUrl/functions/v1/send-appointment-reminder" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer $SupabaseAnonKey"
            "Content-Type" = "application/json"
        }
    
    Write-Host "✅ Sucesso!" -ForegroundColor Green
    $response1.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
} catch {
    Write-Host "❌ Erro:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message
    }
}

# Teste 2: send-birthdays
Write-Host "`n2️⃣ Testando send-birthdays..." -ForegroundColor Yellow
try {
    $response2 = Invoke-WebRequest -Uri "$SupabaseUrl/functions/v1/send-birthdays" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer $SupabaseAnonKey"
            "Content-Type" = "application/json"
        }
    
    Write-Host "✅ Sucesso!" -ForegroundColor Green
    $response2.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
} catch {
    Write-Host "❌ Erro:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message
    }
}

Write-Host "`n✨ Testes concluídos!" -ForegroundColor Cyan
Write-Host "`nPara verificar logs, execute no Supabase SQL Editor:" -ForegroundColor Blue
Write-Host "SELECT * FROM communication_logs ORDER BY created_at DESC LIMIT 10;" -ForegroundColor Gray

