#!/bin/bash

##
# Color definitions.
##
source shell/colors.sh ''

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
  exit 1
}

lint() {
  local TITLE="<< LINTING SOURCES >>"
  printf "
    ${LIGHT_BLUE}%s
    ${DEFAULT}\n\n" "$TITLE"

  ng lint || exit 1
  yarn lint:html || exit 1
  yarn stylelint || exit 1
}

if [ $# -ne 1 ] || [ "$1" = "?" ]; then
  reportUsage
elif [ "$1" = "lint" ]; then
  lint
else
  reportUsage
  exit 1
fi
