import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2, Zap, Upload, Shield, Trophy, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../supabase';
import './AuthPage.css';

const AuthPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(location.pathname === '/login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [teamName, setTeamName] = useState('');
    const [teamRole, setTeamRole] = useState('');
    const [tournamentExperience, setTournamentExperience] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('Image size should be less than 5MB');
                return;
            }
            setProfilePicture(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError('');
        }
    };

    const uploadProfilePicture = async (userId) => {
        if (!profilePicture) return null;

        const fileExt = profilePicture.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('profile-pictures')
            .upload(filePath, profilePicture, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) throw uploadError;

        // Get the public URL with proper format
        const { data } = supabase.storage
            .from('profile-pictures')
            .getPublicUrl(filePath);

        return data.publicUrl;
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (isLogin) {
                // Login Logic
                const { data, error: loginError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (loginError) throw loginError;

                setSuccess('Authentication successful! Establishing neural link...');
                setTimeout(() => navigate('/'), 1500);
            } else {
                // Sign Up Logic
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            team_name: teamName,
                            team_role: teamRole,
                            tournament_experience: tournamentExperience,
                        }
                    }
                });

                if (signUpError) throw signUpError;

                let avatarUrl = null;

                // Upload profile picture if provided
                // Note: Upload works with the service role key, doesn't require active session
                if (profilePicture && data.user) {
                    try {
                        avatarUrl = await uploadProfilePicture(data.user.id);
                        console.log('Profile picture uploaded:', avatarUrl);

                        // Update user metadata with avatar URL
                        if (avatarUrl) {
                            const { error: updateError } = await supabase.auth.updateUser({
                                data: {
                                    avatar_url: avatarUrl
                                }
                            });

                            if (updateError) {
                                console.error('Failed to update user metadata:', updateError);
                            } else {
                                console.log('User metadata updated with avatar URL');

                                // FORCE SYNC to players table (since trigger ran before upload)
                                const { error: playerUpdateError } = await supabase
                                    .from('players')
                                    .update({ avatar: avatarUrl })
                                    .eq('user_id', data.user.id);

                                if (playerUpdateError) console.error('Failed to sync avatar to players table:', playerUpdateError);
                                else console.log('Players table synced with avatar URL');
                            }
                        }
                    } catch (uploadError) {
                        console.error('Profile picture upload failed:', uploadError);
                        // Don't fail registration if upload fails
                    }
                }

                // Note: Player profile is automatically created by database trigger
                // when a new user is created in auth.users table

                setSuccess('Registration successful! Check your email for verification.');
            }
        } catch (err) {
            setError(err.message || 'An error occurred during authentication.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: isLogin ? '450px' : '550px' }}>
                <div className="auth-header">
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                        <div style={{
                            background: 'var(--neon-cyan)',
                            padding: '10px',
                            borderRadius: '12px',
                            boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)'
                        }}>
                            <Zap size={24} color="#000" />
                        </div>
                    </div>
                    <h1>{isLogin ? 'LOGIN' : 'SIGN UP'}</h1>
                    <p>{isLogin ? 'Welcome back, Operative' : 'Join the Elite Ranks'}</p>
                </div>

                <div className="auth-toggle">
                    <button
                        className={`auth-toggle-btn ${isLogin ? 'active' : ''}`}
                        onClick={() => { setIsLogin(true); navigate('/login'); setError(''); }}
                    >
                        LOGIN
                    </button>
                    <button
                        className={`auth-toggle-btn ${!isLogin ? 'active' : ''}`}
                        onClick={() => { setIsLogin(false); navigate('/signup'); setError(''); }}
                    >
                        SIGN UP
                    </button>
                </div>

                {error && <div className="auth-error">{error}</div>}
                {success && <div className="auth-success">{success}</div>}

                <form onSubmit={handleAuth}>
                    {!isLogin && (
                        <>
                            {/* Profile Picture Upload */}
                            <div className="auth-form-group">
                                <label>Profile Picture</label>
                                <div className="profile-picture-upload">
                                    <div className="upload-preview">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" className="preview-image" />
                                        ) : (
                                            <div className="upload-placeholder">
                                                <Upload size={32} />
                                                <span>Upload Avatar</span>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        id="profile-picture"
                                        className="file-input"
                                    />
                                    <label htmlFor="profile-picture" className="upload-btn">
                                        Choose Image
                                    </label>
                                </div>
                            </div>

                            {/* Full Name */}
                            <div className="auth-form-group">
                                <label>Full Name / IGN</label>
                                <div className="auth-input-wrapper">
                                    <input
                                        type="text"
                                        placeholder="Enter your name or IGN"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required={!isLogin}
                                    />
                                    <User className="auth-input-icon" size={18} />
                                </div>
                            </div>

                            {/* Team Name */}
                            <div className="auth-form-group">
                                <label>Team Name</label>
                                <div className="auth-input-wrapper">
                                    <input
                                        type="text"
                                        placeholder="e.g., Team Alpha, Bloodlovers"
                                        value={teamName}
                                        onChange={(e) => setTeamName(e.target.value)}
                                    />
                                    <Shield className="auth-input-icon" size={18} />
                                </div>
                            </div>

                            {/* Team Role */}
                            <div className="auth-form-group">
                                <label>Team Role</label>
                                <div className="auth-input-wrapper">
                                    <select
                                        value={teamRole}
                                        onChange={(e) => setTeamRole(e.target.value)}
                                        className="auth-select"
                                    >
                                        <option value="">Select your role</option>
                                        <option value="RUSHER">RUSHER</option>
                                        <option value="SUPPORT">SUPPORT</option>
                                        <option value="BOMBER">BOMBER</option>
                                        <option value="SNIPER">SNIPER</option>
                                        <option value="RIFLER">RIFLER</option>
                                        <option value="COACH">COACH</option>
                                        <option value="MANAGER">MANAGER</option>
                                        <option value="ANALYST">ANALYST</option>
                                    </select>
                                    <User className="auth-input-icon" size={18} />
                                </div>
                            </div>

                            {/* Tournament Experience */}
                            <div className="auth-form-group">
                                <label>Tournament Experience</label>
                                <div className="auth-input-wrapper">
                                    <select
                                        value={tournamentExperience}
                                        onChange={(e) => setTournamentExperience(e.target.value)}
                                        className="auth-select"
                                    >
                                        <option value="">Select experience level</option>
                                        <option value="Beginner (1-2 years)">Beginner (1-2 years)</option>
                                        <option value="Advanced (2-3 years)">Advanced (2-3 years)</option>
                                        <option value="Elite (4 years)">Elite (4 years)</option>
                                        <option value="Professional (5 years)">Professional (5 years)</option>
                                    </select>
                                    <Trophy className="auth-input-icon" size={18} />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="auth-form-group">
                        <label>Email Address</label>
                        <div className="auth-input-wrapper">
                            <input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <Mail className="auth-input-icon" size={18} />
                        </div>
                    </div>

                    <div className="auth-form-group">
                        <label>Secure Password</label>
                        <div className="auth-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <Lock className="auth-input-icon" size={18} />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                        {loading ? (
                            <Loader2 className="loader" size={20} />
                        ) : (
                            <>
                                {isLogin ? 'LOG IN' : 'SIGN UP'}
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    {isLogin ? (
                        <>
                            Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(false); navigate('/signup'); }}>Join Now</a>
                        </>
                    ) : (
                        <>
                            Already a member? <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(true); navigate('/login'); }}>Sign In</a>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
