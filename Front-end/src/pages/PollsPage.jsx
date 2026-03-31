import { useEffect, useState } from 'react';
import useUser from '../useUser.js';
import { createPoll, getPolls, voteOnPoll } from '../pollApi.js';

export default function PollsPage() {
  const { user, isLoading } = useUser();
  const [polls, setPolls] = useState([]);
  const [question, setQuestion] = useState('');
  const [optionOne, setOptionOne] = useState('');
  const [optionTwo, setOptionTwo] = useState('');
  const [optionThree, setOptionThree] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [pageLoading, setPageLoading] = useState(true);

  async function loadPolls() {
    try {
      setError('');
      const data = await getPolls();
      setPolls(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setPageLoading(false);
    }
  }

  useEffect(() => {
    loadPolls();
  }, []);

  async function handleCreatePoll() {
    if (!user) {
      setError('Please log in to create a poll');
      return;
    }

    const options = [optionOne, optionTwo, optionThree].filter((option) =>
      option.trim()
    );

    if (!question.trim() || options.length < 2) {
      setError('Please enter a question and at least 2 options');
      return;
    }

    try {
      setError('');
      setMessage('');

      const token = await user.getIdToken();

      await createPoll(token, {
        question,
        options,
      });

      setQuestion('');
      setOptionOne('');
      setOptionTwo('');
      setOptionThree('');
      setMessage('Poll created successfully');

      await loadPolls();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleVote(pollId, pollOptionId) {
    if (!user) {
      setError('Please log in to vote');
      return;
    }

    try {
      setError('');
      setMessage('');

      const token = await user.getIdToken();

      await voteOnPoll(token, pollId, pollOptionId);
      setMessage('Vote submitted');

      await loadPolls();
    } catch (e) {
      setError(e.message);
    }
  }

  if (isLoading || pageLoading) {
    return (
      <div style={{ padding: '24px' }}>
        <h1>Loading polls...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '900px' }}>
      <h1>User Polls</h1>

      {error && <p>{error}</p>}
      {message && <p>{message}</p>}

      <div
        style={{
          marginTop: '24px',
          padding: '20px',
          border: '1px solid #333',
          borderRadius: '12px',
          background: '#181818',
        }}
      >
        <h2>Create a Poll</h2>

        <input
          type="text"
          placeholder="Poll question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{ width: '100%', padding: '12px', marginBottom: '12px' }}
        />

        <input
          type="text"
          placeholder="Option 1"
          value={optionOne}
          onChange={(e) => setOptionOne(e.target.value)}
          style={{ width: '100%', padding: '12px', marginBottom: '12px' }}
        />

        <input
          type="text"
          placeholder="Option 2"
          value={optionTwo}
          onChange={(e) => setOptionTwo(e.target.value)}
          style={{ width: '100%', padding: '12px', marginBottom: '12px' }}
        />

        <input
          type="text"
          placeholder="Option 3 (optional)"
          value={optionThree}
          onChange={(e) => setOptionThree(e.target.value)}
          style={{ width: '100%', padding: '12px', marginBottom: '12px' }}
        />

        <button onClick={handleCreatePoll}>Create Poll</button>
      </div>

      <div style={{ marginTop: '30px' }}>
        {polls.length === 0 ? (
          <p>No polls yet.</p>
        ) : (
          polls.map((poll, index) => (
            <div
              key={poll.id}
              style={{
                marginBottom: '20px',
                padding: '20px',
                border: '1px solid #333',
                borderRadius: '12px',
                background: '#181818',
              }}
            >
              <h2>
                #{index + 1} {poll.question}
              </h2>
              <p>Created by: {poll.createdBy}</p>
              <p>Total Votes: {poll.totalVotes}</p>

              <div style={{ marginTop: '12px' }}>
                {poll.options.map((option) => (
                  <div
                    key={option.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 0',
                      borderTop: '1px solid #333',
                    }}
                  >
                    <div>
                      <strong>{option.text}</strong>
                      <div>{option.votes} votes</div>
                    </div>

                    <button onClick={() => handleVote(poll.id, option.id)}>
                      Vote
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
