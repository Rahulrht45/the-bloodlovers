import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Upload, Shield, Trophy, Mail, ArrowLeft, Save, Loader2, Smartphone } from 'lucide-react';
import { supabase } from '../supabase';
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
                    <div className="mb-6 p-4 bg-gradient-to-r from-[#FBBC04]/10 to-[#F59E0B]/10 border border-[#FBBC04]/30 rounded-xl">
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Your Wallet Balance</div>
                                <div className="text-3xl font-black italic text-[#FBBC04]">
                                    ৳{walletBalance.toLocaleString()}
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/wallet')}
                                className="px-4 py-2 bg-[#FBBC04]/20 hover:bg-[#FBBC04]/40 text-[#FBBC04] rounded-lg text-sm font-bold transition-all"
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
                                <option value="RIFLER">RIFLER</option>
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
