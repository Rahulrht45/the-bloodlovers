import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Upload, Shield, Trophy, Mail, ArrowLeft, Save, Loader2, Smartphone } from 'lucide-react';
import { supabase } from '../supabase';
import { getStarFill, getRatingBreakdown } from '../utils/ratingUtils';
import './ProfilePage.css';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [playerData, setPlayerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form states
    const [ign, setIgn] = useState('');
    const [inGameUid, setInGameUid] = useState('');
    const [team, setTeam] = useState('');
    const [role, setRole] = useState('');
    const [phone, setPhone] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [currentAvatar, setCurrentAvatar] = useState('');
    const [walletBalance, setWalletBalance] = useState(0);


    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                navigate('/login');
                return;
            }

            setUser(user);

            // Fetch player data
            const { data: playerData, error: playerError } = await supabase
                .from('players')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (!playerError && playerData) {
                setPlayerData(playerData);
                setIgn(playerData.ign || '');
                setInGameUid(playerData.in_game_uid || '');
                setTeam(playerData.team || '');
                setRole(playerData.role || '');
                setPhone(playerData.phone || '');
                setCurrentAvatar(playerData.avatar || '');
                setPreviewUrl(playerData.avatar || '');

                if (playerData.in_game_uid) {
                    // Fetch source of truth balance instead of localStorage
                    const { data: userData } = await supabase
                        .from('users')
                        .select('global_credit')
                        .eq('id', user.id)
                        .single();

                    setWalletBalance(Number(userData?.global_credit || 0));
                }
            }

            setLoading(false);
        } catch (err) {
            console.error('Error fetching user:', err);
            setError('Failed to load profile');
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return;
            }
            setProfilePicture(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError('');
        }
    };

    const uploadProfilePicture = async (userId) => {
        if (!profilePicture) return currentAvatar;

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

        const { data } = supabase.storage
            .from('profile-pictures')
            .getPublicUrl(filePath);

        return data.publicUrl;
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        if (phone && !/^\d{11}$/.test(phone)) {
            setError('bKash number must be exactly 11 digits (e.g., 01XXXXXXXXX).');
            setSaving(false);
            return;
        }

        try {
            let avatarUrl = currentAvatar;

            // Upload new profile picture if selected
            if (profilePicture && user) {
                avatarUrl = await uploadProfilePicture(user.id);

                // Update user metadata
                await supabase.auth.updateUser({
                    data: {
                        avatar_url: avatarUrl,
                        full_name: ign
                    }
                });
            }

            // Update player profile
            const { error: updateError } = await supabase
                .from('players')
                .update({
                    ign: ign,
                    in_game_uid: inGameUid,
                    team: team,
                    role: role,
                    phone: phone,
                    avatar: avatarUrl
                })
                .eq('user_id', user.id);

            if (updateError) throw updateError;

            setSuccess('Profile updated successfully!');
            setCurrentAvatar(avatarUrl);
            setProfilePicture(null);

            // Refresh player data
            setTimeout(() => {
                checkUser();
                setSuccess('');
            }, 2000);

        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="profile-container">
                <div className="loading-state">
                    <Loader2 className="spinner" size={40} />
                    <p>Loading Profile...</p>
                </div>
            </div>
        );
    }

    if (!user || !playerData) {
        return (
            <div className="profile-container">
                <div className="error-state">
                    <p>Failed to load profile data</p>
                    <button onClick={() => navigate('/')} className="btn-primary">
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-card">
                <button onClick={() => navigate('/')} className="back-button">
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </button>

                <div className="profile-header">
                    <h1>EDIT PROFILE</h1>
                    <p>Update your player information</p>
                </div>

                {/* Wallet Balance Display */}
                {inGameUid && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-[#ff1a1a]/10 to-[#ff1a1a]/5 border border-[#ff1a1a]/30 rounded-xl">
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Your Wallet Balance</div>
                                <div className="text-3xl font-black italic text-[#ff1a1a]">
                                    ৳{walletBalance.toLocaleString()}
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/wallet')}
                                className="px-4 py-2 bg-[#ff1a1a]/20 hover:bg-[#ff1a1a]/40 text-[#ff1a1a] rounded-lg text-sm font-bold transition-all"
                            >
                                View Wallet
                            </button>
                        </div>
                        {!localStorage.getItem(`player_wallet_uid_${inGameUid}`) && (
                            <p className="text-xs text-gray-500 mt-2">
                                Your wallet will be created after your first match distribution
                            </p>
                        )}
                    </div>
                )}

                {error && <div className="profile-error">{error}</div>}
                {success && <div className="profile-success">{success}</div>}

                <form onSubmit={handleSaveProfile}>
                    {/* Profile Picture */}
                    <div className="profile-form-group">
                        <label>Profile Picture</label>
                        <div className="profile-picture-upload">
                            <div className="upload-preview-large">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="preview-image-large" />
                                ) : (
                                    <div className="upload-placeholder-large">
                                        <Upload size={48} />
                                        <span>Upload Avatar</span>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                id="profile-picture-edit"
                                className="file-input"
                            />
                            <label htmlFor="profile-picture-edit" className="upload-btn-large">
                                Choose New Image
                            </label>
                        </div>
                    </div>

                    {/* IGN */}
                    <div className="profile-form-group">
                        <label>IGN / Player Name</label>
                        <div className="profile-input-wrapper">
                            <input
                                type="text"
                                placeholder="Enter your IGN"
                                value={ign}
                                onChange={(e) => setIgn(e.target.value)}
                                required
                            />
                            <User className="profile-input-icon" size={18} />
                        </div>
                    </div>

                    {/* In-Game UID */}
                    <div className="profile-form-group">
                        <label>Player In-Game UID</label>
                        <div className="profile-input-wrapper">
                            <input
                                type="text"
                                placeholder="Enter your in-game UID"
                                value={inGameUid}
                                onChange={(e) => setInGameUid(e.target.value)}
                            />
                            <Trophy className="profile-input-icon" size={18} />
                        </div>
                    </div>

                    {/* Team */}
                    <div className="profile-form-group">
                        <label>Team Name</label>
                        <div className="profile-input-wrapper">
                            <input
                                type="text"
                                placeholder="e.g., Team Alpha, Bloodlovers"
                                value={team}
                                onChange={(e) => setTeam(e.target.value)}
                            />
                            <Shield className="profile-input-icon" size={18} />
                        </div>
                    </div>

                    {/* Role */}
                    <div className="profile-form-group">
                        <label>Team Role</label>
                        <div className="profile-input-wrapper">
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="profile-select"
                            >
                                <option value="">Select your role</option>
                                <option value="RUSHER">RUSHER</option>
                                <option value="SUPPORT">SUPPORT</option>
                                <option value="BOMBER">BOMBER</option>
                                <option value="SNIPER">SNIPER</option>
                                <option value="ALL ROUNDER">ALL ROUNDER</option>
                                <option value="COACH">COACH</option>
                                <option value="MANAGER">MANAGER</option>
                                <option value="ANALYST">ANALYST</option>
                            </select>
                            <User className="profile-input-icon" size={18} />
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div className="profile-form-group">
                        <label>bKash (Personal)</label>
                        <div className="profile-input-wrapper">
                            <input
                                type="tel"
                                placeholder="01XXXXXXXXX"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                maxLength={11}
                            />
                            <Smartphone className="profile-input-icon" size={18} />
                        </div>
                    </div>

                    {/* Email (Read-only) */}
                    <div className="profile-form-group">
                        <label>Email (Cannot be changed)</label>
                        <div className="profile-input-wrapper">
                            <input
                                type="email"
                                value={user.email}
                                disabled
                                className="input-disabled"
                            />
                            <Mail className="profile-input-icon" size={18} />
                        </div>
                    </div>

                    {/* Stats (Read-only) */}
                    <div className="profile-stats-section">
                        <h3>Your Stats</h3>
                        <div className="stats-grid">
                            <div className="stat-box">
                                <div className="stat-value">{playerData.kills || 0}</div>
                                <div className="stat-label">KILLS</div>
                            </div>
                            <div className="stat-box">
                                <div className="stat-value">{playerData.wins || 0}</div>
                                <div className="stat-label">WINS</div>
                            </div>
                            <div className="stat-box">
                                <div className="stat-value">{playerData.mvp_points || 0}</div>
                                <div className="stat-label">MVP</div>
                            </div>
                            <div className="stat-box group relative" style={{ border: '1px solid #ff1a1a', background: 'rgba(255, 26, 26, 0.05)', minWidth: '180px' }}>
                                <div className="flex justify-center gap-1 mb-2">
                                    {[...Array(5)].map((_, i) => {
                                        const fill = getStarFill(playerData.rating, playerData.role, i);
                                        return (
                                            <div key={i} className="relative w-5 h-5">
                                                <Star size={20} className="text-white/10 fill-current" />
                                                <div className="absolute inset-0 overflow-hidden" style={{ width: `${fill}%` }}>
                                                    <Star size={20} className="text-[#ff1a1a] fill-current drop-shadow-[0_0_8px_rgba(255,26,26,0.6)]" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="stat-value" style={{ color: '#ff1a1a', fontSize: '1.5rem' }}>{playerData.rating || 0}</div>
                                <div className="stat-label" style={{ color: '#ff1a1a', fontSize: '0.7rem' }}>PERFORMANCE RATING</div>
                                
                                {/* Hover Breakdown */}
                                <div className="absolute top-full left-0 w-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-black/80 backdrop-blur-md p-3 rounded-xl border border-[#ff1a1a]/30 pointer-events-none">
                                    <div className="space-y-1.5">
                                        {getRatingBreakdown(playerData.rating, playerData.role).map((stat, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-[10px]">
                                                <span className="text-gray-400 uppercase font-black tracking-widest">{stat.n}</span>
                                                <span className="text-red-500 font-black">{stat.p} pts</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="profile-save-btn" disabled={saving}>
                        {saving ? (
                            <>
                                <Loader2 className="spinner" size={20} />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Save Changes
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
