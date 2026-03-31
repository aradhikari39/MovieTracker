import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useUser from '../useUser.js';
import { createPoll, getPolls, voteOnPoll } from '../pollApi.js';

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useUser();

  const [topPolls, setTopPolls] = useState([]);
  const [question, setQuestion] = useState('');
  const [optionOne, setOptionOne] = useState('');
  const [optionTwo, setOptionTwo] = useState('');
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadTopPolls() {
    try {
      setError('');
      const polls = await getPolls();
      setTopPolls(polls.slice(0, 2));
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    loadTopPolls();
  }, []);

  async function handleVote(pollId, pollOptionId) {
    if (!user) {
      setError('Please log in to vote on polls');
      return;
    }

    try {
      setError('');
      setMessage('');

      const token = await user.getIdToken();
      await voteOnPoll(token, pollId, pollOptionId);

      setMessage('Vote submitted');
      await loadTopPolls();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleCreatePoll() {
    if (!user) {
      setError('Please log in to create a poll');
      return;
    }

    if (!question.trim() || !optionOne.trim() || !optionTwo.trim()) {
      setError('Please enter a question and 2 options');
      return;
    }

    try {
      setError('');
      setMessage('');

      const token = await user.getIdToken();

      await createPoll(token, {
        question,
        options: [optionOne, optionTwo],
      });

      setQuestion('');
      setOptionOne('');
      setOptionTwo('');
      setShowCreatePoll(false);
      setMessage('Poll created');

      await loadTopPolls();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="page-shell">
      <section
        style={{
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <h1 className="page-title">MovieTracker</h1>
        <p className="page-subtitle" style={{ marginBottom: '24px' }}>
          Track your movies privately, build watchlists, save personal ratings,
          and keep your own movie notes in one place.
        </p>

        <div
          onClick={() => navigate('/search')}
          className="hero-search"
        >
          Search for any movie...
        </div>
      </section>

      <section style={{ paddingTop: '60px' }}>
        <h2 className="section-heading">Top User Polls</h2>
        <p>These are the top 2 most-voted polls across users.</p>

        {error && <p>{error}</p>}
        {message && <p>{message}</p>}

        {topPolls.length === 0 ? (
          <p>No polls yet.</p>
        ) : (
          <div style={{ marginTop: '20px' }}>
            {topPolls.map((poll, index) => (
              <div
                key={poll.id}
                style={{
                  marginBottom: '20px',
                  padding: '20px',
                }}
                className="poll-card"
              >
                <h3>
                  #{index + 1} {poll.question}
                </h3>
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
            ))}
          </div>
        )}

        <div style={{ marginTop: '30px' }}>
          <button onClick={() => setShowCreatePoll((current) => !current)}>
            {showCreatePoll ? 'Close Poll Creator' : 'Add a Poll'}
          </button>

          {showCreatePoll && (
            <div
              style={{
                marginTop: '16px',
                padding: '20px',
                border: '1px solid #333',
                borderRadius: '12px',
                background: '#181818',
                maxWidth: '700px',
              }}
            >
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

              <button onClick={handleCreatePoll}>Create Poll</button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
