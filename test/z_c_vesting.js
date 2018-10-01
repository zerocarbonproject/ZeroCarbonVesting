const { expectThrow } = require('./helpers/expectThrow');

const BigNumber = web3.BigNumber;

const ZCVesting = artifacts.require("./ZCVesting.sol");
const ERC20Mock = artifacts.require("./mocks/ERC20Mock.sol");
const ZCDistMock = artifacts.require("./mocks/ZCDistMock.sol");

contract('ZCDistribution', function([_, ctcOwner, releaseWallet, wallet01, wallet02]) {

  // 150 000 000 Tokens
  const totalTokenSupply = new BigNumber('200000000000000000000000000');
  const stepAmount = new BigNumber('15000000000000000000000000');


  
  beforeEach(async function () {
    this.token = await ERC20Mock.new(ctcOwner, totalTokenSupply);
    this.zcdist = await ZCDistMock.new();
    this.zcvest = await ZCVesting.new(this.token.address, this.zcdist.address, releaseWallet);
  });

  it('Initial Setup', async function() {
    var balance = await this.token.balanceOf.call(releaseWallet);
    assert.isTrue(new BigNumber(0).eq(balance),'Expected release Wallet to be empty in start');
    balance = await this.token.balanceOf.call(this.zcvest.address);
    assert.isTrue(new BigNumber(0).eq(balance),'Expected vesting contract to have 0 tokens locked');
    balance = await this.zcvest.currentBalance.call();
    assert.isTrue(new BigNumber(0).eq(balance),'Expected vesting contract to have 0 tokens locked');
  });

  it('Test01: Step 0, release 0', async function() {
    await this.zcvest.release();
    var balance = await this.token.balanceOf.call(this.zcvest.address);
    assert.isTrue(new BigNumber(0).eq(balance),'Expected Vest to have 0 tokens found ' + balance);
    balance = await this.token.balanceOf.call(releaseWallet);
    assert.isTrue(new BigNumber(0).eq(balance),'Expected Release Wallet to 0 tokens found ' + balance);
  });
  
  it('Test02: Step 0, release 0, 1 mil', async function() {
    // Send 1 000 000 tokens to Vest
    await this.token.transfer(this.zcvest.address, new BigNumber('1000000000000000000000000'), {from : ctcOwner});
    await this.zcvest.release();
    var balance = await this.token.balanceOf.call(this.zcvest.address);
    assert.isTrue(new BigNumber('1000000000000000000000000').eq(balance),'Expected Vest to have 1,000,000 tokens found ' + balance);
    balance = await this.token.balanceOf.call(releaseWallet);
    assert.isTrue(new BigNumber(0).eq(balance),'Expected Release Wallet to 0 tokens found ' + balance);
  });

  it('Test03: 149 999.99...', async function() {
    // Send 1 000 000 tokens to Vest
    await this.token.transfer(this.zcvest.address, new BigNumber('1000000000000000000000000'), {from : ctcOwner});
    await this.zcdist.setSentAmount(stepAmount.sub(new BigNumber('1')));
    await this.zcvest.release();
    var balance = await this.token.balanceOf.call(this.zcvest.address);
    assert.isTrue(new BigNumber('1000000000000000000000000').eq(balance),'Expected Vest to have 1,000,000 tokens found ' + balance);
    balance = await this.token.balanceOf.call(releaseWallet);
    assert.isTrue(new BigNumber(0).eq(balance),'Expected Release Wallet to 0 tokens found ' + balance);
  });

  it('Test04: 150,000', async function() {
    // Send 1 000 000 tokens to Vest
    await this.token.transfer(this.zcvest.address, new BigNumber('1000000000000000000000000'), {from : ctcOwner});
    await this.zcdist.setSentAmount(stepAmount);
    await this.zcvest.release();
    var balance = await this.token.balanceOf.call(this.zcvest.address);
    assert.isTrue(new BigNumber('900000000000000000000000').eq(balance),'Expected Vest to have 900,000 tokens found ' + balance);
    balance = await this.token.balanceOf.call(releaseWallet);
    assert.isTrue(new BigNumber('100000000000000000000000').eq(balance),'Expected Release Wallet to 100,000 tokens found ' + balance);
    balance = await this.zcvest.currentBalance.call();
    assert.isTrue(new BigNumber('900000000000000000000000').eq(balance),'Expected Vest to have 900,000 tokens found ' + balance);
  });

  it('Test05: 150,000.0..1', async function() {
    // Send 1 000 000 tokens to Vest
    await this.token.transfer(this.zcvest.address, new BigNumber('1000000000000000000000000'), {from : ctcOwner});
    await this.zcdist.setSentAmount(stepAmount.add(new BigNumber(1)));
    await this.zcvest.release();
    var balance = await this.token.balanceOf.call(this.zcvest.address);
    assert.isTrue(new BigNumber('900000000000000000000000').eq(balance),'Expected Vest to have 900,000 tokens found ' + balance);
    balance = await this.token.balanceOf.call(releaseWallet);
    assert.isTrue(new BigNumber('100000000000000000000000').eq(balance),'Expected Release Wallet to 100,000 tokens found ' + balance);
  });

  it('Test06: Step 2 : 150,000', async function() {
    // Send 1 000 000 tokens to Vest
    await this.token.transfer(this.zcvest.address, new BigNumber('1000000000000000000000000'), {from : ctcOwner});
    await this.zcdist.setSentAmount(stepAmount);
    await this.zcvest.release();
    await this.zcvest.release();
    var balance = await this.token.balanceOf.call(this.zcvest.address);
    assert.isTrue(new BigNumber('900000000000000000000000').eq(balance),'Expected Vest to have 900,000 tokens found ' + balance);
    balance = await this.token.balanceOf.call(releaseWallet);
    assert.isTrue(new BigNumber('100000000000000000000000').eq(balance),'Expected Release Wallet to 100,000 tokens found ' + balance);
  });

  it('Test07: Step 2 : 150,0000.0..1', async function() {
    // Send 1 000 000 tokens to Vest
    await this.token.transfer(this.zcvest.address, new BigNumber('1000000000000000000000000'), {from : ctcOwner});
    await this.zcdist.setSentAmount(stepAmount);
    await this.zcvest.release();
    await this.zcdist.setSentAmount(stepAmount.sub(new BigNumber(1)));
    await this.zcvest.release();
    var balance = await this.token.balanceOf.call(this.zcvest.address);
    assert.isTrue(new BigNumber('900000000000000000000000').eq(balance),'Expected Vest to have 900,000 tokens found ' + balance);
    balance = await this.token.balanceOf.call(releaseWallet);
    assert.isTrue(new BigNumber('100000000000000000000000').eq(balance),'Expected Release Wallet to 100,000 tokens found ' + balance);
  });

  it('Test08: Full Release', async function() {
    // Send 1 000 000 tokens to Vest
    await this.token.transfer(this.zcvest.address, new BigNumber('1000000000000000000000000'), {from : ctcOwner});
    await this.zcdist.setSentAmount(stepAmount.mul(new BigNumber('10')));
    await this.zcvest.release();
    var balance = await this.token.balanceOf.call(this.zcvest.address);
    assert.isTrue(new BigNumber('0').eq(balance),'Expected Vest to have 0 tokens found ' + balance);
    balance = await this.token.balanceOf.call(releaseWallet);
    assert.isTrue(new BigNumber('1000000000000000000000000').eq(balance),'Expected Release Wallet to 1,000,000 tokens found ' + balance);
  });

  it('Test09: Step 3', async function() {
    // Send 1 000 000 tokens to Vest
    await this.token.transfer(this.zcvest.address, new BigNumber('1000000000000000000000000'), {from : ctcOwner});
    await this.zcdist.setSentAmount(stepAmount);
    await this.zcvest.release();
    var balance = await this.token.balanceOf.call(this.zcvest.address);
    assert.isTrue(new BigNumber('900000000000000000000000').eq(balance),'Expected Vest to have 900,000 tokens found ' + balance);
    balance = await this.token.balanceOf.call(releaseWallet);
    assert.isTrue(new BigNumber('100000000000000000000000').eq(balance),'Expected Release Wallet to 100,000 tokens found ' + balance);

    await this.zcdist.setSentAmount(new BigNumber('35000000000000000000000000'));
    await this.zcvest.release();
    await this.zcvest.release();
    balance = await this.token.balanceOf.call(this.zcvest.address);
    assert.isTrue(new BigNumber('800000000000000000000000').eq(balance),'Expected Vest to have 800,000 tokens found ' + balance);
    balance = await this.token.balanceOf.call(releaseWallet);
    assert.isTrue(new BigNumber('200000000000000000000000').eq(balance),'Expected Release Wallet to 200,000 tokens found ' + balance);

    await this.zcdist.setSentAmount(new BigNumber('350000000000000000000000000'));
    await this.zcvest.release();
    balance = await this.token.balanceOf.call(this.zcvest.address);
    assert.isTrue(new BigNumber('0').eq(balance),'Expected Vest to have 0 tokens found ' + balance);
    balance = await this.token.balanceOf.call(releaseWallet);
    assert.isTrue(new BigNumber('1000000000000000000000000').eq(balance),'Expected Release Wallet to 1,000,000 tokens found ' + balance);
  });

  it('Test10: Adding after', async function() {
    // Send 1 000 000 tokens to Vest
    await this.token.transfer(this.zcvest.address, new BigNumber('1000000000000000000000000'), {from : ctcOwner});
    await this.zcdist.setSentAmount(stepAmount);
    await this.zcvest.release();
    var balance = await this.token.balanceOf.call(this.zcvest.address);
    assert.isTrue(new BigNumber('900000000000000000000000').eq(balance),'Expected Vest to have 900,000 tokens found ' + balance);
    balance = await this.token.balanceOf.call(releaseWallet);
    assert.isTrue(new BigNumber('100000000000000000000000').eq(balance),'Expected Release Wallet to 100,000 tokens found ' + balance);

    await this.token.transfer(this.zcvest.address, new BigNumber('1000000000000000000000000'), {from : ctcOwner});
    await this.zcdist.setSentAmount(stepAmount.mul(new BigNumber('2')));
    await this.zcvest.release();
    balance = await this.token.balanceOf.call(this.zcvest.address);
    assert.isTrue(new BigNumber('1600000000000000000000000').eq(balance),'Expected Vest to have 1,600,000 tokens found ' + balance);
    balance = await this.token.balanceOf.call(releaseWallet);
    assert.isTrue(new BigNumber('400000000000000000000000').eq(balance),'Expected Release Wallet to 400,000 tokens found ' + balance);

    await this.zcdist.setSentAmount(stepAmount.mul(new BigNumber('10')));
    await this.zcvest.release();
    balance = await this.token.balanceOf.call(this.zcvest.address);
    assert.isTrue(new BigNumber('0').eq(balance),'Expected Vest to have 0 tokens found ' + balance);
    balance = await this.token.balanceOf.call(releaseWallet);
    assert.isTrue(new BigNumber('2000000000000000000000000').eq(balance),'Expected Release Wallet to 2,000,000 tokens found ' + balance);
  });
});
