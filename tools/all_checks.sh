#!/bin/bash
# Run every check on a repo checkout and print one summary line each. Usage: tools/all_checks.sh <repo> <design-skill-dir>
R=${1:-.}; D=$2; T=$(cd "$(dirname "$0")" && pwd); cd "$R" || exit 1
node -e "require('vm').createScript(require('fs').readFileSync('js/app.js','utf8'))" && echo "syntax OK"
node $T/check_chapters.js . 2>&1 | tail -1
for s in qa tools_qa drills_qa features_qa; do [ -f $T/$s.py ] && { echo -n "$s: "; python3 -I $T/$s.py . 2>&1 | grep -v 'GET \|^PASS' | tail -4; }; done
echo -n "nav: "; python3 -I $T/nav_check.py . 2>&1 | grep '^errors'
[ -n "$D" ] && { echo -n "sw: "; python3 $D/scripts/check_sw.py . 2>&1 | tail -1; echo -n "design: "; python3 $D/scripts/check_design.py . --browser 2>&1 | tail -1; }
rm -rf _qa
