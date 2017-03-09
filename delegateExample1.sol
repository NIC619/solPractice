contract Plus {
    int z;
    function plus(int x, int y)  {
        z = x+y;
    }
}

contract Multiply {
    int z;
    function multiply(int x, int y)  {
    	z = x*y;
    }
}

contract Main {
    int public z;
    
    function delegateCall(address _dest, bytes4 sig, int x, int y)  {
        _dest.delegatecall(sig, x , y);
    }
}