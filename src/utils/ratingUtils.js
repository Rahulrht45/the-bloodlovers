
/**
 * Utility functions for the Player Rating System
 * Designed for The Bloodlovers E-Sports Management System
 */

export const RATING_CONFIG = {
    'ALL ROUNDER': {
        pointsPerStar: 100,
        maxPoints: 500,
        weights: { kills: 0.3, damage: 0.2, survival: 0.2, wins: 0.2, assists: 0.1 }
    },
    'RUSHER': {
        pointsPerStar: 20,
        maxPoints: 100,
        weights: { kills: 0.5, damage: 0.3, survival: 0.1, wins: 0.1, assists: 0.0 }
    },
    'SNIPER': {
        pointsPerStar: 25,
        maxPoints: 125,
        weights: { kills: 0.4, damage: 0.4, survival: 0.1, wins: 0.1, assists: 0.0 }
    },
    'SUPPORT': {
        pointsPerStar: 15,
        maxPoints: 75,
        weights: { kills: 0.1, damage: 0.1, survival: 0.3, wins: 0.2, assists: 0.3 }
    },
    'BOMBER': {
        pointsPerStar: 20,
        maxPoints: 100,
        weights: { kills: 0.2, damage: 0.5, survival: 0.1, wins: 0.2, assists: 0.0 }
    },
    'COACH': {
        pointsPerStar: 10,
        maxPoints: 50,
        weights: { wins: 1.0 }
    },
    'DEFAULT': {
        pointsPerStar: 20,
        maxPoints: 100,
        weights: { kills: 0.2, damage: 0.2, survival: 0.2, wins: 0.2, assists: 0.2 }
    }
};

/**
 * Calculates the fill percentage for a specific star based on player rating and role
 */
export const getStarFill = (rating, role, starIndex) => {
    const roleUpper = (role || '').toUpperCase();
    const config = RATING_CONFIG[roleUpper] || RATING_CONFIG.DEFAULT;
    const pointsPerStar = config.pointsPerStar;
    
    const starValue = (starIndex + 1) * pointsPerStar;
    const prevStarValue = starIndex * pointsPerStar;
    
    if (rating >= starValue) return 100;
    if (rating > prevStarValue) return ((rating - prevStarValue) / pointsPerStar) * 100;
    return 0;
};

/**
 * Generates a performance breakdown based on rating, role and actual player stats
 */
export const getRatingBreakdown = (player, ratingOverride) => {
    if (!player) return [];
    
    const roleUpper = (player.role || '').toUpperCase();
    const config = RATING_CONFIG[roleUpper] || RATING_CONFIG.DEFAULT;
    const rating = ratingOverride !== undefined ? ratingOverride : (player.rating || 0);
    
    // If it's a simple display, distribute points based on weights
    const breakdown = Object.entries(config.weights).map(([stat, weight]) => {
        let label = stat.toUpperCase();
        if (stat === 'survival') label = 'SURVIVAL';
        
        return {
            n: label,
            p: (rating * weight).toFixed(1)
        };
    }).filter(item => parseFloat(item.p) > 0);

    // If it's an ALL ROUNDER, ensure we show at least a few categories
    if (roleUpper === 'ALL ROUNDER' && breakdown.length === 0) {
        return [
            { n: 'COMBAT', p: (rating * 0.4).toFixed(1) },
            { n: 'SURVIVAL', p: (rating * 0.3).toFixed(1) },
            { n: 'TEAMWORK', p: (rating * 0.3).toFixed(1) }
        ];
    }

    return breakdown.length > 0 ? breakdown : [{ n: 'PERFORMANCE', p: rating }];
};

/**
 * Suggests a rating based on raw stats
 */
export const calculateSuggestedRating = (player) => {
    if (!player) return 0;
    
    const kills = player.kills || 0;
    const damage = player.damage || 0;
    const wins = player.wins || 0;
    const assists = player.assists || 0;
    
    // Parse survival time (MM:SS)
    const timeStr = player.survival_time || '00:00';
    const [m, s] = timeStr.includes(':') ? timeStr.split(':').map(Number) : [Number(timeStr), 0];
    const survivalMinutes = m + (s / 60);

    // Baseline formula (can be tuned)
    const baseRating = (kills * 2) + (damage / 100) + (wins * 5) + (assists * 1) + (survivalMinutes / 5);
    
    const roleUpper = (player.role || '').toUpperCase();
    const config = RATING_CONFIG[roleUpper] || RATING_CONFIG.DEFAULT;
    
    // Clamp to max points
    return Math.min(parseFloat(baseRating.toFixed(1)), config.maxPoints);
};
