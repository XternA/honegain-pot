#!/bin/sh

RED="\033[0;91m"
GREEN="\033[0;92m"
YELLOW="\033[0;33m"
PINK="\033[0;95m"
CYAN="\033[0;96m"
RESET="\033[0m"

DELAY_COUNT=120

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

                delay_counter=0
                for i in $(seq "$remaining_time" -1 1); do
                    hours=$((i / 3600))
                    minutes=$(( (i % 3600) / 60 ))
                    seconds=$((i % 60))

                    time_str="${CYAN}${hours}${RESET} hours ${CYAN}${minutes}${RESET} minutes"
                    if [ "$IS_CONTAINER" = true ]; then
                        if [[ $delay_counter -eq 0 || $delay_counter -eq $DELAY_COUNT ]]; then
                            printf "${GREEN}$(date +'%H:%M:%S') Time remaining: $time_str${RESET} ⏱️\n"
                            delay_counter=0
                        fi
                        delay_counter=$((delay_counter + 1))
                    else
                        printf "${GREEN}Time remaining: $time_str ${CYAN}${seconds}${RESET} seconds ⏱️\n"
                    fi
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