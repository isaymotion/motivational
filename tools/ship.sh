#!/bin/bash
# Commit everything in the repo checkout and push main. Usage: tools/ship.sh <repo> "<message>" <session-url>
cd "$1" || exit 1; rm -rf _qa; git add -A
git -c user.name=isaymotion -c user.email=isaymotion@gmail.com commit -q -m "$2

Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>
Claude-Session: $3" && git push origin main 2>&1 | tail -1
