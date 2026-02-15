# tree-sitter-brighterscript

A [Tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar for [BrighterScript](https://github.com/RokuCommunity/brighterscript), a superset of Roku's BrightScript language used for Roku channel development.

## Overview

This grammar provides syntax highlighting, code folding, indentation, and text object support for BrighterScript files (`.bs` and `.brs` extensions). It is designed to work with Neovim's nvim-treesitter plugin and other Tree-sitter compatible editors.

## Supported Syntax

### Classes
```brighterscript
class MyClass extends BaseClass implements IInterface
    public name as string
    private age = 0
    
    sub new()
        ' constructor
    end sub
    
    public function getName() as string
        return m.name
    end function
    
    override function process() as void
        ' override method
    end function
end class
```

### Interfaces
```brighterscript
interface IMyInterface
    sub doSomething()
    function getValue() as integer
    function processData(data as string) as boolean
end interface
```

### Namespaces
```brighterscript
namespace MyApp.Utils
    const VERSION = "1.0.0"
    
    function helper() as void
        print "helper"
    end function
end namespace
```

### Enums
```brighterscript
enum Direction
    Up
    Down
    Left = 10
    Right
end enum
```

### Import Statements
```brighterscript
import "pkg:/source/utils.bs"
import "lib:/components/library.brs"
```

### Const Declarations
```brighterscript
const MAX_SIZE = 100
const API_URL = "https://api.example.com"
const ITEMS = [1, 2, 3]
const CONFIG = { key: "value", enabled: true }
```

### Expressions

**Ternary Operator:**
```brighterscript
result = condition ? valueIfTrue : valueIfFalse
```

**Null-Coalescing Operator:**
```brighterscript
value = maybeNull ?? defaultValue
```

**Template Strings:**
```brighterscript
message = `Hello ${name}, you have ${count} items`
```

**New Expression:**
```brighterscript
instance = new MyClass()
instance = new MyNamespace.MyClass(arg1, arg2)
```

### Annotations
```brighterscript
@annotation
@annotation("value")
@annotation(key="value", other=123)

class MyClass
    @field
    public name as string
    
    @method
    public sub process()
end class
```

### Type System
```brighterscript
function getValue() as MyClass
function getItems() as MyClass[]
function process(items() as string[]) as void
function getHelper() as MyApp.Utils.Helper
```

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (for npm)
- [Tree-sitter CLI](https://tree-sitter.github.io/tree-sitter/)

### Local Development

```bash
# Install dependencies
npm install

# Generate the parser
npm run build

# Run tests
npm test
```

### Neovim Integration

Using [nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter):

```lua
-- In your init.lua or plugins.lua
require('nvim-treesitter.install').ensure_installed('brighterscript')

-- Or manually clone this repo to your nvim-treesitter parsers directory
-- Typically ~/.local/share/nvim/site/pack/nvim-startup/opt/nvim-treesitter/parser/brighterscript.so
```

The parser will automatically detect `.bs` and `.brs` files.

## Query Files

This grammar includes several Tree-sitter query files:

| File | Purpose |
|------|---------|
| `highlights.scm` | Syntax highlighting |
| `folds.scm` | Code folding regions |
| `indents.scm` | Auto-indentation rules |
| `locals.scm` | Scope tracking for text objects |
| `textobjects.scm` | Text object selections |
| `injections.scm` | Language injection rules |

## Development

### Project Structure

```
.
├── grammar.js          # Grammar definition
├── src/
│   ├── grammar.json    # Generated grammar
│   ├── parser.c       # Generated parser
│   └── node-types.json
├── queries/           # Tree-sitter queries
│   ├── highlights.scm
│   ├── folds.scm
│   ├── indents.scm
│   └── ...
├── test/
│   └── corpus/        # Test cases
└── package.json
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx tree-sitter test -f "classes"
```

### Adding New Syntax

1. Edit `grammar.js` to add new grammar rules
2. Run `npm run build` to regenerate the parser
3. Add test cases in `test/corpus/<feature>.txt`
4. Run `npm test` to verify
5. Update query files in `queries/` as needed

## References

- [BrighterScript Official Repo](https://github.com/RokuCommunity/brighterscript)
- [BrighterScript Parser Source](https://github.com/RokuCommunity/brighterscript/tree/master/src/parser)
- [Tree-sitter Documentation](https://tree-sitter.github.io/tree-sitter/)
- [nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter)

## License

MIT
