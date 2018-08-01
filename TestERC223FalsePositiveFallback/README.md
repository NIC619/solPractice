Test the case where receiver contract did not implement `tokenFallback` function but implement the fallback function which in usual cases will execute successfully. This will result in tokens accidentally sent to a contract which does not expect to and can not send/receive tokens.

By expecting a pre-selected magic number as returned value in token contract, this problem can be solved because fallback function does not return any value.

* Note: Currently this only works with compiler with version >=0.4.21 as contracts compiled in newer version will revert if there's no matching function identifier, i.e. it will revert if `tokenFallback` function is expected to return any value, e.g., `tokenFallback(...) public returns (...)`.*