import { useEffect, useState } from 'react';
import useUser from '../useUser.js';
import { createPoll, getPolls, voteOnPoll } from '../pollApi.js';

export default function PollsPage() {
  const { user, isLoading } = useUser();
  const [polls, setPolls] = useState([]);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
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

  function handleOptionChange(index, value) {
    setOptions((current) =>
      current.map((option, i) => (i === index ? value : option))
    );
  }

  function handleAddOption() {
    if (options.length >= 4) return;
    setOptions((current) => [...current, '']);
  }

  function handleRemoveOption(index) {
    if (options.length <= 2) return;
    setOptions((current) => current.filter((_, i) => i !== index));
  }

  async function handleCreatePoll() {
    if (!user) {
      setError('Please log in to create a poll');
      return;
    }

    const cleanedOptions = options.map((option) => option.trim()).filter(Boolean);

    if (!question.trim() || cleanedOptions.length < 2) {
      setError('Please enter a question and at least 2 options');
      return;
    }

    try {
      setError('');
      setMessage('');

      const token = await user.getIdToken();

      await createPoll(token, {
        question,
        options: cleanedOptions,
      });

      setQuestion('');
      setOptions(['', '']);
      setShowCreatePoll(false);
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
    <div className="page-shell" style={{ maxWidth: '900px' }}>
      <h1 className="page-title" style={{ fontSize: 'clamp(2rem, 3vw, 3rem)' }}>User Polls</h1>

      {error && <p>{error}</p>}
      {message && <p>{message}</p>}

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
              }}
              className="poll-card"
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

      <div style={{ marginTop: '40px' }}>
        <button onClick={() => setShowCreatePoll((current) => !current)}>
          {showCreatePoll ? 'Close Poll Creator' : 'Create New Poll'}
        </button>

        {showCreatePoll && (
          <div
            style={{
              marginTop: '16px',
              padding: '20px',
            }}
            className="poll-card"
          >
            <h2>Create a New Poll</h2>

            <input
              type="text"
              placeholder="Poll question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              style={{ width: '100%', padding: '12px', marginBottom: '12px' }}
            />

            {options.map((option, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}
              >
                <input
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  style={{ flex: 1, padding: '12px' }}
                />

                {options.length > 2 && (
                  <button onClick={() => handleRemoveOption(index)}>Remove</button>
                )}
              </div>
            ))}

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              {options.length < 4 && (
                <button onClick={handleAddOption}>Add Option</button>
              )}
              <button onClick={handleCreatePoll}>Create Poll</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
