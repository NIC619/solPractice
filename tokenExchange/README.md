# Solidity Tokens Trading Contract (Demo)

Self enforcing contracts implemented in Ethereum Solidity smart contract language.

## Short Introduction
Roles in the scenario include a third party, companies issuing tokens and users.
Companies can register(issue) new token and give them to users.
When two companies reach an agreement, they can set up an exchange contract along with the third party(via voting). Then users can exchange their token via the exchange contract.

Note that
- You can modify multiSig contract so that no third party is involved. Since setting up an exchange contract only requires agreement from both companies.
- Users are actually exchanging tokens with companys instead of users via the exchange contract.
- For efficiency, in current design, company will do the exchange for users meaning users don't really involved in the exchange process. This might not be ideal.

<br>
Fututre work will include a direct exchange between users instead of an exchange contract. But it might be a lot more complicate.

IMPORTANT NOTE: Don't use this project in production. The code is for research and demonstration purpose.


## Features

- Companies can register/issue their token
- Companies can set up an exchange contract as long as they reach an agreement via voting contract.
- users exchange for token they need via exchange contract.


## Contract Details

- `tokenManage`: Represents the company and record all tokens register/issued by the company. Company use this contract to issue/vote/exchange tokens.
- `tokenInfo`: Represents a token issued by company. It provides functions for users to check their balance. Only the company and exchange contract can execute the `update` function.
- `multisig`: Contract for companies to start a vote and to vote on whether to set up an exchange contract or not.
- `tokenExchange`: Exchange contract for companies to exchange token



## Getting Started

1. **Company register**: Company starts a `tokenManage` contract and treat it as a proxy and record.
2. **Create/Issue/Revoke a token**: Comapny creates a `tokenInfo` contract to manage distribution of the token. This contract only executes function call from `tokenMange` that creates it.
3. **Voting to start an exchange contract**: Company can start a vote on `multiSig` contract and uses a 32 bytes hash as an identifier, then the other company can join the vote with this identifier. If enough up votes are casted, `multiSig` contract will create a `tokenExchange` contract.
4. **Request for tokens exchange**: For example: If user X wants to exchange his token AA from company A for token BB from company B, X first inform company A of this reuest(by e-mail, etc.). Then if there's an exchange contract set up by A and B, A can make a call to exchange contract(`tokenExchange`). If not, A can consider to start one and negotiate with B(by e-mail, etc.)
5. **Exchange takes place**: Exchange contract(`tokenExchange`) will first check whether user X has enough token AA as he claims. If he does, check whether company B has enough token BB. If it does, exchange takes place. Token AA of user X goes to company B and token BB of comanpy B goes to user X. 


## Taipei Ethereum Meetup (Not in English)

I've demo this project in the [Taipei Ethereum Meetup](http://www.meetup.com/Taipei-Ethereum-Meetup/) . Check out video and slides to learn more about this project.

- Video: 
- Slides: 