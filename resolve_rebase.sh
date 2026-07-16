#!/bin/bash
export GIT_EDITOR=true
while git status | grep -q "rebase in progress"; do
    git rebase --continue
    if [ $? -ne 0 ]; then
        # On conflict, accept HEAD
        git checkout --ours .
        git add .
        # Try to continue, if it fails because of empty commit, skip it
        GIT_EDITOR=true git commit --no-edit || git rebase --skip
    fi
done
