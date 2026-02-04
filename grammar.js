/**
 * @file DSL for ECU test! Make test easy -_-
 * @author Linhanmic <Linhanmic@qq.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "tester",

  extras: ($) => [
    /\s/, // whitespace
    $.comment,
  ],

  rules: {
    // 整个脚本
    source_file: ($) =>
      seq(optional($.configuration_block), repeat($.test_suite)),

    // 配置块
    configuration_block: ($) =>
      seq(
        "tset",
        repeat(
          choice(
            $.channel_configuration,
            $.diagnose_configuration,
            $.tcans_command,
          ),
        ),
        "tend",
      ),

    // 通道配置
    channel_configuration: ($) =>
      choice($.tcaninit_command, $.tcans_ch_def_command),

    // 通道初始化
    tcaninit_command: ($) =>
      seq(
        "tcaninit",
        field("device_id", $.integer),
        ",",
        field("device_index", $.integer),
        ",",
        field("channel_index", $.integer),
        ",",
        field("arbitration_baudrate", $.integer),
        optional(seq(",", field("data_baudrate", $.integer))),
      ),

    // tcans默认通道配置
    tcans_ch_def_command: ($) =>
      seq("tcans_ch_def", repeat(field("channel_index", $.integer))),

    // 诊断配置
    diagnose_configuration: ($) =>
      choice(
        $.tdiagnose_sid_command,
        $.tdiagnose_rid_command,
        $.tdiagnose_keyk_command,
        $.tdiagnose_dtc_command,
      ),

    // 诊断请求ID配置
    tdiagnose_sid_command: ($) =>
      seq(
        "tdiagnose_sid",
        field("request_id", choice($.hex_number, $.hex_number_without_0x)),
      ),

    // 诊断响应ID配置
    tdiagnose_rid_command: ($) =>
      seq(
        "tdiagnose_rid",
        field("response_id", choice($.hex_number, $.hex_number_without_0x)),
      ),

    // 诊断kkey配置
    tdiagnose_keyk_command: ($) =>
      seq(
        "tdiagnose_keyk",
        field("keyk", choice($.hex_number, $.hex_number_without_0x)),
      ),

    // 诊断故障码配置
    tdiagnose_dtc_command: ($) =>
      seq(
        "tdiagnose_dtc",
        field("dtc", choice($.hex_number, $.hex_number_without_0x)),
        ",",
        field("description", $.string),
      ),

    // tcans命令配置
    tcans_command: ($) =>
      seq(
        "tcans",
        optional(seq(field("send_channel", $.integer), ",")),
        field("message_id", choice($.hex_number, $.hex_number_without_0x)),
        ",",
        field("message_data", $.data_sequence),
        ",",
        field("period", $.integer),
        ",",
        field("count", $.integer),
      ),

    // 测试用例集配置
    test_suite: ($) =>
      seq(
        "ttitle",
        "=",
        field("title", $.string),
        repeat1($.test_case),
        "ttitle-end",
      ),

    // 测试用例配置
    test_case: ($) =>
      seq(
        optional(field("id", $.integer)),
        "tstart",
        "=",
        field("title", $.string),
        repeat($.test_command),
        "tend",
      ),

    // 测试命令配置
    test_command: ($) =>
      seq(choice($.tcans_command, $.tcanr_command, $.tdelay_command)),

    // tcanr命令配置
    tcanr_command: ($) =>
      choice($.tcanr_compare_command, $.tcanr_print_command),

    // tcanr对比命令配置
    tcanr_compare_command: ($) =>
      choice($.tcanr_bit_compare_command, $.tcanr_direct_compare_command),

    // tcanr位域对比命令配置
    tcanr_bit_compare_command: ($) =>
      seq(
        "tcanr",
        optional(repeat(seq(field("receive_channel", $.integer), ","))),
        field("message_id", choice($.hex_number, $.hex_number_without_0x)),
        ",",
        field(
          "expected_bit_range",
          seq($.bit_range, repeat(seq("+", $.bit_range))),
        ),
        ",",
        field(
          "expected_data",
          seq(
            choice($.hex_number, $.hex_number_without_0x, $.integer),
            repeat(
              seq(
                "+",
                choice($.hex_number, $.hex_number_without_0x, $.integer),
              ),
            ),
          ),
        ),
        ",",
        field("wait_time", $.integer),
      ),

    // tcanr直接对比命令配置
    tcanr_direct_compare_command: ($) =>
      seq(
        "tcanr",
        optional(repeat(seq(field("receive_channel", $.integer), ","))),
        field("message_id", choice($.hex_number, $.hex_number_without_0x)),
        ",",
        field("expected_data", $.data_sequence),
        ",",
        field("wait_time", $.integer),
      ),

    // tcanr打印命令配置
    tcanr_print_command: ($) =>
      seq(
        "tcanr",
        optional(repeat(seq(field("receive_channel", $.integer), ","))),
        field("message_id", choice($.hex_number, $.hex_number_without_0x)),
        ",",
        field(
          "expected_bit_range",
          seq($.bit_range, repeat(seq("+", $.bit_range))),
        ),
        ",",
        "print",
      ),

    // 延时命令配置
    tdelay_command: ($) => seq("tdelay", field("delay_time", $.integer)),

    // 注释
    comment: ($) =>
      choice(
        seq("//", field("message", $.string)),
        seq("tnote", "=", field("message", $.string)),
      ),

    // =======================================数据格式=======================================
    // 数据序列
    data_sequence: ($) =>
      seq($.byte_data, repeat(seq(choice("-", /\s+/), $.byte_data))),

    // 字节数据
    byte_data: ($) => /[0-9A-Fa-f]{2}/,

    // 十六进制数
    hex_number: ($) => /0x[0-9A-Fa-f]+/,
    hex_number_without_0x: ($) => /[0-9A-Fa-f]+/,

    // 整数
    integer: ($) => /-?\d+/,

    // 字符串
    string: ($) => /[^\n]+/,

    // 位
    bit: ($) => /[0-9]+\.[0-7]/,
    // 位域范围
    bit_range: ($) =>
      seq(field("start_bit", $.bit), "-", field("end_bit", $.bit)),
  },
});
