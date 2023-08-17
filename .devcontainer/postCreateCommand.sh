#!/bin/sh

# Install Firebase CLI
curl -sL https://firebase.tools | bash

# Install dependencies
cd functions
# # See: https://code.visualstudio.com/remote/advancedcontainers/improve-performance#_use-a-targeted-named-volume
sudo chown node node_modules
pnpm install

# Symbolic link for globally installed node
# Used for overwriting node path in firebase cli
sudo ln -s $(which node) /usr/local/bin/node-link
