[CmdletBinding()]
param(
    [Parameter(Mandatory = $true, Position = 0)]
    [ValidateSet("install-dev", "format", "format-check", "lint", "test", "build", "verify")]
    [string]$Task
)

$ErrorActionPreference = "Stop"
$RepositoryRoot = Split-Path -Parent $PSScriptRoot

function Invoke-Python {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments)

    & python @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Python command failed with exit code $LASTEXITCODE."
    }
}

function Invoke-Frontend {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments)

    Push-Location (Join-Path $RepositoryRoot "frontend")
    try {
        & npm @Arguments
        if ($LASTEXITCODE -ne 0) {
            throw "npm command failed with exit code $LASTEXITCODE."
        }
    }
    finally {
        Pop-Location
    }
}

Set-Location $RepositoryRoot

switch ($Task) {
    "install-dev" {
        Invoke-Python -m pip install -r requirements-dev.txt
        Invoke-Frontend install
    }
    "format" {
        Invoke-Python -m ruff check --fix app config.py main.py tests
        Invoke-Python -m black app config.py main.py tests
        Invoke-Frontend run format
    }
    "format-check" {
        Invoke-Python -m ruff format --check app config.py main.py tests
        Invoke-Python -m black --check app config.py main.py tests
        Invoke-Frontend run format:check
    }
    "lint" {
        Invoke-Python -m ruff check app config.py main.py tests
        Invoke-Frontend run lint
    }
    "test" {
        Invoke-Python -m unittest discover -s tests
    }
    "build" {
        Invoke-Frontend run build
    }
    "verify" {
        & $PSCommandPath format-check
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
        & $PSCommandPath lint
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
        & $PSCommandPath test
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
        & $PSCommandPath build
    }
}
