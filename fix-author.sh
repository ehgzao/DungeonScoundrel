#!/bin/bash
# Script para corrigir nome do autor em TODO o histórico do Git
# Autor correto: Gabriel Lima <lima.ehg@gmail.com>

git filter-branch -f --env-filter '
OLD_NAME="Eduardo Lima"
CORRECT_NAME="Gabriel Lima"
CORRECT_EMAIL="lima.ehg@gmail.com"

if [ "$GIT_COMMITTER_NAME" = "$OLD_NAME" ]
then
    export GIT_COMMITTER_NAME="$CORRECT_NAME"
    export GIT_COMMITTER_EMAIL="$CORRECT_EMAIL"
fi
if [ "$GIT_AUTHOR_NAME" = "$OLD_NAME" ]
then
    export GIT_AUTHOR_NAME="$CORRECT_NAME"
    export GIT_AUTHOR_EMAIL="$CORRECT_EMAIL"
fi
' --tag-name-filter cat -- --branches --tags
