/*
 * a node.js test runner that executes all conformance
 * tests and outputs results to console.
 * Process returns zero on success, non-zero on failure.
 */

const   fs = require('fs'),
      path = require('path'),
jsonselect = require('../jsonselect.js'),
       sys = require('sys');

var pathToTests = path.join(__dirname, "tests");

// a map: document nametest name -> list of se
var numTests = 0;
var numPassed = 0;
var tests = {};

function runOneSync(name, selname) {
    var testDocPath = path.join(pathToTests, name + ".json");
    var selDocPath = path.join(pathToTests, name + '_' +
                               selname + ".selector");
    var outputDocPath = selDocPath.replace(/selector$/, "output");

    // take `obj`, apply `sel, get `got`, is it what we `want`? 
    var obj = JSON.parse(fs.readFileSync(testDocPath));
    var want = String(fs.readFileSync(outputDocPath)).trim();
    var got = "";
    var sel = String(fs.readFileSync(selDocPath)).trim();

    jsonselect.forEach(sel, obj, function(m) {
        got += JSON.stringify(m, undefined, 4) + "\n";
    });
    if (want.trim() != got.trim()) throw "mismatch";
}


 function runTests() {
     console.log("Running Tests:"); 
    for (var d in tests) {
        console.log("  tests against '" + d + ".json`:");
        for (var i = 0; i < tests[d].length; i++) {
            sys.print("    " + tests[d][i] + ": ");
            try {
                runOneSync(d, tests[d][i]);
                numPassed++;
                console.log("pass");
            } catch (e) {
                console.log("fail (" + e.toString() + ")");
            }
        }
    }
    console.log(numPassed + "/" + numTests + " passed");
    process.exit(numPassed == numTests ? 0 : 1);
}

// discover all tests
fs.readdir(pathToTests, function(e, files) {
    for (var i = 0; i < files.length; i++) {
        var f = files[i];
        var m = /^([A-Za-z]+)_(.+)\.selector$/.exec(f);
        if (m) {
            if (!tests.hasOwnProperty(m[1])) tests[m[1]] = [];
            numTests++;
            tests[m[1]].push(m[2]);
        }
    }
    runTests();
});
