#!/bin/sh

# Install Firebase CLI
npm install -g firebase-tools

# Install dependencies
cd functions
mkdir -p functions/node_modules
# # See: https://code.visualstudio.com/remote/advancedcontainers/improve-performance#_use-a-targeted-named-volume
sudo chown -R node:node /workspaces/sora-firebase/functions
npm install
