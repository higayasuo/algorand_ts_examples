import fs from 'fs';

import { accountA, accountB, algodClient, algosdk } from '@/utils/helper';

const submitTransaction = async () => {
  // get suggested params from the network
  const params = await algodClient.getTransactionParams().do();

  const txn = algosdk.makePaymentTxnWithSuggestedParams(
    accountA.addr,
    accountB.addr,
    1000,
    undefined,
    undefined,
    params
  );

  const signedTxn = txn.signTxn(accountA.sk);
  fs.writeFileSync('./signed.stxn', signedTxn);

  // read signed transaction from file
  const stx = fs.readFileSync('./signed.stxn');
  fs.unlinkSync('./signed.stxn');

  const tx = await algodClient.sendRawTransaction(stx).do();
  console.log('Signed transaction with txID: %s', tx.txId);
  // Wait for confirmation
  const confirmedTxn = await algosdk.waitForConfirmation(
    algodClient,
    tx.txId,
    4
  );
  //Get the completed Transaction
  console.log(
    'Transaction ' +
      tx.txId +
      ' confirmed in round ' +
      confirmedTxn['confirmed-round']
  );
};

const main = async () => {
  await submitTransaction();
};

(async () => {
  await main();
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
