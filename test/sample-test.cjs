import  {expect} from 'chai';
import  {ethers} from 'hardhat';

describe('MyNFT', function() {
    it('Should mint and transfer an NFT to someone', async function() {
        const FiredGuys = await ethers.getContractFactory('FiredGuys');
        const firedGuys = await FiredGuys.deploy();
        await firedGuys.deployed();

        const recipient = ' 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

        const metadataURI = 'cid/test.png';

        let balance = await firedGuys.balanceOf(recipient);
        expect(balance).to.equal(0);

        const newlyMintedToken = await firedGuys.payToMint(recipient, metadataURI, {value: ethers.utils.parseEther('0.01')});


    });
});