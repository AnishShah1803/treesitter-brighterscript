; Identifiers
(identifier) @variable

; Function declaration
(function_statement
  name: (identifier) @function)

; Sub declaration
(sub_statement
  name: (identifier) @function)

[
  (sub_start)
  (function_start)
  (end_sub)
  (end_function)
] @keyword.function

; Class keywords
[
  (class_start)
  (end_class)
  (extends)
  (implements)
] @keyword.class

(class_statement
  name: (identifier) @class.name)

(class_heritage
  superclass: (identifier) @class.superclass)

(class_implements
  interface: (identifier) @class.interface)

(access_modifier
  [
    (public)
    (private)
    (protected)
  ] @keyword.modifier)

(override) @keyword.modifier

; Annotations
(annotation
  name: (identifier) @attribute)

; New expression
(new) @keyword

; Interface keywords
[
  (interface_start)
  (end_interface)
] @keyword.interface

(interface_statement
  name: (identifier) @interface.name)

; Namespace keywords
[
  (namespace_start)
  (end_namespace)
] @keyword.namespace

(namespace_statement
  name: (dotted_identifier) @namespace.name)

; Enum keywords
[
  (enum_start)
  (end_enum)
] @keyword.enum

(enum_statement
  name: (identifier) @enum.name)

(enum_member
  name: (identifier) @enum.member)

; Parameters
(parameter
  name: (identifier) @variable.parameter)

; Types
(type_specifier) @type

; Variables
; Base variable in variable declarator (immediate child of prefix_exp)
(variable_declarator
  (prefix_exp
    (identifier) @variable
    (#not-has-ancestor? @variable prefix_exp)))

; Properties in variable declarator
(variable_declarator
  (prefix_exp)
  (identifier) @property)

(multiplicative_expression
  operator: (_) @keyword.operator)

(logical_not_expression
  operator: (_) @keyword.operator)

(logical_expression
  operator: (_) @keyword.operator)

; Property access
; First identifier in a chain (base variable)
(prefix_exp
  .
  (identifier) @variable
  (#not-has-ancestor? @variable prefix_exp))

; All other identifiers in a chain (properties)
(prefix_exp
  (prefix_exp)
  (identifier) @property)

; Function calls
(function_call
  function: (prefix_exp
    (identifier) @function.call))

; Statements
[
  (if_start)
  (else)
  (else_if)
  (end_if)
  (then)
  (conditional_compl_end_if)
] @keyword.conditional

[
  (for_start)
  (while_start)
  (for_each)
  (for_in)
  (for_to)
  (for_step)
  (end_for)
  (end_while)
  (exit_while_statement)
  (exit_for_statement)
  (continue_while_statement)
  (continue_for_statement)
] @keyword.repeat

; Statements
[
  (try_start)
  (try_catch)
  (throw)
  (end_try)
] @keyword.exception

(return) @keyword.return

(print) @function.builtin

(constant) @constant

; Const statements
(const_statement) @keyword.const

(const_statement
  name: (identifier) @constant.name)

; Operators
[
  "="
  "<>"
  "<"
  "<="
  ">"
  ">="
  "+"
  "-"
  "*"
  "/"
] @operator

; Literals
(boolean) @boolean

(number) @number

(string) @string

(template_string) @string
(template_literal) @string
(escaped_backtick) @string
(escaped_dollar) @string

(invalid) @constant.builtin

; Comments
(comment) @comment @spell

; Punctuation
[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
  "?["
] @punctuation.bracket

[
  "."
  ","
  "?."
] @punctuation.delimiter

; Special highlights for library statements
(library_statement) @keyword.import

(library_statement
  path: (string) @module)

; Import statements
(import_statement) @keyword.import

(import_statement
  path: (string) @module)

; Array and associative array literals
(array) @constructor

(assoc_array) @constructor

(assoc_array_element
  key: (identifier) @property)

; Increment/decrement operators
[
  (prefix_increment_expression)
  (prefix_decrement_expression)
  (postfix_increment_expression)
  (postfix_decrement_expression)
] @operator

; Comparison operators
(comparison_expression
  [
    "="
    "<>"
    "<"
    "<="
    ">"
    ">="
  ] @operator)

; Ternary operators
[
  "?"
  ":"
] @operator

; Callfunc operator
"@." @operator

(as) @keyword.operator
(m) @keyword

; Alias and type statements
(alias) @keyword
(type) @keyword

(alias_statement
  name: (identifier) @type.definition)

(type_statement
  name: (identifier) @type.definition)

(type_union) @type

; Type cast expression
(type_cast_expression
  type: (_) @type)

; Source literals
(source_literal) @constant.builtin

; Regex literals
(regex_literal) @string.regex
(regex_pattern) @string.regex
(regex_flags) @string.regex

; Tagged template strings
(tagged_template_string
  tag: (identifier) @function.call)

; Template strings
(template_interpolation) @punctuation.bracket
