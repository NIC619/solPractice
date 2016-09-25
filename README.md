# Solidity Copyright Smart Contract (Demo)

A self enforcing copyright contract implemented in Ethereum Solidity smart contract language.

IMPORTANT NOTE: Don't use this project in production. The code is for research and demonstration purpose.


## Features

- Records only the metadata or hash value of the copyright content.
- Content purchase transaction processes are self enforced once the contract initiated. All transactions are recorded on chain and publicly auditable.
- Off chain issues such as law suits or bad debt collection are of course unhandleable.


## Contract Details

- `CopyRightRecord`: An unique main contract acts as a proof of the copyright and records all transaction contracts' details.
- `oneToManyMultiSig`: An unique Multisig contract that copyright owners can vote for decisions. For example, owners can vote to reject a specific transaction contract.
- `CopyRightContract`: A transaction contract that buyer uses to purchase the right to use the content. On purchase, it logs the transaction detail on chain.


## Getting Started

- **Ownership**: existed owners can register new owners with _registerOwnership_ function or transfer ownership with _transferOwnership_ function (note if transfer ownership to owner himself, it would be taken as removing his ownership). _expireOwnership_ is for checking whether the contract is expired of not and can be called by anyone. _revokeOwnership_ is designed to be called only by trusted third party like courts or other law enforcements.
- **New Contract**: owners can set up a new transaction contract and other owners can vote to shut it down in the future with _voteUp_ function in multisig contract.
- **Voting**: every time any owner votes regarding specific transaction contract, two parameters are needed, _buyer's address_ and a _timestamp_. _timestampe_ is the identifier of specific round of voting, _timestamp_ is set to zero when no voting starts yet until someone starts a new vote. After that, person who starts the vote passes the _timestamp_ to other owners to engage in this vote.
- **Buyer tranfer money**: buy transfer money to transaction contract with _payByCount_, _payByTime_ or _oneTime_ functions.
- **Owners collect moner**: owners collect money from all transaction contracts with _collectMoney_ function and distribute proportionally to owners based on their shares with _withdraw_ (function which is an internal function).  **However, the _collectMoney_ function does not work. For the moment, my guess is that in _collectMoney_ function, the program iterates over all transaction contracts hence evm is not able to measure the approximate gas consumptions and results in failure.**


## Under development

- [ ] GameScoreBet.sol
- [ ] paymentByInstallment.sol


## Meetup talk (zh-tw, Not in English)

I've demo this project in the [Taipei Ethereum Meetup](http://www.meetup.com/Taipei-Ethereum-Meetup/) . Check out video and slides to learn more about this project.

- Video: https://www.youtube.com/watch?v=I3w9HLnDX1Q
- Slides: http://www.slideshare.net/NicholasLin15/copyrightcontractdemo