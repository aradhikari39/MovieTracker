import { useNavigate } from 'react-router-dom';

const features = [
    { title: 'User Polls', clickable: true, path: '/polls' },
    { title: 'Movie Quiz', clickable: false },
    { title: 'Daily Challenge', clickable: false },
    { title: 'Movie Battles', clickable: false },
    { title: 'Guess the Poster', clickable: false },
    { title: 'Random: Did You Know ?', clickable: false },
];

export default function FeaturesPage() {
    const navigate = useNavigate();

    return (
        <div className="page-shell">
            <h1 className="page-title" style={{ fontSize: 'clamp(2rem, 3vw, 3rem)' }}>Features</h1>
            <p>Only User Polls is active for now. Other features will come later.</p>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '18px',
                    marginTop: '24px',
                }}
            >
                {features.map((feature) => (
                    <button
                        key={feature.title}
                        onClick={() => feature.clickable && navigate(feature.path)}
                        disabled={!feature.clickable}
                        style={{
                            padding: '24px',
                            minHeight: '140px',
                            background: feature.clickable ? '#1b1b1b' : '#111',
                            color: feature.clickable ? 'white' : '#777',
                            cursor: feature.clickable ? 'pointer' : 'not-allowed',
                            textAlign: 'left',
                        }}
                        className="feature-card"
                    >
                        <h2 style={{ marginTop: 0 }}>{feature.title}</h2>
                        <p>
                            {feature.clickable
                                ? 'Available now'
                                : 'Coming in a future update'}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
}
