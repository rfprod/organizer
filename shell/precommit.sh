#!/bin/bash

##
# Color definitions.
##
source shell/colors.sh ''

##
# Exits with error.
##
exitWithError() {
  exit 1
}

##
# Reports usage error and exits.
##
reportUsage() {
  local TITLE="<< USAGE >>"
  printf "
    ${LIGHT_BLUE}%s\n
    ${DEFAULT} - ${YELLOW} bash shell/precommit.sh ?${DEFAULT} - print install.sh usage
    ${DEFAULT} - ${YELLOW} bash shell/precommit.sh lint${DEFAULT} - lints changes before committing
    ${DEFAULT}\n\n" "$TITLE"
}

reportUsageError() {
  local TITLE="<< ERROR >>"
  printf "
    ${RED}%s
    ${LIGHT_RED}- wrong argument: ${1}
    ${DEFAULT}\n\n" "$TITLE"
  reportUsage
  exitWithError
}

lint() {
  local TITLE="<< LINTING SOURCES >>"
  printf "
    ${LIGHT_BLUE}%s
    ${DEFAULT}\n\n" "$TITLE"

  ng lint || exitWithError
  yarn prettier:html || exitWithError
  yarn stylelint || exitWithError
}

if [ $# -ne 1 ] || [ "$1" = "?" ]; then
  reportUsage
elif [ "$1" = "lint" ]; then
  lint
else
  reportUsageError "$1"
fi
