# Fish shell completions for gotta-go-fast

# Disable default file completions for options that take non-file arguments
complete -c gotta-go-fast -s h -l height -r -d "Maximum number of lines to sample (default: 20)"
complete -c gotta-go-fast -l max-paragraph-len -l maxparagraphlen -r -d "Maximum length of a sampled paragraph in words (default: 750)"
complete -c gotta-go-fast -l min-paragraph-len -l minparagraphlen -r -d "Minimum length of a sampled paragraph in words (default: 250)"
complete -c gotta-go-fast -s l -l nonsense-len -l nonsenselen -r -d "Length of nonsense to generate in words (default: 500)"
complete -c gotta-go-fast -s p -l paragraph -d "Sample a paragraph from the input files"
complete -c gotta-go-fast -s r -l reflow -d "Reflow paragraph to target width"
complete -c gotta-go-fast -s t -l tab -r -d "Size of a tab in spaces (default: 4)"
complete -c gotta-go-fast -s w -l width -r -d "Width at which to wrap lines (default: 80)"
complete -c gotta-go-fast -l fg-empty -l fgempty -r -d "ANSI colour code for empty text (default: 8)"
complete -c gotta-go-fast -l fg-error -l fgerror -r -d "ANSI colour code for errors (default: 1)"
complete -c gotta-go-fast -s '?' -l help -d "Display help summary and exit"
complete -c gotta-go-fast -s V -l version -d "Display version information and exit"
