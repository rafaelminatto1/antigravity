# Script PowerShell para configurar Cron Jobs no QStash via API
# Formato correto: destination na URL, headers na requisição

param(
    [Parameter(Mandatory=$true)]
    [string]$QStashToken,
    
    [Parameter(Mandatory=$false)]
    [string]$SupabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU0NDcsImV4cCI6MjA3Mzg4MTQ0N30.1duUQHT_MjGOmMKP-b-R6A9VByGzHgj296A2UR-IXvA"
)

Write-Host "🚀 Configurando Cron Jobs no QStash via API..." -ForegroundColor Cyan

# Função para criar schedule
function Create-QStashSchedule {
    param(
        [string]$Destination,
        [string]$Cron,
        [string]$Token,
        [string]$AuthHeader
    )
    
    $encodedDestination = [System.Web.HttpUtility]::UrlEncode($Destination)
    $url = "https://qstash.upstash.io/v2/schedules/$encodedDestination"
    
    Write-Host "`n📡 Criando schedule para: $Destination" -ForegroundColor Yellow
    Write-Host "   Cron: $Cron" -ForegroundColor Gray
    
    try {
        # QStash usa headers especiais para passar headers customizados
        # O header "Authorization" do destino deve ser passado como "Authorization-Forward"
        $headers = @{
            "Authorization" = "Bearer $Token"
            "Upstash-Cron" = $Cron
            "Authorization-Forward" = $AuthHeader
            "Content-Type" = "application/json"
        }
        
        $response = Invoke-RestMethod -Uri $url -Method POST -Headers $headers
        
        Write-Host "✅ Schedule criado com sucesso!" -ForegroundColor Green
        return $response
    } catch {
        Write-Host "❌ Erro ao criar schedule:" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        if ($_.ErrorDetails) {
            Write-Host $_.ErrorDetails.Message -ForegroundColor Red
        }
        return $null
    }
}

# 1. Lembretes de Agendamento (Diário às 8h)
$reminderDestination = "https://urfxniitfbbvsaskicfo.supabase.co/functions/v1/send-appointment-reminder"
$reminderCron = "0 8 * * *"
$reminderAuth = "Bearer $SupabaseAnonKey"

$reminderResult = Create-QStashSchedule -Destination $reminderDestination -Cron $reminderCron -Token $QStashToken -AuthHeader $reminderAuth

if ($reminderResult) {
    Write-Host "Schedule ID: $($reminderResult.scheduleId)" -ForegroundColor Cyan
}

# 2. Mensagens de Aniversário (Diário às 9h)
$birthdayDestination = "https://urfxniitfbbvsaskicfo.supabase.co/functions/v1/send-birthdays"
$birthdayCron = "0 9 * * *"
$birthdayAuth = "Bearer $SupabaseAnonKey"

$birthdayResult = Create-QStashSchedule -Destination $birthdayDestination -Cron $birthdayCron -Token $QStashToken -AuthHeader $birthdayAuth

if ($birthdayResult) {
    Write-Host "Schedule ID: $($birthdayResult.scheduleId)" -ForegroundColor Cyan
}

Write-Host "`n✨ Configuração concluída!" -ForegroundColor Cyan
Write-Host "`nPara verificar os cron jobs, acesse: https://console.upstash.com/qstash" -ForegroundColor Blue

