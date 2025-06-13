#!/bin/bash

# Start Vite development server
echo "Starting Vite development server..."
npm run dev -- --port 3000 &
VITE_PID=$!

# Give it time to start
echo "Waiting for development server to start..."
sleep 3

# Start Electron pointing to the Vite server
echo "Starting Electron app..."
ELECTRON_ARGS="."
electron $ELECTRON_ARGS

# When Electron exits, kill the Vite server
echo "Cleaning up..."
kill $VITE_PID
