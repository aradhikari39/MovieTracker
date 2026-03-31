import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useUser from '../useUser.js';
import { createPoll, getPolls, voteOnPoll } from '../pollApi.js';
import '../css/HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useUser();

  const [topPolls, setTopPolls] = useState([]);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!toast) return undefined;

    const timeoutId = setTimeout(() => setToast(''), 5000);
    return () => clearTimeout(timeoutId);
  }, [toast]);

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
      setToast('You have to log in to vote');
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
      setToast('You have to log in to create a poll');
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
      setMessage('Poll created');

      await loadTopPolls();
    } catch (e) {
      setError(e.message);
    }
  }

  function handleToggleCreatePoll() {
    if (!user) {
      setToast('You have to log in to create a poll');
      return;
    }

    setShowCreatePoll((current) => !current);
  }

  function handleOptionChange(index, value) {
    setOptions((current) => current.map((option, i) => (i === index ? value : option)));
  }

  function handleAddOption() {
    if (options.length >= 5) return;
    setOptions((current) => [...current, '']);
  }

  function handleRemoveOption(index) {
    if (options.length <= 2) return;
    setOptions((current) => current.filter((_, i) => i !== index));
  }

  return (
    <div className="page-shell">
      <section className="home-page__hero">
        <div className="home-page__hero-copy">
          <p className="home-page__eyebrow">Private movie journaling</p>
          <h1 className="page-title home-page__title">MovieTracker</h1>
          <p className="page-subtitle home-page__subtitle">
            Track your movies privately, save personal ratings, build watchlist and save your movie notes, all in one place
          </p>
        </div>

        <div className="home-page__search-wrap">
          <div onClick={() => navigate('/search')} className="hero-search">
            Search for any movie...
          </div>
          <p className="home-page__search-note"></p>
        </div>
      </section>

      <section className="home-page__polls">
        <div className="home-page__section-head">
          <div>
            <p className="home-page__eyebrow">Community pulse</p>
            <h2 className="section-heading home-page__section-title">Top User Polls</h2>
          </div>
          <p className="home-page__section-copy"></p>
        </div>

        {error && <p>{error}</p>}
        {message && <p>{message}</p>}

        {topPolls.length === 0 ? (
          <p>No polls yet.</p>
        ) : (
          <div className="home-page__poll-list">
            {topPolls.map((poll, index) => (
              <div key={poll.id} className="poll-card home-page__poll-card">
                <div className="home-page__poll-card-top">
                  <p className="home-page__poll-rank">Top {index + 1}</p>
                  <p className="home-page__poll-total">{poll.totalVotes} votes</p>
                </div>
                <h3 className="home-page__poll-question">{poll.question}</h3>

                <div className="home-page__poll-options">
                  {poll.options.map((option) => (
                    <div key={option.id} className="home-page__poll-option">
                      <div className="home-page__poll-option-copy">
                        <strong className="home-page__poll-option-title">{option.text}</strong>
                        <div className="home-page__poll-votes">{option.votes} votes</div>
                      </div>

                      <button onClick={() => handleVote(poll.id, option.id)} className="home-page__vote-button">
                        Vote
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="home-page__create">
          <button onClick={handleToggleCreatePoll} className="home-page__create-toggle">
            {showCreatePoll ? 'Close Poll Creator' : 'Add a Poll'}
          </button>

          {showCreatePoll && (
            <div className="poll-card home-page__create-panel">
              <h3 className="home-page__create-title">Start a quick community poll</h3>
              <p className="home-page__create-copy">Add a question and choose between 2 and 5 options.</p>
              <input
                type="text"
                placeholder="Poll question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="home-page__create-input"
              />

              {options.map((option, index) => (
                <div key={index} className="home-page__option-editor">
                  <input
                    type="text"
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="home-page__create-input"
                  />
                  {options.length > 2 && (
                    <button onClick={() => handleRemoveOption(index)} className="home-page__remove-button">Remove</button>
                  )}
                </div>
              ))}

              <div className="home-page__create-actions">
                {options.length < 5 && <button onClick={handleAddOption}>Add Option</button>}
                <button onClick={handleCreatePoll} className="home-page__create-submit">Create Poll</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {toast && <div className="app-toast">{toast}</div>}
    </div>
  );
}
