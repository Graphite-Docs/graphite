#!/usr/bin/env bash

# Get the exported path from the default login shell, and append it to the
# path from the environment. We ignore the stderr because there are
# potential errors and all we care about is the PATH.
LOGIN_PATH="$(bash -lc 'echo "$PATH"' 2>/dev/null)"
if [ "$LOGIN_PATH" != '' ]; then
  PATH="$PATH:$LOGIN_PATH"
fi

# This section copied from github.com/dominictarr/JSON.sh and simplified a bit
##############################################################################
throw() {
    echo "$*" >&2
    exit 1
}

awk_egrep() {
    local pattern_string=$1
    gawk '{
        while ($0) {
            start=match($0,pattern);
            token=substr($0,start,RLENGTH);
            print token;
            $0=substr($0,start+RLENGTH);
        }
    }' pattern=$pattern_string
}

tokenize() {
    local GREP
    local ESCAPE
    local CHAR

    if echo "test string" | grep -ao --color=never "test" &>/dev/null; then
        GREP="egrep -ao --color=never"
    else
        GREP="egrep -ao"
    fi

    if echo "test string" | egrep -o "test" &>/dev/null; then
        ESCAPE='(\\[^u[:cntrl:]]|\\u[0-9a-fA-F]{4})'
        CHAR='[^[:cntrl:]"\\]'
    else
        GREP=awk_egrep
        ESCAPE='(\\\\[^u[:cntrl:]]|\\u[0-9a-fA-F]{4})'
        CHAR='[^[:cntrl:]"\\\\]'
    fi

    local STRING="\"$CHAR*($ESCAPE$CHAR*)*\""
    local NUMBER='-?(0|[1-9][0-9]*)([.][0-9]*)?([eE][+-]?[0-9]*)?'
    local KEYWORD='null|false|true'
    local SPACE='[[:space:]]+'

    sed 's/\\r//' | $GREP "$STRING|$NUMBER|$KEYWORD|$SPACE|." | egrep -v "^$SPACE$"
}

parse_array() {
    local index=0
    local ary=''

    read -r token
    case "$token" in
        ']')
            ;;
        *)
            while :
            do
                parse_value "$1" "$index"
                index=$((index+1))
                ary="$ary""$value"
                read -r token

                case "$token" in
                    ']')
                        break
                        ;;
                    ',')
                        ary="$ary,"
                        ;;
                    *)
                        throw "EXPECTED , or ] GOT ${token:-EOF}"
                        ;;
                esac
                read -r token
            done
            ;;
    esac
    value=
    :
}

parse_object() {
    local key
    local obj=''
    read -r token

    case "$token" in
        '}')
            ;;
        *)
            while :
            do
                case "$token" in
                    '"'*'"')
                        key=$token
                        ;;
                    *)
                        throw "EXPECTED string GOT ${token:-EOF}"
                        ;;
                esac

                read -r token
                case "$token" in
                    ':')
                        ;;
                    *)
                        throw "EXPECTED : GOT ${token:-EOF}"
                        ;;
                esac

                read -r token
                parse_value "$1" "$key"
                obj="$obj$key:$value"

                read -r token
                case "$token" in
                    '}')
                        break
                        ;;
                    ',')
                        obj="$obj,"
                        ;;
                    *)
                        throw "EXPECTED , or } GOT ${token:-EOF}"
                        ;;
                esac

                read -r token
            done
            ;;
    esac
    value=

    :
}

parse_value() {
    local jpath="${1:+$1,}$2"
    local isleaf=0
    local isempty=0

    case "$token" in
        '{')
            parse_object "$jpath"
            ;;
        '[')
            parse_array "$jpath"
            ;;
        ''|[!0-9])
            throw "EXPECTED value GOT ${token:-EOF}"
            ;;
        *)
            value=$token
            isleaf=1
            [ "$value" = '""' ] && isempty=1
            ;;
    esac

    [ "$value" = '' ] && return
    [ "$isleaf" -eq 1 ] && [ $isempty -eq 0 ] && printf "[%s]\t%s\n" "$jpath" "$value"

    :
}

parse() {
    read -r token
    parse_value

    read -r token
    case "$token" in
        '')
            ;;
        *)
            throw "EXPECTED EOF GOT $token"
            ;;
    esac
}

parse_json() {
    tokenize | parse
}
##############################################################################
# End of copied code

# Search parsed JSON for a named script, return the script as a string
find_script() {
    local json=$1
    local name=$2
    local script=""
    local oifs="${IFS}"

    IFS=$'\n'

    for line in $json; do
        IFS="${oifs}"

        echo "$line" | grep '\["scripts"' 2>&1 >/dev/null
        if [[ $? -eq 0 ]]; then
            local script_name=""
            local match=$(echo $line | sed -n 's/\["scripts","\([^"]*\)"\] "\(.*\)"/\1 \2/p')

            IFS=' ' read -r script_name string <<< $match
            if [[ "$script_name" == "$name" ]]; then
                script=${match:${#script_name}+1}
                break
            fi
        fi

        IFS=$'\n'
    done

    IFS="${oifs}"

    echo "$script"
}

# Run the named script, searches both package.json and .validate.json
run_script() {
    local json=$1
    local name=$2

    echo -n "running $name..."

    local script=$(find_script "$json" "$name")

    if [[ "$script" == "" ]]; then
        echo "not found!"
        return 0
    fi

    local output=""
    output=$(PATH=./node_modules/.bin:$PATH eval $script 2>&1)
    local result=$?
    if [[ $result -ne 0 ]]; then
        echo "failed!"
        echo "$output"
    else
        echo "passed!"
    fi
    return $result
}

find_commands() {
    local json=$1
    local branch=$2

    _find_commands() {
        local cmd=$1
        local commands=""
        local oifs="${IFS}"
        IFS=$'\n'

        for line in $json; do
            IFS="${oifs}"

            echo "$line" | grep "\[\"$cmd\"" 2>&1 >/dev/null
            if [[ $? -eq 0 ]]; then
                local match=$(echo $line | sed -n "s/\[\"$cmd\",[0-9]*\] \"\([^\"]*\)\"/\1/p")
                commands="$commands $match"
            fi

            IFS=$'\n'
        done
        IFS="${oifs}"
        echo "$commands"
    }

    local commands=$(_find_commands "$hook_cmd#$branch")
    if [[ "$commands" == "" ]]; then
        commands=$(_find_commands "$hook_cmd")
    fi

    echo "$commands"
}

# Finds the appropriate commands to run for a project and runs them
check_project() {
    local package=$1
    local dir=$(dirname "$package")
    local json; json=$(cat "$package" | parse_json)
    if [[ $? -ne 0 ]]; then
        echo "failed parsing $package.. exiting"
        exit 1
    fi

    pushd "$dir" >/dev/null
    local branch;
    if [[ "$OSTYPE" == "cygwin" || "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
      branch=$(git rev-parse --abbrev-ref HEAD 2>&1)
    else
      branch=$(env -i git rev-parse --abbrev-ref HEAD 2>&1)
    fi
    if [[ $? -ne 0 ]]; then
        popd >/dev/null
        return 0
    fi

    local commands=$(find_commands "$json" "$branch")

    if [[ "$commands" == "" ]]; then
        popd >/dev/null
        return 0
    fi

    for cmd in $commands; do
        run_script "$json" "$cmd" "$branch"
        local result=$?
        [[ $result -ne 0 ]] && break
    done

    popd >/dev/null

    return $result
}

# Find all projects in the current repo and check each one
run_hook() {
    # Guard to avoid running hooks when rebasing, just exit with success immediately
    if [[ $(git branch | grep '*' | sed 's/* //') == "(no branch)" ]]; then
        exit 0
    fi

    local hook_cmd=$(basename $0)
    local git_root;
    if [[ "$OSTYPE" == "cygwin" || "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
      git_root=$(git rev-parse --show-toplevel)
    else
      git_root=$(env -i git rev-parse --show-toplevel)
    fi
    if [[ $? -ne 0 ]]; then
        echo "this does not look like a git repository.. exiting"
        exit 0
    fi

    pushd "$git_root" >/dev/null
    local projects; projects=$(find . -not -iwholename '*node_modules*' -not -iwholename '*bower_components*' -maxdepth 3 -name package.json -print 2>/dev/null)
    if [[ $? -ne 0 ]]; then
        projects=$(find . -not -ipath '*node_modules*' -not -ipath '*bower_components*' -maxdepth 3 -name package.json -print 2>/dev/null)
    fi
    projects=$(echo "$projects" | sed s/\.//)
    popd >/dev/null

    local result=0

    for project in $projects; do
        check_project "$git_root$project"
        result=$?
        [[ $result -ne 0 ]] && break
    done

    return $result
}

run_hook
