/*
simple modifier test to see the execution order when applying multiple modifier
*/

contract modifierTest{
    uint public testBit = 0;
    uint public foo1Bit = 0;
    uint public foo2Bit = 0;
    string public functionName;
    
    modifier foo1() {
        foo1Bit += 1;
        _;
        testBit = 1;
    }
    
    modifier foo2() {
        foo2Bit += 1;
        _;
        testBit = 2;
    }
    
    
    /*
    foo1Bit += 1;
    testBit = 1;
    */
    function justFoo1() foo1(){
        functionName = "justFoo1";
    }
    
    
    /*
    foo1Bit += 1;
    foo2Bit += 1;
    testBit = 2;
    testBit = 1;
    */
    function foo1Foo2() foo1() foo2() {
        functionName = "foo1Foo2";
    }
    
    
    /*
    foo2Bit += 1;
    foo1Bit += 1;
    testBit = 1;
    testBit = 2;
    */
    function foo2Foo1() foo2() foo1() {
        functionName = "foo2Foo1";
    }
    
    function clean() {
        testBit = 0;
        foo1Bit = 0;
        foo2Bit = 0;
        functionName = "clean";
    }
}