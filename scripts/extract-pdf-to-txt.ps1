# FIUTAMI - PDF Text Extractor
# Estrae il testo da tutti i PDF in una cartella e li salva come TXT normalizzati
#
# Uso:
#   .\scripts\extract-pdf-to-txt.ps1 [-SourceFolder <path>] [-OutputFolder <path>]
#
# Esempio:
#   .\scripts\extract-pdf-to-txt.ps1 -SourceFolder "C:\Users\Fra\Nextcloud\Fiutami\..." -OutputFolder ".\content\breeds\raw"

param(
    [string]$SourceFolder = "C:\Users\Fra\Nextcloud\Fiutami\2025\_Fondamenta Fiutami\Analinisi Elementi interni App\APP\pagina RAZZE",
    [string]$OutputFolder = ".\content\breeds\raw"
)

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "FIUTAMI - PDF Text Extractor" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Source: $SourceFolder"
Write-Host "Output: $OutputFolder"
Write-Host ""

# Verifica cartella sorgente
if (-not (Test-Path $SourceFolder)) {
    Write-Host "ERRORE: Cartella sorgente non trovata: $SourceFolder" -ForegroundColor Red
    exit 1
}

# Crea cartella output
if (-not (Test-Path $OutputFolder)) {
    New-Item -ItemType Directory -Path $OutputFolder -Force | Out-Null
}

# Funzione per estrarre testo da PDF usando iTextSharp o Word COM
function Extract-PdfText {
    param([string]$PdfPath)

    $text = ""

    # Metodo 1: Prova con Word COM (se disponibile)
    try {
        $word = New-Object -ComObject Word.Application
        $word.Visible = $false
        $doc = $word.Documents.Open($PdfPath, $false, $true)
        $text = $doc.Content.Text
        $doc.Close($false)
        $word.Quit()
        [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null

        if ($text.Length -gt 100) {
            return $text
        }
    } catch {
        # Word non disponibile, continua con altro metodo
    }

    # Metodo 2: Usa pdftotext se installato (poppler-utils)
    $pdftotext = Get-Command pdftotext -ErrorAction SilentlyContinue
    if ($pdftotext) {
        $tempFile = [System.IO.Path]::GetTempFileName()
        & pdftotext -layout $PdfPath $tempFile 2>$null
        if (Test-Path $tempFile) {
            $text = Get-Content $tempFile -Raw -Encoding UTF8
            Remove-Item $tempFile -Force
            if ($text.Length -gt 100) {
                return $text
            }
        }
    }

    # Metodo 3: Estrazione base con .NET (limitata ma funziona per PDF semplici)
    try {
        Add-Type -AssemblyName System.IO
        $bytes = [System.IO.File]::ReadAllBytes($PdfPath)
        $content = [System.Text.Encoding]::UTF8.GetString($bytes)

        # Estrai stringhe di testo tra parentesi (formato PDF base)
        $matches = [regex]::Matches($content, '\(([^\)]+)\)')
        $textParts = @()
        foreach ($match in $matches) {
            $part = $match.Groups[1].Value
            # Filtra solo testo leggibile
            if ($part -match '^[\w\s\.,;:\-àèéìòùÀÈÉÌÒÙ]+$' -and $part.Length -gt 2) {
                $textParts += $part
            }
        }
        $text = $textParts -join " "
    } catch {
        # Fallback fallito
    }

    return $text
}

# Funzione per normalizzare il testo
function Normalize-Text {
    param([string]$Text)

    # Rimuovi caratteri speciali PDF
    $text = $Text -replace '\x00', ''
    $text = $text -replace '\r\n', "`n"
    $text = $text -replace '\r', "`n"

    # Normalizza spazi multipli
    $text = $text -replace '[ \t]+', ' '

    # Normalizza newline multipli
    $text = $text -replace '\n{3,}', "`n`n"

    # Trim linee
    $lines = $text -split "`n" | ForEach-Object { $_.Trim() }
    $text = $lines -join "`n"

    return $text.Trim()
}

# Contatori
$stats = @{
    Folders = 0
    Files = 0
    Success = 0
    Errors = @()
}

# Processa ricorsivamente
function Process-Folder {
    param(
        [string]$Path,
        [string]$RelativePath = ""
    )

    $items = Get-ChildItem -Path $Path

    foreach ($item in $items) {
        if ($item.PSIsContainer) {
            # E' una cartella, processa ricorsivamente
            $newRelative = if ($RelativePath) { "$RelativePath\$($item.Name)" } else { $item.Name }
            $stats.Folders++
            Write-Host "`nCartella: $newRelative" -ForegroundColor Yellow
            Process-Folder -Path $item.FullName -RelativePath $newRelative
        }
        elseif ($item.Extension -eq ".pdf") {
            # E' un PDF
            $stats.Files++
            Write-Host "  Elaboro: $($item.Name)" -ForegroundColor Gray

            try {
                # Estrai testo
                $text = Extract-PdfText -PdfPath $item.FullName

                if ($text.Length -lt 50) {
                    Write-Host "    [SKIP] Testo troppo corto o non estraibile" -ForegroundColor DarkYellow
                    $stats.Errors += @{ File = $item.FullName; Error = "Testo non estraibile" }
                    continue
                }

                # Normalizza
                $normalizedText = Normalize-Text -Text $text

                # Crea cartella output
                $outputDir = Join-Path $OutputFolder $RelativePath
                if (-not (Test-Path $outputDir)) {
                    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
                }

                # Salva file TXT
                $outputFile = Join-Path $outputDir ($item.BaseName + ".txt")
                $normalizedText | Out-File -FilePath $outputFile -Encoding UTF8

                $stats.Success++
                Write-Host "    [OK] Salvato: $($item.BaseName).txt ($($normalizedText.Length) chars)" -ForegroundColor Green
            }
            catch {
                $stats.Errors += @{ File = $item.FullName; Error = $_.Exception.Message }
                Write-Host "    [ERROR] $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
}

# Esegui
Process-Folder -Path $SourceFolder

# Riepilogo
Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "RIEPILOGO" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Cartelle elaborate: $($stats.Folders)"
Write-Host "File PDF trovati: $($stats.Files)"
Write-Host "Conversioni riuscite: $($stats.Success)" -ForegroundColor Green
Write-Host "Errori: $($stats.Errors.Count)" -ForegroundColor $(if ($stats.Errors.Count -gt 0) { "Red" } else { "Green" })

if ($stats.Errors.Count -gt 0) {
    Write-Host "`nFile con errori:" -ForegroundColor Yellow
    foreach ($err in $stats.Errors) {
        Write-Host "  - $($err.File): $($err.Error)" -ForegroundColor DarkYellow
    }
}

Write-Host "`nOutput salvato in: $OutputFolder" -ForegroundColor Cyan
Write-Host "`nProssimo passo: Esegui il parser per convertire i TXT in MD:"
Write-Host "  node scripts/parse-breed-text.js <file.txt> <specie> <categoria>" -ForegroundColor White
