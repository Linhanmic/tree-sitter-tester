import XCTest
import SwiftTreeSitter
import TreeSitterTester

final class TreeSitterTesterTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_tester())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Tester grammar")
    }
}
