const OrderManagement = artifacts.require("OrderManagement");
const Verifier = artifacts.require("Verifier");

module.exports = async function (deployer) {
  // Verifier sözleşmesini deploy et
  await deployer.deploy(Verifier);

  // Verifier sözleşmesinin adresini al
  const verifier = await Verifier.deployed();

  // OrderManagement sözleşmesini deploy et, verifier adresini constructor parametresi olarak geç
  await deployer.deploy(OrderManagement, verifier.address);
};