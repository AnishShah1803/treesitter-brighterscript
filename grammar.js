const PREC = {
  ASSIGNMENT: 1,
  NULL_COALESCE: 1,
  LOGICAL: 2,
  COMPARISON: 3,
  TERNARY: 4,
  ADDITIVE: 5,
  MULTIPLICATIVE: 6,
  UNARY: 7,
  LOGICAL_NOT: 8,
  PREFIX_INCREMENT: 9,
  PREFIX_DECREMENT: 9,
  POSTFIX_INCREMENT: 10,
  POSTFIX_DECREMENT: 10,
  RETURN: 11,
  THROW: 11,
  IF: 11,
  TYPE_CAST: 3,
  CALLFUNC: 12,
};

module.exports = grammar({
  name: 'brighterscript',

  extras: ($) => [/[\n]/, /\s/, $.comment],

  inline: ($) => [
    $.function_impl,
    $.sub_impl,
    $.comment
  ],

  conflicts: ($) => [
    [$.variable_declarator, $._prefix_exp],
    [$.class_field, $.class_method],
    [$.annotation],
    [$.compound_statement],
  ],

  rules: {
    source_file: $ => seq(
      any_amount_of($._definition),
      optional("\0")
    ),

    _definition: $ => seq(
      $._statement,
    ),

    library_statement: $ => seq(
      /library/i,
      field('path', $.string)
    ),

    import_statement: $ => seq(
      alias(/import/i, $.import),
      field('path', $.string)
    ),

    const_statement: $ => seq(
      alias(/const/i, $.const),
      field('name', $.identifier),
      '=',
      field('value', $._expression)
    ),

    function_start: () => /function/i,

    function_statement: $ => seq(
      seq($.function_start, /\s*/, field("name", $.identifier)),
      $.function_impl
    ),

    annonymous_function: $ => seq(
      seq($.function_start),
      $.function_impl
    ),

    function_impl: $ => seq(
      field('parameters', $.parameter_list),
      optional(field('return_type', $.return_type)),
      optional(field('body', choice($.block, $.inline_body))),
      $.end_statement
    ),

    sub_impl: $ => seq(
      field('parameters', $.parameter_list),
      optional(field('body', choice($.block, $.inline_body))),
      $.end_statement
    ),

    inline_body: $ => prec(2, seq(
      ':',
      $._single_line_statement,
      repeat(seq(':', $._single_line_statement))
    )),

    sub_start: () => /sub/i,

    sub_statement: $ => seq(
      seq($.sub_start, /\s*/, field("name", $.identifier)),
      $.sub_impl
    ),

    annonymous_sub: $ => seq(
      seq($.sub_start),
      $.sub_impl
    ),

    sub_impl: $ => seq(
      field('parameters', $.parameter_list),
      optional(field('body', choice($.block, $.inline_body))),
      $.end_statement
    ),

    _statement: $ => prec.right(1, choice(
      $.sub_statement,
      $.function_statement,
      $.library_statement,
      $.import_statement,
      $.const_statement,
      $.alias_statement,
      $.type_statement,
      $.constant,
      $.if_statement,
      $.conditional_compl,
      $.while_statement,
      $.for_statement,
      $.try_statement,
      $.class_statement,
      $.interface_statement,
      $.namespace_statement,
      $.enum_statement,
      $._single_line_statement,
      // $.expression_statement,
    )),

    _single_line_statement: $ => prec(2, choice(
      $.return_statement,
      $.assignment_statement,
      $.exit_while_statement,
      $.continue_while_statement,
      $.continue_for_statement,
      $.exit_for_statement,
      $.function_call,
      $.print_statement,
      $.throw_statement,
      $.increment_decrement_statement,
      $.compound_statement,
    )),

    compound_statement: $ => seq(
      $._single_line_statement,
      repeat1(seq(':', $._single_line_statement))
    ),

    _expression: $ => choice(
      $.new_expression,
      $.ternary_expression,
      $.null_coalescing_expression,
      $.type_cast_expression,
      $.parenthesized_expression,
      $.prefix_exp,
      $.literal,
      $.binary_expression,
      $.unary_expression,
      $.tagged_template_string,
      $.annonymous_sub,
      $.annonymous_function
    ),

    conditional_compl: $ => seq(
      alias(/#if/, $.if_start),
      $._expression,
      $._new_line,
      repeat($._statement),
      optional($.conditional_compl_else_if_clause),
      optional($.conditional_compl_else_clause),
      $.end_statement
    ),

    conditional_compl_else_if_clause : $ => seq(
        alias(/#else if/, $.else_if),
        $._expression,
        $._new_line,
        repeat($._statement)
    ),

    conditional_compl_else_clause : $ => seq(
        alias(/#else/, $.else),
        $._new_line,
        repeat($._statement)
    ),

    // The main entry point for if statements
    if_statement: $ =>
      choice(
        $.multi_line_if,
        $.single_line_if,
      ),

    single_line_if: $ => prec.right(seq(
      alias(/if/i, $.if_start),
      $._expression,
      optional(alias(/then/i, $.then)),
      $._single_line_statement,
      optional(seq(
        alias(/else/i, $.else),
        $._single_line_statement
      )),
      choice(
        '\n',
        '\r\n',
        '\r'
      )
    )),

    // Multi-line if statement
    multi_line_if: $ => seq(
      alias(/if/i, $.if_start),
      $._expression,
      optional(alias(/then/i, $.then)),
      $.if_block,
    ),

    if_block: $ => seq(
      $._new_line,
      repeat($._statement),
      repeat($.else_if_clause),
      optional($.else_clause),
      $.end_statement
    ),

    single_line_if_block: $ => seq(
      $._statement,
      optional(seq(alias(/else/i, $.else), $._statement)),
    ),

    else_if_clause: $ => seq(
      alias(/else if/i, $.else_if),
      field('condition', $._expression),
      optional(alias(/then/i, $.then)),
      optional(field('consequence', repeat1($._statement)))
    ),

    else_clause: $ => seq(
      alias(/else/i, $.else),
      optional(field('consequence', repeat1($._statement)))
    ),

    for_statement: $ => seq(
      alias(/for/i, $.for_start),
      choice(
        seq(
          field('initializer', $.assignment_statement),
          alias(/to/i, $.for_to),
          field('condition', $._expression),
          optional(seq(alias(/step/i, $.for_step), field('increment', $._expression)))
        ),
        seq(
          alias(/each/i, $.for_each),
          field('variable', $._expression),
          alias(/in/i, $.for_in),
          field('collection', $._expression)
        )
      ),
      optional(field('body', $.block)),
      $.end_statement
    ),

    while_statement: $ => seq(
      alias(/while/i, $.while_start),
      field('condition', $._expression),
      optional(field('body', $.block)),
      $.end_statement
    ),

    try_statement: $ => seq(
      alias(/try/i, $.try_start),
      optional(field('body', $.block)),
      optional(field('handler', $.catch_clause)),
      $.end_statement
    ),

    catch_clause: $ => seq(
      alias(/catch/i, $.try_catch),
      field('exception', $.identifier),
      optional(field('body', $.block))
    ),

    class_statement: $ => seq(
      optional(repeat1(field('annotation', $.annotation))),
      alias(/class/i, $.class_start),
      field('name', $.identifier),
      optional($.class_heritage),
      optional(field('body', $.class_body)),
      $.end_class
    ),

    class_heritage: $ => seq(
      alias(/extends/i, $.extends),
      field('superclass', $.identifier),
      optional($.class_implements)
    ),

    class_implements: $ => seq(
      alias(/implements/i, $.implements),
      commaSep1(field('interface', $.identifier))
    ),

    class_body: $ => repeat1($.class_member),

    class_member: $ => choice(
      $.class_field,
      $.class_method
    ),

    class_field: $ => seq(
      optional(repeat1(field('annotation', $.annotation))),
      optional($.access_modifier),
      field('name', $.identifier),
      optional(choice(
        seq($.type_specifier, optional(seq('=', field('value', $._expression)))),
        seq('=', field('value', $._expression), optional($.type_specifier))
      ))
    ),

    class_method: $ => seq(
      optional(repeat1(field('annotation', $.annotation))),
      optional($.access_modifier),
      optional(alias(/override/i, $.override)),
      choice(
        $.function_statement,
        $.sub_statement
      )
    ),

    access_modifier: $ => choice(
      alias(/public/i, $.public),
      alias(/private/i, $.private),
      alias(/protected/i, $.protected)
    ),

    exit_while_statement: $ => seq(
      /exit/i,
      /while/i
    ),

    continue_while_statement: $ => seq(
      /continue/i,
      /while/i
    ),

    exit_for_statement: $ => seq(
      /exit/i,
      /for/i
    ),

    continue_for_statement: $ => seq(
      /continue/i,
      /for/i
    ),

    return_statement: $ => prec.right(PREC.RETURN, seq(
      alias(/return/i, $.return),
      optional(field('value', $._expression))
    )),

    assignment_statement: $ => prec(PREC.ASSIGNMENT, seq(
      field('left', $.variable_declarator),
      field('operator', choice('=', '+=', '-=', '*=', '/=', '\\=', '<<=', '>>=')),
      field('right', $._expression)
    )),

    print_statement: $ => seq(
      alias(choice(/print/i, '?'), $.print),
      field('arguments', seq($._expression, repeat(seq(choice(',', ';'), $._expression)))),
    ),

    throw_statement: $ => prec.right(PREC.THROW, seq(
      alias(/throw/i, $.throw),
      optional(field('value', $._expression))
    )),

    increment_decrement_statement: $ => choice(
      $.prefix_increment_expression,
      $.prefix_decrement_expression,
      $.postfix_increment_expression,
      $.postfix_decrement_expression,
    ),

    prefix_increment_expression: $ => prec.right(PREC.PREFIX_INCREMENT, seq('++', field('argument', $._expression))),
    prefix_decrement_expression: $ => prec.right(PREC.PREFIX_DECREMENT, seq('--', field('argument', $._expression))),
    postfix_increment_expression: $ => prec.left(PREC.POSTFIX_INCREMENT, seq(field('argument', $._expression), '++')),
    postfix_decrement_expression: $ => prec.left(PREC.POSTFIX_DECREMENT, seq(field('argument', $._expression), '--')),

    block: $ => repeat1(
      $._statement
    ),

    parameter_list: $ => seq(
      '(',
      commaSep($.parameter),
      ')'
    ),

    parameter: $ => seq(
      field('name', $.identifier),
      optional($.type_specifier),
      optional(seq('=', field('default', $._expression))),
      optional($.type_specifier)
    ),

    return_type: $ => $.type_specifier,

    _type_base: $ => choice(
      /boolean/i,
      /integer/i,
      /float/i,
      /double/i,
      /string/i,
      /object/i,
      /dynamic/i,
      /void/i,
      $.dotted_identifier
    ),

    _type_array: $ => seq(
      field('element_type', $._type_base),
      '[]'
    ),

    _type_with_array: $ => choice(
      $._type_base,
      $._type_array
    ),

    type_specifier: $ => seq(
      $.as,
      field('type', $._type_with_array),
      optional(repeat1(seq($.or, $._type_with_array)))
    ),

    _prefix_exp: ($) =>
      choice(
        $._var,
        $.function_call
      ),

    left_paren: (_) => "(",
    right_paren: (_) => ")",

    prefix_exp: ($) => $._prefix_exp,

    function_call: $ => prec.right(1,seq(
      field('function', $.prefix_exp),
      field('arguments', $.parenthesized_expression)
    )),

    variable_declarator: ($) => $._var,

    _var: ($) =>
      prec.right(1, choice(
        $.identifier,
        seq($.prefix_exp, choice('[', '?['), commaSep1($._expression), ']'),
        seq($.prefix_exp, choice('.', '?.'), $.identifier),
        seq($.prefix_exp, '@.', $.identifier),
      )),

    // Expressions
    call_expression: $ => prec(15,seq(
      field('function', choice(
        $.identifier,
        $.property_access_expression
      )),
      field('arguments', $.parenthesized_expression)
    )),

    binary_expression: $ => choice(
      $.logical_expression,
      $.comparison_expression,
      $.arithmetic_expression
    ),

    logical_expression: $ => prec.left(PREC.LOGICAL, choice(
      seq(field('left', $._expression), field('operator', $.and), field('right', $._expression)),
      seq(field('left', $._expression), field('operator', $.or),  field('right', $._expression))
    )),

    comparison_expression: $ => prec.left(PREC.COMPARISON, choice(
      seq(field('left', $._expression), field('operator', '='),   field('right', $._expression)),
      seq(field('left', $._expression), field('operator', '<>'),  field('right', $._expression)),
      seq(field('left', $._expression), field('operator', '<'),   field('right', $._expression)),
      seq(field('left', $._expression), field('operator', '<='),  field('right', $._expression)),
      seq(field('left', $._expression), field('operator', '>'),   field('right', $._expression)),
      seq(field('left', $._expression), field('operator', '>='),  field('right', $._expression)),
    )),

    arithmetic_expression: $ => choice(
      $.additive_expression,
      $.multiplicative_expression
    ),

    additive_expression: $ => prec.left(PREC.ADDITIVE, choice(
      seq(field('left', $._expression), field('operator', '+'), field('right', $._expression)),
      seq(field('left', $._expression), field('operator', '-'), field('right', $._expression))
    )),

    multiplicative_expression: $ => prec.left(PREC.MULTIPLICATIVE, choice(
      seq(field('left', $._expression), field('operator', '*'),  field('right', $._expression)),
      seq(field('left', $._expression), field('operator', '/'),  field('right', $._expression)),
      seq(field('left', $._expression), field('operator', '\\'),  field('right', $._expression)),
      seq(field('left', $._expression), field('operator', $.mod), field('right', $._expression))
    )),

    unary_expression: $ => prec.right(PREC.UNARY, choice(
      $.logical_not_expression,
    )),

    logical_not_expression: $ => prec.right(PREC.LOGICAL_NOT, seq(
      field('operator', $.not),
      field('argument', $._expression)
    )),

    ternary_expression: $ => prec.right(PREC.TERNARY, seq(
      field('condition', choice($.binary_expression, $.prefix_exp, $.literal, $.unary_expression)),
      '?',
      field('consequence', $._expression),
      ':',
      field('alternative', $._expression)
    )),

    null_coalescing_expression: $ => prec.left(PREC.NULL_COALESCE, seq(
      field('left', $._expression),
      '??',
      field('right', $._expression)
    )),

    type_cast_expression: $ => prec.left(PREC.TYPE_CAST, seq(
      field('value', $._expression),
      $.as,
      field('type', $._type_with_array)
    )),

    new_expression: $ => prec.right(5, seq(
      alias(/new/i, $.new),
      field('class', $.dotted_identifier),
      field('arguments', $.parenthesized_expression)
    )),

    parenthesized_expression: $ => seq(
      '(',
      commaSep($._expression),
      ')'
    ),

    property_access_expression: $ => prec.left(2, seq(
      field('object', choice(
        $.identifier,
        $.property_access_expression,
        $.call_expression,
        $.array_access_expression
      )),
      choice('.', '?.'),
      field('property', choice(
        $.identifier,
        $.call_expression,
        $.array_access_expression
      ))
    )),

    array_access_expression: $ => prec(1, seq(
      field('array', choice(
        $.identifier,
        $.array_access_expression,
        $.call_expression
      )),
      '[',
      field('index', $._expression),
      ']'
    )),

    comment: $ => seq("'", /.*/),
    constant: $ => seq("#const", $.assignment_statement),

    // Literals
    literal: $ => choice(
      $.invalid,
      $.boolean,
      $.number,
      $.string,
      $.template_string,
      $.regex_literal,
      $.source_literal,
      $.array,
      $.assoc_array
    ),

    boolean: $ => choice(
      /true/i,
      /false/i
    ),

    number: $ => /-?\d+(\.\d+)?/,

    string: $ => seq(
      '"',
      repeat(choice(
        alias(/[^"]+/, $.string_contents),
        alias(seq('""'), $.escaped_quote)
      )),
      '"'
    ),

    string_contents: $ => /[^"]*/,

    // Template strings (backtick strings with ${} interpolation)
    template_string: $ => seq(
      '`',
      repeat(choice(
        alias(seq('\\`'), $.escaped_backtick),
        alias(seq('\\$'), $.escaped_dollar),
        alias("'", $.template_single_quote),
        alias(/[^`$\\]+/, $.template_literal),
        $.template_interpolation
      )),
      '`'
    ),

    template_interpolation: $ => seq(
      '${',
      $._expression,
      '}'
    ),

    // Tagged template string: tag`text ${expr}`
    tagged_template_string: $ => prec(15, seq(
      field('tag', $.identifier),
      field('template', $.template_string)
    )),

    // Regex literal: /pattern/flags
    regex_literal: $ => seq(
      '/',
      field('pattern', alias(/[^/\n]+/, $.regex_pattern)),
      '/',
      optional(field('flags', alias(/[gimsuy]+/, $.regex_flags)))
    ),

    // Source literals (compile-time constants)
    source_literal: $ => choice(
      /SOURCE_FILE_PATH/,
      /SOURCE_LINE_NUM/,
      /SOURCE_FUNCTION_NAME/,
      /SOURCE_LOCATION/,
      /PKG_PATH/,
      /PKG_ROOT_DIR/,
      /LINE_NUM/
    ),

    // Alias statement: alias MyType = OtherType
    alias_statement: $ => seq(
      alias(/alias/i, $.alias),
      field('name', $.identifier),
      '=',
      field('type', $._type_with_array)
    ),

    // Type statement: type MyUnion = string or integer
    type_statement: $ => seq(
      alias(/type/i, $.type),
      field('name', $.identifier),
      '=',
      field('type', $.type_union)
    ),

    type_union: $ => seq(
      $._type_with_array,
      repeat1(seq($.or, $._type_with_array))
    ),

    invalid: $ => /invalid/i,

    array: $ => seq(
      '[',
      optional($._new_line),
      optional(seq(
        $._expression,
        repeat(seq(
          optional(','),
          optional($._new_line),
          $._expression
        )),
        optional(','),
        optional($._new_line)
      )),
      ']'
    ),

    assoc_array: $ => seq(
      '{',
        optional(commaSepNewLine($.assoc_array_element)),
      '}'
    ),

    assoc_array_element: $ => seq(
      field('key', choice(
        $.identifier,
        $.string
      )),
      ':',
      field('value', $._expression)
    ),

    not: $ => /not/i,
    and: $ => /and/i,
    or: $ => /or/i,
    mod: $ => /mod/i,
    as: $ => /as/i,
    new: $ => /new/i,

    end_sub: $ => /end\s+sub/i,
    end_function: $ => /end\s+function/i,
    end_if: $ => /end\s+if/i,
    end_for: $ => choice(/end\s+for/i, /next/i),
    end_while: $ => /end\s+while/i,
    end_try: $ => /end\s+try/i,
    end_class: $ => /end\s+class/i,

    interface_statement: $ => seq(
      alias(/interface/i, $.interface_start),
      field('name', $.identifier),
      optional(field('body', $.interface_body)),
      $.end_interface
    ),

    interface_body: $ => repeat1($.interface_member),

    namespace_statement: $ => seq(
      alias(/namespace/i, $.namespace_start),
      field('name', $.dotted_identifier),
      optional(field('body', $.namespace_body)),
      $.end_namespace
    ),

    dotted_identifier: $ => seq(
      $.identifier,
      repeat(seq('.', $.identifier))
    ),

    namespace_body: $ => repeat1($._statement),

    enum_statement: $ => seq(
      alias(/enum/i, $.enum_start),
      field('name', $.identifier),
      optional(field('body', $.enum_body)),
      $.end_enum
    ),

    enum_body: $ => repeat1($.enum_member),

    enum_member: $ => seq(
      field('name', $.identifier),
      optional(seq('=', field('value', $._expression)))
    ),

    interface_member: $ => choice(
      $.interface_field,
      $.interface_method_signature
    ),

    interface_field: $ => seq(
      field('name', $.identifier),
      $.type_specifier
    ),

    interface_method_signature: $ => seq(
      choice(
        seq($.sub_start, field('name', $.identifier), $.parameter_list),
        seq($.function_start, field('name', $.identifier), $.parameter_list, optional($.return_type))
      )
    ),

    end_interface: $ => /end\s+interface/i,
    end_namespace: $ => /end\s+namespace/i,
    end_enum: $ => /end\s+enum/i,
    conditional_compl_end_if: $ => /#end\s+if/i,

    end_statement: $ => choice(
      $.end_sub,
      $.end_function,
      $.end_if,
      $.conditional_compl_end_if,
      $.end_for,
      $.end_while,
      $.end_try,
      $.end_class,
      $.end_namespace,
      $.end_enum
    ),

    _new_line: $ => /\r?\n/,

    // Annotations
    annotation: $ => seq(
      '@',
      field('name', $.identifier),
      optional(choice(
        $.annotation_arguments,
        seq(field('target', $.identifier), $.type_specifier)
      ))
    ),

    annotation_arguments: $ => seq(
      '(',
      commaSep(choice(
        field('positional', $._expression),
        field('named', $.annotation_named_argument)
      )),
      ')'
    ),

    annotation_named_argument: $ => seq(
      field('key', $.identifier),
      '=',
      field('value', $._expression)
    ),

    // Miscellaneous
    identifier: $ => choice($.m, $.super, $.regular_identifier),
    m: $ => /m/i,
    super: $ => /super/i,
    regular_identifier: $ => token(prec(0, /[a-zA-Z_][a-zA-Z0-9_]*/)),
  }
});

function commaSep(rule) {
  return optional(
    seq(
      rule,
      repeat(
        seq(
          ',',
          rule
        )
      )
    )
  )
}

function commaSepNewLine(rule) {
  return optional(
    seq(
      rule,
      repeat(
        seq(
          optional(','),
          rule
        )
      )
    )
  )
}

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}

function any_amount_of() {
  return repeat(seq(...arguments));
}
