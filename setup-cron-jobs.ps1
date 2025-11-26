# Script PowerShell para configurar Cron Jobs no QStash
# Execute este script após obter o QStash Token

param(
    [Parameter(Mandatory=$true)]
    [string]$QStashToken,
    
    [Parameter(Mandatory=$false)]
    [string]$SupabaseUrl = "https://urfxniitfbbvsaskicfo.supabase.co",
    
    [Parameter(Mandatory=$false)]
    [string]$SupabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU0NDcsImV4cCI6MjA3Mzg4MTQ0N30.1duUQHT_MjGOmMKP-b-R6A9VByGzHgj296A2UR-IXvA"
)

Write-Host "🚀 Configurando Cron Jobs no QStash..." -ForegroundColor Cyan

# 1. Lembretes de Agendamento (Diário às 8h)
Write-Host "`n📅 Configurando lembrete de agendamento (diário às 8h)..." -ForegroundColor Yellow

$reminderBody = @{
    destination = "$SupabaseUrl/functions/v1/send-appointment-reminder"
    cron = "0 8 * * *"
    headers = @{
        Authorization = "Bearer $SupabaseAnonKey"
        "Content-Type" = "application/json"
    }
} | ConvertTo-Json -Depth 3

try {
    $reminderResponse = Invoke-WebRequest -Uri "https://qstash.upstash.io/v2/schedules" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer $QStashToken"
            "Content-Type" = "application/json"
        } `
        -Body $reminderBody
    
    Write-Host "✅ Lembrete de agendamento configurado!" -ForegroundColor Green
    Write-Host $reminderResponse.Content
} catch {
    Write-Host "❌ Erro ao configurar lembrete:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# 2. Mensagens de Aniversário (Diário às 9h)
Write-Host "`n🎉 Configurando mensagens de aniversário (diário às 9h)..." -ForegroundColor Yellow

$birthdayBody = @{
    destination = "$SupabaseUrl/functions/v1/send-birthdays"
    cron = "0 9 * * *"
    headers = @{
        Authorization = "Bearer $SupabaseAnonKey"
        "Content-Type" = "application/json"
    }
} | ConvertTo-Json -Depth 3

try {
    $birthdayResponse = Invoke-WebRequest -Uri "https://qstash.upstash.io/v2/schedules" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer $QStashToken"
            "Content-Type" = "application/json"
        } `
        -Body $birthdayBody
    
    Write-Host "✅ Mensagens de aniversário configuradas!" -ForegroundColor Green
    Write-Host $birthdayResponse.Content
} catch {
    Write-Host "❌ Erro ao configurar aniversários:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host "`n✨ Configuração concluída!" -ForegroundColor Cyan
Write-Host "`nPara verificar os cron jobs, acesse: https://console.upstash.com/qstash" -ForegroundColor Blue

