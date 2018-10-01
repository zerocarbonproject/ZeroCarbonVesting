const BigNumber = web3.BigNumber;

const ZCDistMock = artifacts.require("./mocks/ZCDistMock.sol");

contract('ZCDistMock', function([_, ctcOwner, anyone]) {

  describe('Test Construct', async function() {

    beforeEach(async function () {
      this.zcdist = await ZCDistMock.new();
    });

    it("Start amount 0", async function() {
      var amount = await this.zcdist.getSentAmount.call();
      assert.isTrue(new BigNumber(0).eq(amount));
    });

    it("Set/Get Amount", async function() {
      let val = new BigNumber(500);
      await this.zcdist.setSentAmount(val);
      var amount = await this.zcdist.getSentAmount.call();
      assert.isTrue(val.eq(amount), "Expected " + val + " Found " + amount);
    });
  });
});
