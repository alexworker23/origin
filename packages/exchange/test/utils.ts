import { ContractTransaction, Contract, ethers } from 'ethers';
import { Contracts } from '@energyweb/issuer';
import { getProviderWithFallback } from '@energyweb/utils-general';

const registryInterface = new ethers.utils.Interface(Contracts.IssuerJSON.abi);

const web3 = 'http://localhost:8580';

export const issueToken = async (
    issuer: Contract,
    address: string,
    amount: string,
    generationFrom: number,
    generationTo: number
) => {
    const deviceId = 'QWERTY123';

    const data = await issuer.encodeData(generationFrom, generationTo, deviceId);

    const requestReceipt = await ((await issuer.requestCertificationFor(
        data,
        address,
        false
    )) as ContractTransaction).wait();

    const [log] = requestReceipt.logs;

    const { name } = registryInterface.parseLog(log);
    const { _id: requestId } = registryInterface.decodeEventLog(name, log.data, log.topics);

    const validityData = registryInterface.encodeFunctionData('isRequestValid', [
        requestId.toString()
    ]);

    const approvalReceipt = await ((await issuer.approveCertificationRequest(
        requestId,
        amount,
        validityData
    )) as ContractTransaction).wait();

    const { args } = approvalReceipt.events.find((e) => e.event === 'CertificationRequestApproved');

    return args[2].toString();
};

export const depositToken = async (
    registry: Contract,
    sender: ethers.Wallet,
    to: string,
    amount: string,
    id: number
) => {
    const registryWithUserAsSigner = registry.connect(sender);

    await registryWithUserAsSigner.safeTransferFrom(sender.address, to, id, amount, '0x00');
};

export const provider = getProviderWithFallback(web3);

export const MWh = 10 ** 6;
