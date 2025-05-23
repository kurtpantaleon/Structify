#!/bin/bash

# Structify Server Manager Script

clear
echo "====================================="
echo "    Structify Server Restart Tool    "
echo "====================================="
echo

while true; do
    echo "Choose an option:"
    echo "1. Start Server"
    echo "2. Restart Server (Stop then Start)"
    echo "3. Stop Server"
    echo "4. Exit"
    echo
    
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            echo
            echo "Starting Structify Server..."
            gnome-terminal -- node server.js 2>/dev/null || 
            x-terminal-emulator -e "node server.js" 2>/dev/null || 
            xterm -e "node server.js" 2>/dev/null ||
            open -a Terminal.app node server.js 2>/dev/null ||
            node server.js &
            echo "Server started."
            echo
            ;;
        2)
            echo
            echo "Restarting Structify Server..."
            echo "Step 1: Stopping server..."
            pkill -f "node server.js"
            echo "Server stopped."
            echo "Waiting 5 seconds..."
            sleep 5
            echo "Step 2: Starting server..."
            gnome-terminal -- node server.js 2>/dev/null || 
            x-terminal-emulator -e "node server.js" 2>/dev/null || 
            xterm -e "node server.js" 2>/dev/null ||
            open -a Terminal.app node server.js 2>/dev/null ||
            node server.js &
            echo "Server restarted."
            echo
            ;;
        3)
            echo
            echo "Stopping Structify Server..."
            pkill -f "node server.js"
            echo "Server stopped."
            echo
            ;;
        4)
            echo
            echo "Thank you for using the Server Restart Tool."
            echo
            exit 0
            ;;
        *)
            echo "Invalid choice. Please try again."
            ;;
    esac
done
