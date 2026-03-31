import { useEffect, useState } from 'react';
import useUser from '../useUser.js';
import { createPoll, getPolls, voteOnPoll } from '../pollApi.js';
import '../css/PollsPage.css';

export default function PollsPage() {
  const { user, isLoading } = useUser();
  const [polls, setPolls] = useState([]);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState('');
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!toast) return undefined;

    const timeoutId = setTimeout(() => setToast(''), 5000);
    return () => clearTimeout(timeoutId);
  }, [toast]);

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
      setMessage('Poll created successfully');

      await loadPolls();
    } catch (e) {
      setError(e.message);
    }
  }

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

      await loadPolls();
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

  if (isLoading || pageLoading) {
    return (
      <div className="movie-details__loading">
        <h1>Loading polls...</h1>
      </div>
    );
  }

  return (
    <div className="page-shell polls-page">
      <p className="polls-page__eyebrow">Shared picks and debates</p>
      <div className="polls-page__header">
        <div>
          <h1 className="page-title polls-page__title">User Polls</h1>
          <p className="polls-page__intro">
            Ranked by total votes so the most active conversations always stay first.
          </p>
        </div>
        <p className="polls-page__note"></p>
      </div>

      {error && <p>{error}</p>}
      {message && <p>{message}</p>}

      <div className="polls-page__list">
        {polls.length === 0 ? (
          <p>No polls yet.</p>
        ) : (
          polls.map((poll, index) => (
            <div key={poll.id} className="poll-card polls-page__card">
              <div className="polls-page__card-top">
                <p className="polls-page__rank">Rank {index + 1}</p>
                <p className="polls-page__total">{poll.totalVotes} votes</p>
              </div>
              <h2 className="polls-page__question">{poll.question}</h2>
              <p className="polls-page__creator">Created by: {poll.createdBy}</p>

              <div className="polls-page__options">
                {poll.options.map((option) => (
                  <div key={option.id} className="polls-page__option">
                    <div className="polls-page__option-copy">
                      <strong className="polls-page__option-title">{option.text}</strong>
                      <div className="polls-page__votes">{option.votes} votes</div>
                    </div>

                    <button onClick={() => handleVote(poll.id, option.id)} className="polls-page__vote-button">Vote</button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="polls-page__create">
        <button onClick={handleToggleCreatePoll} className="polls-page__create-toggle">
          {showCreatePoll ? 'Close Poll Creator' : 'Create New Poll'}
        </button>

        {showCreatePoll && (
          <div className="poll-card polls-page__create-panel">
            <h2 className="polls-page__create-title">Create a New Poll</h2>
            <p className="polls-page__create-copy">Add a question and at least two options.</p>

            <input
              type="text"
              placeholder="Poll question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="polls-page__question-input"
            />

            {options.map((option, index) => (
              <div key={index} className="polls-page__option-editor">
                <input
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />

                {options.length > 2 && (
                  <button onClick={() => handleRemoveOption(index)} className="polls-page__remove-button">Remove</button>
                )}
              </div>
            ))}

            <div className="polls-page__create-actions">
              {options.length < 5 && <button onClick={handleAddOption}>Add Option</button>}
              <button onClick={handleCreatePoll}>Create Poll</button>
            </div>
          </div>
        )}
      </div>

      {toast && <div className="app-toast">{toast}</div>}
    </div>
  );
}
