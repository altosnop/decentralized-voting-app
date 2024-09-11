// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let window: Window & typeof globalThis & { ethereum: any };

import { useState, useEffect, useCallback } from 'react';
import { BigNumber, ethers } from 'ethers';
import { contractABI, contractAddress } from './constants/constants';
import Login from './components/Login';
import Connected from './components/Connected';
import './App.css';

function App() {
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [candidates, setCandidates] = useState<
    { index: number; name: string; voteCount: number }[]
  >([]);
  const [userId, setUserId] = useState('');
  const [canVote, setCanVote] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const getProviderAndContract = useCallback(async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send('eth_requestAccounts', []);

    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(
      contractAddress,
      contractABI,
      signer,
    );

    return { provider, signer, contractInstance };
  }, []);

  const checkCanVote = useCallback(async () => {
    const { signer, contractInstance } = await getProviderAndContract();

    const signerAddress = await signer.getAddress();
    const voteStatus = await contractInstance.voters(signerAddress);

    setCanVote(voteStatus);
  }, [getProviderAndContract]);

  const getCandidates = useCallback(async () => {
    const { contractInstance } = await getProviderAndContract();
    const candidatesList = await contractInstance.getAllVotesOfCandiates();

    const formattedCandidates = candidatesList.map(
      (
        candidate: { index: number; name: string; voteCount: BigNumber },
        index: number,
      ) => {
        return {
          index,
          name: candidate.name,
          voteCount: candidate.voteCount.toNumber(),
        };
      },
    );

    setCandidates(formattedCandidates);
  }, [getProviderAndContract]);

  const handleAccountsChanged = useCallback(
    (accounts: string[]) => {
      if (accounts.length > 0 && account !== accounts[0]) {
        setAccount(accounts[0]);
        checkCanVote();
      } else {
        setIsConnected(false);
        setAccount('');
      }
    },
    [account, checkCanVote],
  );

  const connectToMetamask = useCallback(async () => {
    if (window.ethereum) {
      try {
        const { signer } = await getProviderAndContract();
        const address = await signer.getAddress();

        setAccount(address);
        setIsConnected(true);
        checkCanVote();
      } catch (err) {
        console.error(err);
      }
    } else {
      console.error('Metamask is not detected in the browser');
    }
  }, [getProviderAndContract, checkCanVote]);

  const vote = useCallback(async () => {
    setIsLoading(true);
    try {
      const { contractInstance } = await getProviderAndContract();

      const transaction = await contractInstance.vote(userId);
      await transaction.wait();

      checkCanVote();
      getCandidates();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [getProviderAndContract, userId, checkCanVote, getCandidates]);

  const handleNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setUserId(e.target.value);
    },
    [],
  );

  useEffect(() => {
    getCandidates();
    connectToMetamask();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          'accountsChanged',
          handleAccountsChanged,
        );
      }
    };
  }, [connectToMetamask, getCandidates, handleAccountsChanged]);

  return (
    <div className="App">
      {isConnected ? (
        <Connected
          account={account}
          candidates={candidates}
          userId={userId}
          isLoading={isLoading}
          handleNumberChange={handleNumberChange}
          voteFunction={vote}
          canVote={canVote}
        />
      ) : (
        <Login />
      )}
    </div>
  );
}

export default App;
