#!/bin/sh

RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
PINK="\033[0;95m"
CYAN="\033[0;36m"
RESET="\033[0m"

while true; do
    clear; node run.js
    exit_code=$?

    if [ $exit_code -eq 0 ]; then
        if [ "$PROCESS_WAIT" = true ]; then
            if [ -e "$(pwd)/timestamp" ]; then
                remaining_time=$(cat timestamp; rm -f timestamp)
                hours=$((remaining_time / 3600))
                minutes=$(( (remaining_time % 3600) / 60 ))
                seconds=$((remaining_time % 60))

                for i in $(seq "$remaining_time" -1 1); do
                    hours=$((i / 3600))
                    minutes=$(( (i % 3600) / 60 ))
                    seconds=$((i % 60))
                    printf "${GREEN}Time remaining: ${CYAN}${hours}${RESET} hours ${CYAN}${minutes}${RESET} minutes ${CYAN}${seconds}${GREEN} seconds${RESET} ⏱️\n"
                    sleep 1
                done
                printf "${YELLOW}Ready to claim again${RESET} ✅\n"
            fi
        fi
        break
    fi

    if [ $exit_code -eq 2 ]; then
        printf "Re-attempting again in ${CYAN}1${RESET} hour ⏱️\n"
        printf "Time logged: ${YELLOW}$(date +"%H:%M:%S")${RESET}\n"
        sleep 1800
    elif [ $exit_code -eq 1 ]; then
        printf "${RED}Honeygain exited with code ${CYAN}1${RED}.${RESET} ❌\n"
        printf "Re-attempting again in ${CYAN}2${RESET} hours ⏱️\n"
        printf "Time logged: ${YELLOW}$(date +"%H:%M:%S")${RESET}\n"
        sleep 7200
    elif [ $exit_code -ne 0 ]; then
        printf "${RED}Honeygain exited with an unexpected code: ${CYAN}$exit_code${RESET} ❌"
        printf "Re-attempting again in ${CYAN}2${RESET} hours ⏱️\n"
        printf "Time logged: ${YELLOW}$(date +"%H:%M:%S")${RESET}\n"
        sleep 7200
    fi
done

echo "Closing Honeygain Pot ✅"