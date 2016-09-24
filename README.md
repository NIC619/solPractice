# Solidity Copyright Smart Contract (Demo)

A self enforcing copyright contract implemented in Ethereum Solidity smart contract language.

IMPORTANT NOTE: Don't use this project in production. The code is for research and demonstration purpose.


## Features

- Records only the metadata or hash value of the copyright content.
- Content purchase transaction processes are self enforced once the contract initiated. All transactions are recorded on chain and publicly auditable.
- Off chain issues such as law suits or bad debt collection are of course unhandleable.

## Getting Started

`TODO`

## Contract Details

- `CopyRightRecord`: An unique main contract acts as a proof of the copyright and records all transaction contracts' details.
- `oneToManyMultiSig`: An unique Multisig contract that copyright owners can vote for decisions. For example, owners can vote to reject a specific transaction.
- `CopyRightContract`: A transaction contract that buyer uses to purchase the right to use the content. On purchase, it logs the transaction detail on chain.


## Under development

- [ ] GameScoreBet.sol
- [ ] paymentByInstallment.sol


## Meetup talk (zh-tw, Not in English)

I've demo this project in the [Taipei Ethereum Meetup](http://www.meetup.com/Taipei-Ethereum-Meetup/) . Check out video and slides to learn more about this project.

- Video: https://www.youtube.com/watch?v=I3w9HLnDX1Q
- Slides: http://www.slideshare.net/NicholasLin15/copyrightcontractdemo