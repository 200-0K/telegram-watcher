# Save current directory
$currentDir = Get-Location
# Change to the parent directory of this script
Set-Location -Path (Split-Path -Parent $PSScriptRoot)
# Run the npm command
npm run start
# Return to original directory
Set-Location -Path $currentDir 