import server from "./server";
import { secp256k1 } from 'ethereum-cryptography/secp256k1'
import { toHex, utf8ToBytes } from 'ethereum-cryptography/utils'
// const {toHex, utf8ToBytes} = require('ethereum-cryptography/utils')
import { keccak256 } from"ethereum-cryptography/keccak";
import { useState } from "react";
function Wallet({ address, setAddress, balance, setBalance }) {
  const [r, rSet] = useState("");
  const [s, sSet] = useState("");
  const [recovery, recoverySet] = useState("");
  
  async function onChange(address) {
    // const address = evt.target.value;
    setAddress(address);
    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  async function onChangeSignatureR(evt) {
    const r = evt.target.value;
    rSet(r);
    await onChangeSignature(r, s, recovery);
  }

  
  async function onChangeSignatureS(evt) 
  {
    const s = evt.target.value;
    sSet(s);
    await onChangeSignature(r, s, recovery);
  }

  async function onChangeSignatureRecovery(evt) 
  {
    const recovery = evt.target.value;
    recoverySet(recovery);
    await onChangeSignature(r, s, recovery);
  }

  async function onChangeSignature(r, s, recovery)
  {
    console.log(r, s, recovery)
    const sign = new secp256k1.Signature(BigInt(r), BigInt(s), parseInt(recovery))
    try 
    {
      if(sign)
      {
        const mUtf8 = utf8ToBytes("the content doesn't matter");
        const hash = keccak256(mUtf8);
        const address = sign.recoverPublicKey(hash).toHex();
        await onChange(address)
        // console.log(address)
      }

    }
    catch(e)
    {
      console.log('bruh', e)
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Wallet Address: {address.slice(0, 20)}...</label>

      <label>
        r
        <input placeholder="Type R signature" value={r} onChange={onChangeSignatureR}></input>
      </label>

      <label>
        s
        <input placeholder="Type S signature" value={s} onChange={onChangeSignatureS}></input>
      </label>
      
      
      <label>
        recovery bit
        <input placeholder="Type recovery bit" value={recovery} onChange={onChangeSignatureRecovery}></input>
      </label>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
