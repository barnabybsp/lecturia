#!/bin/bash
# Quick deploy script: stages, commits, and pushes to GitHub
# Usage: ./deploy.sh "Your commit message"

if [ -z "$1" ]; then
  echo "❌ Error: Please provide a commit message"
  echo "Usage: ./deploy.sh \"Your commit message\""
  exit 1
fi

echo "📦 Staging all changes..."
git add .

echo "💾 Committing changes..."
git commit -m "$1"

echo "🚀 Pushing to GitHub..."
git push

echo "✅ Done! Changes pushed to GitHub"

