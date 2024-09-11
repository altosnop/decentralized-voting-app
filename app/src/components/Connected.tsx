import { FC } from 'react';

interface Props {
  account: string;
  candidates: { index: number; name: string; voteCount: number }[];
  canVote: boolean;
  userId: string;
  isLoading: boolean;
  handleNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  voteFunction: () => void;
}

const Connected: FC<Props> = ({
  account,
  candidates,
  canVote,
  userId,
  isLoading,
  handleNumberChange,
  voteFunction,
}) => {
  console.log(isLoading);
  return (
    <div className="connected-container">
      <h1 className="connected-header">Vote For Candidates</h1>
      <p className="connected-account">
        Metamask Account: <code>{account}</code>
      </p>
      {canVote ? (
        <p className="connected-account">You have already voted</p>
      ) : (
        <div className="vote-wrapper">
          <input
            type="number"
            placeholder="Enter Candidate ID"
            value={userId}
            onChange={handleNumberChange}
          ></input>
          <br />
          <button
            className="login-button"
            onClick={voteFunction}
            disabled={isLoading}
          >
            Vote
          </button>
        </div>
      )}

      <table id="myTable" className="candidates-table">
        <thead>
          <tr>
            <th>Index</th>
            <th>Candidate name</th>
            <th>Candidate votes</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate, index) => (
            <tr key={index}>
              <td>{candidate.index}</td>
              <td>{candidate.name}</td>
              <td>{candidate.voteCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Connected;
