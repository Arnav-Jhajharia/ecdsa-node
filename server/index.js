const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const {secp256k1} = require('ethereum-cryptography/secp256k1')
const {toHex, utf8ToBytes} = require('ethereum-cryptography/utils')
const { keccak256 } = require("ethereum-cryptography/keccak");
// const { utf8ToBytes } = require("ethereum-cryptography/utils");


app.use(cors());
app.use(express.json());

const balances = {
  "0314a977877777e21245464822389113c8d4016a0175bcd06daa4645c0c1409a54": 100,
  "02fedfcb52d021434cef243822712d7d0508b229bb2bf971e184c0621583a2478f": 50,
  "02773411cbb64dff07eaf68a3e208faa4ef06212ca8da76737198b039a83176bab": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, r, s, recovery } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.get('/generate', (req, res) => {


  const privateKey = secp256k1.utils.randomPrivateKey()
  const publicKey = secp256k1.getPublicKey(privateKey)
  balances[toHex(publicKey)] = 0;
  res.send({"Generated private key": toHex(privateKey), "Public Key": toHex(publicKey)})
})

app.get('/sign',async (req, res) => {
try { 
    const PRIVATE_KEY = req.query.privateKey;
    // Hashes a message
    const mUtf8 = utf8ToBytes("the content doesn't matter");
    const hash = keccak256(mUtf8);

    // const hashed = hashMessage(msg);
    const signature = await secp256k1.sign(hash, PRIVATE_KEY);
    const {r, s, recovery} = signature;
    const sig = new secp256k1.Signature( BigInt(r.toString()),  BigInt(s.toString()), recovery)
    console.log(sig.recoverPublicKey(hash))
    // return signature;
    res.send({r:r.toString(), s:s.toString(), recovery})
}
catch(e)
{
  res.send(e);
}
 
// module.exports = signMessage;
})

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
