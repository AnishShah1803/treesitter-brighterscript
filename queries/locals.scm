; locals.scm - Local variable tracking for BrighterScript
; 
; This file defines:
; - Scopes: regions where variables are defined (functions, classes, namespaces, blocks)
; - Definitions: where variables are defined (parameters, variable declarations, fields)
; - References: where variables are used

; ============================================================
; SCOPES
; ============================================================

; Function and subroutine scopes
(function_statement) @scope
(sub_statement) @scope

; Class scope
(class_statement) @scope

; Namespace scope
(namespace_statement) @scope

; Block scopes (if, for, while, etc.)
(block) @scope
(if_statement) @scope
(for_statement) @scope
(while_statement) @scope
(try_statement) @scope

; ============================================================
; DEFINITIONS
; ============================================================

; Function/sub parameter definitions
(parameter
  name: (identifier) @definition)

; Function/sub name definitions
(function_statement
  name: (identifier) @definition)

(sub_statement
  name: (identifier) @definition)

; Variable declarations (left side of assignment)
; Simple variable: name = value
(variable_declarator
  .
  (identifier) @definition)

; Array element assignment: arr[0] = value  
(variable_declarator
  (prefix_exp
    .
    (identifier) @definition))

; Property assignment: obj.prop = value
(variable_declarator
  (prefix_exp
    (prefix_exp)
    .
    (identifier) @definition))

; Class field definitions
(class_field
  name: (identifier) @definition)

; Class method definitions (from nested function/sub statements)
(class_method
  .
  (function_statement
    name: (identifier) @definition))

(class_method
  .
  (sub_statement
    name: (identifier) @definition))

; Interface method signatures
(interface_method_signature
  name: (identifier) @definition)

; Enum member definitions
(enum_member
  name: (identifier) @definition)

; Namespace constant definitions
(const_statement
  name: (identifier) @definition)

; Alias name definitions
(alias_statement
  name: (identifier) @definition)

; Type name definitions
(type_statement
  name: (identifier) @definition)

; ============================================================
; REFERENCES
; ============================================================

; Identifier references (uses)
; These patterns capture variable/function uses that aren't definitions
; This is done by capturing all identifiers and filtering out definition positions

; Simple identifier reference
(identifier) @reference
