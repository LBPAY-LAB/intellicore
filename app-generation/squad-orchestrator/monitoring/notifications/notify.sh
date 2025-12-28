#!/bin/bash

###############################################################################
# SuperCore v2.0 - Notification System
# Slack, Desktop, Email notifications for squad events
###############################################################################

set -euo pipefail

# ============================================================================
# Configuration
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/../config/monitoring-config.json"

# Load from config or environment
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
SLACK_ENABLED="${SLACK_ENABLED:-false}"
DESKTOP_ENABLED="${DESKTOP_ENABLED:-true}"
EMAIL_ENABLED="${EMAIL_ENABLED:-false}"
EMAIL_TO="${EMAIL_TO:-}"

# Load config if exists
if [[ -f "$CONFIG_FILE" ]]; then
    if command -v jq >/dev/null 2>&1; then
        SLACK_ENABLED=$(jq -r '.notifications.slack.enabled // false' "$CONFIG_FILE")
        SLACK_WEBHOOK_URL=$(jq -r '.notifications.slack.webhook_url // ""' "$CONFIG_FILE" | envsubst)
        DESKTOP_ENABLED=$(jq -r '.notifications.desktop.enabled // true' "$CONFIG_FILE")
        EMAIL_ENABLED=$(jq -r '.notifications.email.enabled // false' "$CONFIG_FILE")
    fi
fi

# ============================================================================
# Colors for console output
# ============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RESET='\033[0m'

# ============================================================================
# Notification Functions
# ============================================================================

send_slack_notification() {
    local title="$1"
    local message="$2"
    local color="${3:-#36a64f}"  # green default
    local emoji="${4:-:bell:}"

    if [[ "$SLACK_ENABLED" != "true" ]] || [[ -z "$SLACK_WEBHOOK_URL" ]]; then
        return 0
    fi

    local payload=$(cat <<EOF
{
    "text": "$emoji *$title*",
    "attachments": [
        {
            "color": "$color",
            "text": "$message",
            "footer": "SuperCore v2.0",
            "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
            "ts": $(date +%s)
        }
    ]
}
EOF
    )

    curl -X POST \
        -H 'Content-type: application/json' \
        --data "$payload" \
        "$SLACK_WEBHOOK_URL" \
        --silent --output /dev/null

    echo -e "${GREEN}✓${RESET} Slack notification sent: $title"
}

send_desktop_notification() {
    local title="$1"
    local message="$2"
    local sound="${3:-default}"

    if [[ "$DESKTOP_ENABLED" != "true" ]]; then
        return 0
    fi

    # macOS
    if command -v osascript >/dev/null 2>&1; then
        osascript -e "display notification \"$message\" with title \"SuperCore v2.0\" subtitle \"$title\" sound name \"$sound\""
        echo -e "${GREEN}✓${RESET} Desktop notification sent: $title"
        return 0
    fi

    # Linux (notify-send)
    if command -v notify-send >/dev/null 2>&1; then
        notify-send "SuperCore v2.0: $title" "$message"
        echo -e "${GREEN}✓${RESET} Desktop notification sent: $title"
        return 0
    fi

    echo -e "${YELLOW}⚠${RESET} Desktop notifications not available on this system"
}

send_email_notification() {
    local subject="$1"
    local body="$2"

    if [[ "$EMAIL_ENABLED" != "true" ]] || [[ -z "$EMAIL_TO" ]]; then
        return 0
    fi

    # Using mail command (simple)
    if command -v mail >/dev/null 2>&1; then
        echo "$body" | mail -s "SuperCore v2.0: $subject" "$EMAIL_TO"
        echo -e "${GREEN}✓${RESET} Email notification sent: $subject"
        return 0
    fi

    echo -e "${YELLOW}⚠${RESET} Email notifications not configured"
}

# ============================================================================
# Event Handlers
# ============================================================================

notify_card_completed() {
    local card_id="$1"
    local squad="$2"
    local title="${3:-}"

    send_slack_notification \
        "Card Completed ✅" \
        "*Card:* $card_id\n*Squad:* $squad\n*Title:* $title" \
        "#36a64f" \
        ":white_check_mark:"

    send_desktop_notification \
        "Card Completed" \
        "$card_id in $squad" \
        "Glass"
}

notify_card_blocked() {
    local card_id="$1"
    local squad="$2"
    local reason="${3:-Unknown}"

    send_slack_notification \
        "Card Blocked 🚧" \
        "*Card:* $card_id\n*Squad:* $squad\n*Reason:* $reason\n⚠️ *Action Required*" \
        "#ff9900" \
        ":warning:"

    send_desktop_notification \
        "Card Blocked!" \
        "$card_id blocked in $squad: $reason" \
        "Basso"
}

notify_qa_rejected() {
    local card_id="$1"
    local squad="$2"
    local reason="${3:-Quality issues}"

    send_slack_notification \
        "QA Rejected ❌" \
        "*Card:* $card_id\n*Squad:* $squad\n*Reason:* $reason\n🔧 *Needs Rework*" \
        "#d9534f" \
        ":x:"

    send_desktop_notification \
        "QA Rejected" \
        "$card_id rejected in $squad" \
        "Basso"
}

notify_squad_blocked() {
    local squad="$1"
    local reason="${2:-Waiting for dependencies}"

    send_slack_notification \
        "Squad Blocked 🚨" \
        "*Squad:* $squad\n*Reason:* $reason\n⚠️ *Immediate Attention Required*" \
        "#d9534f" \
        ":rotating_light:"

    send_desktop_notification \
        "Squad Blocked!" \
        "$squad is blocked: $reason" \
        "Basso"

    # Send email for critical events
    send_email_notification \
        "CRITICAL: Squad Blocked - $squad" \
        "Squad $squad is blocked and requires immediate attention.\n\nReason: $reason\n\nPlease review and take action."
}

notify_sprint_completed() {
    local sprint_name="$1"
    local cards_completed="${2:-0}"
    local velocity="${3:-0}"

    send_slack_notification \
        "Sprint Completed 🎉" \
        "*Sprint:* $sprint_name\n*Cards Completed:* $cards_completed\n*Velocity:* $velocity pts/day\n🎊 *Great Work!*" \
        "#5cb85c" \
        ":tada:"

    send_desktop_notification \
        "Sprint Completed!" \
        "$sprint_name completed with $cards_completed cards" \
        "Glass"

    send_email_notification \
        "Sprint Completed - $sprint_name" \
        "Sprint $sprint_name has been completed successfully.\n\nCards Completed: $cards_completed\nVelocity: $velocity pts/day\n\nCongratulations!"
}

notify_error() {
    local component="$1"
    local error_message="$2"

    send_slack_notification \
        "Error Detected ❌" \
        "*Component:* $component\n*Error:* $error_message\n🔧 *Check logs immediately*" \
        "#d9534f" \
        ":x:"

    send_desktop_notification \
        "Error!" \
        "$component: $error_message" \
        "Basso"
}

notify_custom() {
    local title="$1"
    local message="$2"
    local severity="${3:-info}"  # info, warning, error, success

    local color="#5bc0de"
    local emoji=":information_source:"
    local sound="default"

    case "$severity" in
        success)
            color="#5cb85c"
            emoji=":white_check_mark:"
            sound="Glass"
            ;;
        warning)
            color="#ff9900"
            emoji=":warning:"
            sound="Basso"
            ;;
        error)
            color="#d9534f"
            emoji=":x:"
            sound="Basso"
            ;;
    esac

    send_slack_notification "$title" "$message" "$color" "$emoji"
    send_desktop_notification "$title" "$message" "$sound"
}

# ============================================================================
# Event Watcher (monitors events and triggers notifications)
# ============================================================================

watch_events() {
    local api_url="${1:-http://localhost:3000}"
    local last_event_id=""

    echo -e "${BLUE}Starting event watcher...${RESET}"
    echo -e "API: $api_url"
    echo -e "Slack: ${SLACK_ENABLED}"
    echo -e "Desktop: ${DESKTOP_ENABLED}"
    echo -e "Email: ${EMAIL_ENABLED}"
    echo ""

    while true; do
        # Fetch new events
        local events=$(curl -s "$api_url/api/events?limit=10" 2>/dev/null || echo "[]")

        if [[ "$events" == "[]" ]] || [[ -z "$events" ]]; then
            sleep 5
            continue
        fi

        # Process events (requires jq)
        if command -v jq >/dev/null 2>&1; then
            echo "$events" | jq -c '.[]' | while read -r event; do
                local event_id=$(echo "$event" | jq -r '.event_id')
                local event_type=$(echo "$event" | jq -r '.type')
                local squad=$(echo "$event" | jq -r '.squad')
                local card=$(echo "$event" | jq -r '.card // ""')
                local message=$(echo "$event" | jq -r '.message')

                # Skip if already processed
                if [[ "$event_id" == "$last_event_id" ]]; then
                    continue
                fi

                # Handle based on event type
                case "$event_type" in
                    card_done)
                        notify_card_completed "$card" "$squad" "$message"
                        ;;
                    card_blocked)
                        notify_card_blocked "$card" "$squad" "$message"
                        ;;
                    qa_rejected)
                        notify_qa_rejected "$card" "$squad" "$message"
                        ;;
                    squad_blocked)
                        notify_squad_blocked "$squad" "$message"
                        ;;
                    sprint_complete)
                        notify_sprint_completed "$squad" "0" "0"
                        ;;
                    error)
                        notify_error "$squad" "$message"
                        ;;
                esac

                last_event_id="$event_id"
            done
        fi

        sleep 5
    done
}

# ============================================================================
# CLI Interface
# ============================================================================

show_help() {
    cat <<EOF
SuperCore v2.0 - Notification System

USAGE:
    $(basename "$0") [COMMAND] [OPTIONS]

COMMANDS:
    watch                   Watch for events and send notifications
    test [TYPE]            Send test notification
    card-done ID SQUAD     Notify card completion
    card-blocked ID SQUAD  Notify card blocked
    qa-rejected ID SQUAD   Notify QA rejection
    squad-blocked SQUAD    Notify squad blocked
    sprint-done NAME       Notify sprint completion
    custom TITLE MSG       Send custom notification

TEST TYPES:
    slack                  Test Slack notification
    desktop                Test desktop notification
    email                  Test email notification
    all                    Test all notifications

OPTIONS:
    --api URL              API endpoint (default: http://localhost:3000)
    --help, -h             Show this help

ENVIRONMENT VARIABLES:
    SLACK_WEBHOOK_URL      Slack webhook URL
    SLACK_ENABLED          Enable Slack (true/false)
    DESKTOP_ENABLED        Enable desktop (true/false)
    EMAIL_ENABLED          Enable email (true/false)
    EMAIL_TO               Email recipient

EXAMPLES:
    # Watch for events
    $(basename "$0") watch

    # Test Slack notification
    $(basename "$0") test slack

    # Notify card completion
    $(basename "$0") card-done CARD-001 squad-backend

    # Send custom notification
    $(basename "$0") custom "Deploy Complete" "Production deployment successful"
EOF
}

main() {
    local command="${1:-}"

    if [[ -z "$command" ]] || [[ "$command" == "-h" ]] || [[ "$command" == "--help" ]]; then
        show_help
        exit 0
    fi

    shift || true

    case "$command" in
        watch)
            watch_events "${1:-http://localhost:3000}"
            ;;
        test)
            local type="${1:-all}"
            case "$type" in
                slack)
                    send_slack_notification "Test Notification" "This is a test from SuperCore v2.0" "#5bc0de" ":bell:"
                    ;;
                desktop)
                    send_desktop_notification "Test Notification" "This is a test from SuperCore v2.0"
                    ;;
                email)
                    send_email_notification "Test Notification" "This is a test from SuperCore v2.0"
                    ;;
                all)
                    send_slack_notification "Test Notification" "This is a test from SuperCore v2.0" "#5bc0de" ":bell:"
                    send_desktop_notification "Test Notification" "This is a test from SuperCore v2.0"
                    send_email_notification "Test Notification" "This is a test from SuperCore v2.0"
                    ;;
                *)
                    echo "Unknown test type: $type"
                    exit 1
                    ;;
            esac
            ;;
        card-done)
            notify_card_completed "$1" "$2" "${3:-}"
            ;;
        card-blocked)
            notify_card_blocked "$1" "$2" "${3:-Unknown reason}"
            ;;
        qa-rejected)
            notify_qa_rejected "$1" "$2" "${3:-Quality issues}"
            ;;
        squad-blocked)
            notify_squad_blocked "$1" "${2:-Waiting for dependencies}"
            ;;
        sprint-done)
            notify_sprint_completed "$1" "${2:-0}" "${3:-0}"
            ;;
        custom)
            notify_custom "$1" "$2" "${3:-info}"
            ;;
        *)
            echo "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
