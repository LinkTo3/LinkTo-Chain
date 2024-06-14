# Security Policy

## How to disclose a vulnerability to us

### The wrong way to disclose
The following actions will disqualify you from eligibility for a reward:
1. Filing a public ticket mentioning the vulnerability
2. Testing the vulnerability on the mainnet or testnet

### The right way to disclose

#### Smart contract and infrastructure vulnerabilities
We will have a bounty program. Please wait for more details.

#### Other vulnerabilities
For vulnerabilities in any of our websites, email servers or other non-critical infrastructure, please [contact us](https://t.me/LinkTo_Global_Community). We and Labs appreciate detailed instructions for confirming the vulnerability.

## How we disclose vulnerabilities
In the event that we learn of a critical security vulnerability, we reserve the right to silently fix it without immediately publicly disclosing the existence of nature of the vulnerability.

In such a scenario we will:
1. Silently fix a vulnerability and include the fix in release X
2. After 4-8 weeks, we will disclose that X contained a security-fix
3. After an additional 4-8 weeks, we will publish details of the vulnerability along with credit to the reporter (with express permission from the reporter)

Alongside this policy, we also reserve the right to do either of the following:
- Bypass this policy and publish details on a shorter timeline
- Directly notify a subset of downstream users prior to making a public announcement

## Defensive measures during an incident
Our system does not currently have fault proofs, meaning we are able to pause the system in an emergency.

We've established some guiding criteria for disabling the system during an incident response situation:
- If an attack is ongoing: we should disable or pause in order to prevent further damage.
- If we suspect that a vulnerability might be widely known: we should disable or pause proactively.
- Otherwise: we should not disable or pause the system.
