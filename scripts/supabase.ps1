Param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$SupabaseArgs
)

$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root '.env.local'
$argsRequireAuth = $true

if ($SupabaseArgs -contains '--version' -or $SupabaseArgs -contains '-v' -or $SupabaseArgs -contains 'help' -or $SupabaseArgs -contains '--help' -or $SupabaseArgs -contains '-h') {
    $argsRequireAuth = $false
}

if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith('#')) {
            return
        }

        $parts = $line -split '=', 2
        if ($parts.Count -ne 2) {
            return
        }

        $key = $parts[0].Trim()
        $value = $parts[1].Trim().Trim('"').Trim("'")

        if ($key) {
            [System.Environment]::SetEnvironmentVariable($key, $value, 'Process')
        }
    }
}

if ($argsRequireAuth -and -not $env:SUPABASE_ACCESS_TOKEN) {
    $env:SUPABASE_ACCESS_TOKEN = Read-Host 'Enter SUPABASE_ACCESS_TOKEN' -MaskInput
}

if (-not $SupabaseArgs -or $SupabaseArgs.Count -eq 0) {
    Write-Host 'Usage: .\scripts\supabase.ps1 <supabase command args>'
    Write-Host 'Example: .\scripts\supabase.ps1 projects list'
    exit 1
}

& npx --yes supabase @SupabaseArgs
exit $LASTEXITCODE
