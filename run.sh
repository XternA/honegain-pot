#!/bin/sh

evaluate_exit_code() {
    exit_code=$?

    if [ $exit_code -eq 1 ]; then
        echo "Honeygain exited with code 1. ❌"
        echo "Re-attempting again in a 1hr30m..."
        sleep 5400
        main
    elif [ $exit_code -ne 0 ]; then
        echo "Honeygain exited with an unexpected code: $exit_code ❌"
        echo "Re-attempting again in an 1hr30m..."
        sleep 5400
        main
    fi
}

main() {
    if [ "$PROCESS_WAIT" = true ]; then
        while true; do
            clear; node run.js; evaluate_exit_code

            remaining_time=$(cat timestamp; rm -rf timestamp)
            hours=$((remaining_time / 3600))
            minutes=$(( (remaining_time % 3600) / 60 ))
            seconds=$((remaining_time % 60))

            for i in $(seq "$remaining_time" -1 1); do
                hours=$((i / 3600))
                minutes=$(( (i % 3600) / 60 ))
                seconds=$((i % 60))
                echo "Time remaining: ${hours} hours ${minutes} minutes ${seconds} seconds ⏱️"
                sleep 1
            done
            echo "Ready to claim again ✅"
            echo
        done
        echo "Cooldown for 30 seconds before starting again..."
        sleep 30
    else
        clear; node run.js; evaluate_exit_code
        echo "Closing Honeygain ✅"
    fi
}

main