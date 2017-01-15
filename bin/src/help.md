ngdt version __VERSION__
==================================
__DISPLAY_NAME__

Usage: ngdt [options] <glob-files>

<glob-files>      List of files using glob pattern, by default `__CONF_FILES__`

Options:

-v, --version     Show version number
-h, --help        Show this help
-c, --config      Specify tsconfig.json file, by default `__CONF_TSCONFIG__`
-p, --postfix     Change postfix for transpiled files, by default `__CONF_POSTFIX__`

Description:

You can specify list of files to transpile
by setting `ngdtOptions.files` in `tsconfig.json`
or in CLI via <glob-files> (it will override those in config)

Examples:

# use different config file
ngdt -c another-tsconfig.json

# provide glob files via CLI
ngdt "**/tokens.*.ts" "./tokens/*.ts"

# change postfix
ngdt -p "generated"

For more information visit __WIKI__
